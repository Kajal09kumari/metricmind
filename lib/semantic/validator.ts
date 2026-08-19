import { SemanticQuery, GovernanceValidationResult } from "@/types";
import { semanticRegistry } from "./registry";
import { SemanticQuerySchema } from "./schema";

export class SemanticValidator {
  public validateQuery(rawQuery: unknown): GovernanceValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Step 1: Schema validation
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

    // Step 2: Validate metrics
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

    // Step 3: Validate dimensions
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

    // Step 4: Validate metric-dimension compatibility
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

    // Step 5: Validate filters
    if (query.filters) {
      for (const filter of query.filters) {
        const dimDef = semanticRegistry.getDimension(filter.dimension);
        if (!dimDef) {
          errors.push(
            `Filter references unknown dimension "${filter.dimension}".`
          );
        } else {
          // Normalize dimension name in filter
          sanitizedFilters.push({
            dimension: dimDef.name,
            operator: filter.operator,
            value: filter.value,
          });

          // Check allowed values if defined
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

    // Step 6: Governance limit checks
    if (sanitizedDimensions.length > 4) {
      errors.push("Cannot query more than 4 dimensions simultaneously to prevent query explosion.");
    }

    if (errors.length > 0) {
      return {
        valid: false,
        errors,
        warnings,
      };
    }

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

export const semanticValidator = new SemanticValidator();
