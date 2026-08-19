import {
  SemanticQuery,
  GovernanceValidationResult,
  GovernanceLimits,
} from "@/types";
import { DEFAULT_GOVERNANCE_LIMITS } from "./limits";
import { semanticValidator } from "@/lib/semantic/validator";
import { semanticRegistry } from "@/lib/semantic/registry";

export class GovernanceEngine {
  private limits: GovernanceLimits;

  constructor(limits: GovernanceLimits = DEFAULT_GOVERNANCE_LIMITS) {
    this.limits = limits;
  }

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

  public getLimits(): GovernanceLimits {
    return { ...this.limits };
  }
}

export const governanceEngine = new GovernanceEngine();
