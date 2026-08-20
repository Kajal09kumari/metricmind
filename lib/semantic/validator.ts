/**
 * @file Governed Semantic Layer Query Validator
 * @module lib/semantic/validator
 * @description
 * Enforces pre-flight structural, semantic, and compatibility rules on all queries.
 * Validates candidate queries using Zod schemas, resolves synonyms to canonical names,
 * verifies metric-dimension compatibility matrices, and sanitizes filters before execution.
 *
 * Core Validation Phases:
 * 1. Zod AST Schema Structure Validation
 * 2. Canonical Metric Existence & Registry Check
 * 3. Canonical Dimension Existence Check
 * 4. Metric-Dimension Compatibility Allowlist Verification
 * 5. Dimensional Filter Normalization & Value Range Checks
 * 6. Query Complexity & Cardinality Bounds Enforcement
 */

import { SemanticQuery, GovernanceValidationResult } from "@/types";
import { semanticRegistry } from "./registry";
import { SemanticQuerySchema } from "./schema";

/**
 * SemanticValidator validates raw candidate queries against the semantic model.
 */
export class SemanticValidator {
  /**
   * Validates and sanitizes a raw query object.
   *
   * @param rawQuery Unknown candidate query payload from API or agent
   * @returns GovernanceValidationResult containing validity flag, error messages, warnings, and normalized query
   */
  public validateQuery(rawQuery: unknown): GovernanceValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Phase 1: Zod Schema Structure Validation
    const parsed = SemanticQuerySchema.safeParse(rawQuery);
    if (!parsed.success) {
      return {
        valid: false,
        errors: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
        warnings: [],
      };
    }

    const query = parsed.data;
    const sanitizedMetrics: string[] = [];
    const sanitizedDimensions: string[] = [];
    const sanitizedFilters = [];

    // Phase 2: Validate and resolve requested metrics
    for (const metricIdentifier of query.metrics) {
      const metricDef = semanticRegistry.getMetric(metricIdentifier);
      if (!metricDef) {
        errors.push(
          `Metric "${metricIdentifier}" is not defined in the Semantic Layer. Please check the Semantic Catalog.`
        );
      } else {
        if (!sanitizedMetrics.includes(metricDef.name)) {
          sanitizedMetrics.push(metricDef.name);
        }
      }
    }

    // Phase 3: Validate and resolve requested dimensions
    if (query.dimensions) {
      for (const dimIdentifier of query.dimensions) {
        const dimDef = semanticRegistry.getDimension(dimIdentifier);
        if (!dimDef) {
          errors.push(
            `Dimension "${dimIdentifier}" is not defined in the Semantic Layer.`
          );
        } else {
          if (!sanitizedDimensions.includes(dimDef.name)) {
            sanitizedDimensions.push(dimDef.name);
          }
        }
      }
    }

    // Phase 4: Enforce Metric-Dimension Compatibility Matrix
    for (const metricName of sanitizedMetrics) {
      for (const dimName of sanitizedDimensions) {
        if (!semanticRegistry.isMetricAllowedWithDimension(metricName, dimName)) {
          errors.push(
            `Metric "${metricName}" cannot be broken down by dimension "${dimName}". Allowed dimensions: ${semanticRegistry
              .getMetric(metricName)
              ?.allowedDimensions.join(", ")}`
          );
        }
      }
    }

    // Phase 5: Validate and sanitize dimensional filters
    if (query.filters) {
      for (const filter of query.filters) {
        const dimDef = semanticRegistry.getDimension(filter.dimension);
        if (!dimDef) {
          errors.push(
            `Filter references unknown dimension "${filter.dimension}".`
          );
        } else {
          // Normalize dimension name to canonical form
          sanitizedFilters.push({
            dimension: dimDef.name,
            operator: filter.operator,
            value: filter.value,
          });

          // Verify recognized value domains if catalog specifies allowedValues
          if (dimDef.allowedValues && dimDef.allowedValues.length > 0) {
            const values = Array.isArray(filter.value) ? filter.value : [filter.value];
            for (const val of values) {
              if (
                typeof val === "string" &&
                !dimDef.allowedValues.some((av) => av.toLowerCase() === val.toLowerCase())
              ) {
                warnings.push(
                  `Filter value "${val}" for "${dimDef.label}" is not in the recognized standard catalog list (${dimDef.allowedValues.join(", ")}).`
                );
              }
            }
          }
        }
      }
    }

    // Phase 6: Cardinality and complexity bound checks
    if (sanitizedDimensions.length > 4) {
      errors.push("Cannot query more than 4 dimensions simultaneously to prevent query explosion.");
    }

    // If any validation rule failed, return early with error details
    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        warnings,
      };
    }

    // Build finalized, sanitized SemanticQuery
    const sanitizedQuery: SemanticQuery = {
      metrics: sanitizedMetrics,
      dimensions: sanitizedDimensions,
      filters: sanitizedFilters,
      timeRange: query.timeRange,
      orderBy: query.orderBy,
      limit: query.limit || 1000,
    };

    return {
      valid: true,
      errors: [],
      warnings,
      sanitizedQuery,
    };
  }
}

/**
 * Singleton instance of the Semantic Validator.
 */
export const semanticValidator = new SemanticValidator();
