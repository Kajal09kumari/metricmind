/**
 * @file Enterprise Governance & Policy Engine
 * @module lib/governance/engine
 * @description
 * Enforces organizational data governance policies, computational budget guardrails,
 * cardinality limits, and metric allowlists. Acts as the gatekeeper preventing
 * runaway AI agent reasoning loops, compute quota exhaustion, and unauthorized aggregations.
 */

import {
  SemanticQuery,
  GovernanceValidationResult,
  GovernanceLimits,
} from "@/types";
import { DEFAULT_GOVERNANCE_LIMITS } from "./limits";
import { semanticValidator } from "@/lib/semantic/validator";
import { semanticRegistry } from "@/lib/semantic/registry";

/**
 * Enterprise Governance Engine enforcing strict query policies and runtime budgets.
 */
export class GovernanceEngine {
  /** Configured runtime guardrail boundaries */
  private limits: GovernanceLimits;

  /**
   * Initializes the Governance Engine with enterprise limit policies.
   * @param limits Optional custom limits; defaults to DEFAULT_GOVERNANCE_LIMITS
   */
  constructor(limits: GovernanceLimits = DEFAULT_GOVERNANCE_LIMITS) {
    this.limits = limits;
  }

  /**
   * Validates a candidate semantic query against all active governance rules.
   *
   * Enforced Policies:
   * 1. Schema integrity & Zod validation
   * 2. Max breakdown dimension limits (prevents Cartesian explosion)
   * 3. Max row count capping (protects bandwidth & client memory)
   * 4. Metric-dimension compatibility allowlist checks
   *
   * @param query Candidate SemanticQuery AST
   * @returns GovernanceValidationResult with validity flag, errors, warnings, and sanitized query
   */
  public validateSemanticQuery(query: unknown): GovernanceValidationResult {
    // 1. Run Semantic Layer Schema and Definition Validation
    const validation = semanticValidator.validateQuery(query);
    if (!validation.valid || !validation.sanitizedQuery) {
      return validation;
    }

    const sanitized = validation.sanitizedQuery;
    const errors: string[] = [...validation.errors];
    const warnings: string[] = [...validation.warnings];

    // 2. Governance Rule: Limit Dimension Cardinality & Combinations
    if (sanitized.dimensions && sanitized.dimensions.length > this.limits.maxBreakdownDimensions) {
      errors.push(
        `Governance Policy Violation: Query requests ${sanitized.dimensions.length} breakdown dimensions, which exceeds the limit of ${this.limits.maxBreakdownDimensions}.`
      );
    }

    // 3. Governance Rule: Cap Max Rows Returned
    if (sanitized.limit && sanitized.limit > this.limits.maxRowsReturned) {
      warnings.push(
        `Requested row limit (${sanitized.limit}) exceeds governance limit (${this.limits.maxRowsReturned}). Automatically capped.`
      );
      sanitized.limit = this.limits.maxRowsReturned;
    }

    // 4. Governance Rule: Restrict Unauthorized Dimensions for Sensitive Metrics
    for (const metricName of sanitized.metrics) {
      const metricDef = semanticRegistry.getMetric(metricName);
      if (metricDef) {
        for (const dimName of sanitized.dimensions || []) {
          if (!metricDef.allowedDimensions.includes(dimName)) {
            errors.push(
              `Governance Policy: Metric '${metricDef.label}' cannot be aggregated by '${dimName}'. Allowed dimensions: ${metricDef.allowedDimensions.join(", ")}`
            );
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      sanitizedQuery: sanitized,
    };
  }

  /**
   * Evaluates the current agent execution budget to prevent runaway queries or unbounded reasoning loops.
   *
   * @param currentQueryCount Total warehouse queries executed so far in the current session
   * @param currentStepCount Total agent reasoning steps executed so far
   * @returns Allowed status and cancellation rationale if budget is exceeded
   */
  public checkExecutionBudget(currentQueryCount: number, currentStepCount: number): {
    allowed: boolean;
    reason?: string;
  } {
    if (currentQueryCount >= this.limits.maxQueriesPerQuestion) {
      return {
        allowed: false,
        reason: `Governance Limit Reached: Maximum allowed warehouse queries per question (${this.limits.maxQueriesPerQuestion}) has been reached to protect warehouse compute resources.`,
      };
    }

    if (currentStepCount >= this.limits.maxAgentSteps) {
      return {
        allowed: false,
        reason: `Governance Limit Reached: Maximum agent reasoning steps (${this.limits.maxAgentSteps}) has been reached to prevent unbounded exploratory loops.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Retrieves a copy of the active governance limits.
   * @returns Current GovernanceLimits object
   */
  public getLimits(): GovernanceLimits {
    return { ...this.limits };
  }
}

/**
 * Singleton instance of the Enterprise Governance Engine.
 */
export const governanceEngine = new GovernanceEngine();
