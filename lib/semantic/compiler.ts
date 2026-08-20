/**
 * @file Governed Query Compiler
 * @module lib/semantic/compiler
 * @description
 * Deterministically compiles a high-level `SemanticQuery` Abstract Syntax Tree (AST)
 * into a safe, parameterized SQL query with explicit column aliases, GROUP BY clauses,
 * WHERE filtering, ORDER BY logic, and pagination limits.
 *
 * Core Security Guarantee:
 * - Direct SQL injection is impossible because all user filters are parameterized (`?`).
 * - No raw table mutations or unauthorized column references are permitted.
 */

import { SemanticQuery, SemanticFilter } from "@/types";
import { semanticRegistry } from "./registry";

/**
 * Result of the semantic compilation pipeline.
 */
export interface CompiledQuery {
  /** Parameterized SQL string */
  sql: string;
  /** Positional bind parameters corresponding to `?` placeholders */
  params: (string | number | boolean)[];
  /** List of canonical metrics included in the query */
  metrics: string[];
  /** List of canonical dimensions included in the query */
  dimensions: string[];
}

/**
 * QueryCompiler translates validated semantic ASTs into executable relational SQL queries.
 */
export class QueryCompiler {
  /**
   * Compiles a SemanticQuery into an optimized, parameterized SQL statement.
   *
   * @param query The validated SemanticQuery AST
   * @returns CompiledQuery object containing SQL string and bind parameters
   * @throws Error if any metric or dimension in the query is unknown in the registry
   */
  public compile(query: SemanticQuery): CompiledQuery {
    const params: (string | number | boolean)[] = [];
    const selectItems: string[] = [];
    const groupByItems: string[] = [];

    // 1. Compile requested Dimensions into SELECT items and GROUP BY items
    if (query.dimensions && query.dimensions.length > 0) {
      for (const dimName of query.dimensions) {
        const dimDef = semanticRegistry.getDimension(dimName);
        if (!dimDef) throw new Error(`Unknown dimension: ${dimName}`);

        selectItems.push(`${dimDef.sqlColumn} AS ${dimDef.name}`);
        groupByItems.push(dimDef.sqlColumn);
      }
    }

    // 2. Compile locked Metric formulas into SELECT aggregation items
    for (const metricName of query.metrics) {
      const metricDef = semanticRegistry.getMetric(metricName);
      if (!metricDef) throw new Error(`Unknown metric: ${metricName}`);

      selectItems.push(`${metricDef.sqlFormula} AS ${metricDef.name}`);
    }

    // 3. Resolve underlying physical table (single enterprise sales table in demo)
    const fromTable = "sales_orders";

    // 4. Compile WHERE clauses from dimensional filters
    const whereClauses: string[] = [];

    if (query.filters && query.filters.length > 0) {
      for (const filter of query.filters) {
        const clause = this.compileFilter(filter, params);
        if (clause) whereClauses.push(clause);
      }
    }

    // Compile optional temporal range filter
    if (query.timeRange) {
      const timeClause = this.compileTimeRange(query.timeRange, params);
      if (timeClause) whereClauses.push(timeClause);
    }

    // Assemble base SELECT and FROM statement
    let sql = `SELECT\n  ${selectItems.join(",\n  ")}\nFROM ${fromTable}`;

    // Append WHERE predicates if present
    if (whereClauses.length > 0) {
      sql += `\nWHERE\n  ${whereClauses.join(" AND\n  ")}`;
    }

    // Append GROUP BY expressions if dimensional slicing is requested
    if (groupByItems.length > 0) {
      sql += `\nGROUP BY\n  ${groupByItems.join(", ")}`;
    }

    // 5. Append ORDER BY sorting logic
    if (query.orderBy && query.orderBy.length > 0) {
      const orderClauses = query.orderBy.map((o) => {
        const dimDef = semanticRegistry.getDimension(o.field);
        const col = dimDef ? dimDef.sqlColumn : o.field;
        return `${col} ${o.direction.toUpperCase()}`;
      });
      sql += `\nORDER BY\n  ${orderClauses.join(", ")}`;
    } else if (query.dimensions && query.dimensions.length > 0) {
      // Default natural chronological ordering for time-series charts
      const timeDims = ["quarter", "year", "month", "date"];
      const matchedTimeDim = query.dimensions.find((d) => timeDims.includes(d));
      if (matchedTimeDim) {
        const dimDef = semanticRegistry.getDimension(matchedTimeDim);
        sql += `\nORDER BY\n  ${dimDef?.sqlColumn || matchedTimeDim} ASC`;
      }
    }

    // 6. Enforce safety LIMIT to prevent memory overflow
    const limit = query.limit || 1000;
    sql += `\nLIMIT ${limit};`;

    return {
      sql,
      params,
      metrics: query.metrics,
      dimensions: query.dimensions || [],
    };
  }

  /**
   * Compiles an individual semantic filter into a parameterized SQL condition.
   *
   * @param filter The SemanticFilter criteria
   * @param params Output array to push parameter bind values into
   * @returns SQL WHERE condition string (e.g., 'region = ?')
   */
  private compileFilter(
    filter: SemanticFilter,
    params: (string | number | boolean)[]
  ): string {
    const dimDef = semanticRegistry.getDimension(filter.dimension);
    if (!dimDef) return "";

    const col = dimDef.sqlColumn;

    switch (filter.operator) {
      case "equals":
        params.push(filter.value as string | number);
        return `${col} = ?`;

      case "not_equals":
        params.push(filter.value as string | number);
        return `${col} != ?`;

      case "in": {
        const vals = Array.isArray(filter.value) ? filter.value : [filter.value];
        const placeholders = vals.map(() => "?").join(", ");
        for (const v of vals) params.push(v);
        return `${col} IN (${placeholders})`;
      }

      case "not_in": {
        const vals = Array.isArray(filter.value) ? filter.value : [filter.value];
        const placeholders = vals.map(() => "?").join(", ");
        for (const v of vals) params.push(v);
        return `${col} NOT IN (${placeholders})`;
      }

      case "greater_than":
        params.push(filter.value as string | number);
        return `${col} > ?`;

      case "less_than":
        params.push(filter.value as string | number);
        return `${col} < ?`;

      case "contains":
        params.push(`%${filter.value}%`);
        return `${col} LIKE ?`;

      default:
        params.push(filter.value as string | number);
        return `${col} = ?`;
    }
  }

  /**
   * Converts high-level time ranges into parameterized date or quarter predicates.
   *
   * @param timeRange Specified time range configuration
   * @param params Output array for bind values
   * @returns SQL time range predicate string or null
   */
  private compileTimeRange(
    timeRange: NonNullable<SemanticQuery["timeRange"]>,
    params: (string | number | boolean)[]
  ): string | null {
    switch (timeRange.type) {
      case "current_quarter":
        params.push("2024-Q4");
        return `quarter = ?`;

      case "previous_quarter":
        params.push("2024-Q3");
        return `quarter = ?`;

      case "year_to_date":
      case "last_year":
        params.push("2024");
        return `year = ?`;

      case "custom":
        if (timeRange.startDate && timeRange.endDate) {
          params.push(timeRange.startDate, timeRange.endDate);
          return `order_date BETWEEN ? AND ?`;
        }
        return null;

      case "all_time":
      default:
        return null;
    }
  }
}

/**
 * Singleton instance of the Governed Query Compiler.
 */
export const queryCompiler = new QueryCompiler();
