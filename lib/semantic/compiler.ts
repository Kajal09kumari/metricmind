import { SemanticQuery, SemanticFilter } from "@/types";
import { semanticRegistry } from "./registry";

export interface CompiledQuery {
  sql: string;
  params: (string | number | boolean)[];
  metrics: string[];
  dimensions: string[];
}

export class QueryCompiler {
  public compile(query: SemanticQuery): CompiledQuery {
    const params: (string | number | boolean)[] = [];
    const selectItems: string[] = [];
    const groupByItems: string[] = [];

    // 1. Dimensions in SELECT and GROUP BY
    if (query.dimensions && query.dimensions.length > 0) {
      for (const dimName of query.dimensions) {
        const dimDef = semanticRegistry.getDimension(dimName);
        if (!dimDef) throw new Error(`Unknown dimension: ${dimName}`);

        selectItems.push(`${dimDef.sqlColumn} AS ${dimDef.name}`);
        groupByItems.push(dimDef.sqlColumn);
      }
    }

    // 2. Metrics in SELECT
    for (const metricName of query.metrics) {
      const metricDef = semanticRegistry.getMetric(metricName);
      if (!metricDef) throw new Error(`Unknown metric: ${metricName}`);

      selectItems.push(`${metricDef.sqlFormula} AS ${metricDef.name}`);
    }

    // 3. FROM table
    const fromTable = "sales_orders";

    // 4. WHERE clauses
    const whereClauses: string[] = [];

    if (query.filters && query.filters.length > 0) {
      for (const filter of query.filters) {
        const clause = this.compileFilter(filter, params);
        if (clause) whereClauses.push(clause);
      }
    }

    // Time Range filter
    if (query.timeRange) {
      const timeClause = this.compileTimeRange(query.timeRange, params);
      if (timeClause) whereClauses.push(timeClause);
    }

    let sql = `SELECT\n  ${selectItems.join(",\n  ")}\nFROM ${fromTable}`;

    if (whereClauses.length > 0) {
      sql += `\nWHERE\n  ${whereClauses.join(" AND\n  ")}`;
    }

    if (groupByItems.length > 0) {
      sql += `\nGROUP BY\n  ${groupByItems.join(", ")}`;
    }

    // 5. ORDER BY
    if (query.orderBy && query.orderBy.length > 0) {
      const orderClauses = query.orderBy.map((o) => {
        const dimDef = semanticRegistry.getDimension(o.field);
        const col = dimDef ? dimDef.sqlColumn : o.field;
        return `${col} ${o.direction.toUpperCase()}`;
      });
      sql += `\nORDER BY\n  ${orderClauses.join(", ")}`;
    } else if (query.dimensions && query.dimensions.length > 0) {
      // Default natural ordering: time dimensions first
      const timeDims = ["quarter", "year", "month", "date"];
      const matchedTimeDim = query.dimensions.find((d) => timeDims.includes(d));
      if (matchedTimeDim) {
        const dimDef = semanticRegistry.getDimension(matchedTimeDim);
        sql += `\nORDER BY\n  ${dimDef?.sqlColumn || matchedTimeDim} ASC`;
      }
    }

    // 6. LIMIT
    const limit = query.limit || 1000;
    sql += `\nLIMIT ${limit};`;

    return {
      sql,
      params,
      metrics: query.metrics,
      dimensions: query.dimensions || [],
    };
  }

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

export const queryCompiler = new QueryCompiler();
