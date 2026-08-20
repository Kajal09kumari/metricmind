/**
 * @file High-Performance In-Memory Relational Warehouse Adapter
 * @module lib/warehouse/mock-adapter
 * @description
 * Emulates a real enterprise data warehouse (Snowflake/BigQuery/PostgreSQL) by providing
 * an in-memory SQL execution engine over 3,200+ reproducible enterprise sales transactions.
 *
 * Implemented Relational Features:
 * - Parameterized SQL bind value substitution
 * - Compound WHERE predicates (`=`, `!=`, `IN`, `NOT IN`, `LIKE`, `BETWEEN`, and `AND`)
 * - Multi-column `GROUP BY` with hash map aggregation
 * - Aggregation functions: `SUM()`, `AVG()`, `COUNT()`, and compound arithmetic expressions (e.g. `Gross Margin`)
 * - Multi-column `ORDER BY` (ASC/DESC) and `LIMIT` pagination
 */

import { WarehouseAdapter, WarehouseSchema } from "@/types";
import { generateSalesData, SalesOrderRow } from "@/data/seed/sales-data-generator";

/**
 * MockWarehouseAdapter executes parameterized relational SQL queries in memory.
 */
export class MockWarehouseAdapter implements WarehouseAdapter {
  /** Human-readable adapter identifier */
  public name = "Mock Relational Warehouse (In-Memory)";
  /** In-memory columnar table storage */
  private data: SalesOrderRow[] = [];
  /** Initialization latch */
  private isInitialized = false;

  constructor() {
    this.init();
  }

  /**
   * Lazily loads the seeded 3,200+ enterprise sales transactions.
   */
  private init() {
    if (!this.isInitialized) {
      this.data = generateSalesData();
      this.isInitialized = true;
    }
  }

  /**
   * Health check verifying warehouse availability.
   * @returns True if warehouse dataset is loaded and accessible
   */
  public async ping(): Promise<boolean> {
    this.init();
    return this.data.length > 0;
  }

  /**
   * Returns the metadata schema and columns of the underlying relational tables.
   * @returns WarehouseSchema definition
   */
  public async getSchema(): Promise<WarehouseSchema> {
    return {
      tables: [
        {
          name: "sales_orders",
          columns: [
            { name: "order_id", type: "VARCHAR(64)" },
            { name: "order_date", type: "DATE" },
            { name: "year", type: "VARCHAR(4)" },
            { name: "quarter", type: "VARCHAR(10)" },
            { name: "month", type: "VARCHAR(7)" },
            { name: "region", type: "VARCHAR(64)" },
            { name: "country", type: "VARCHAR(64)" },
            { name: "product", type: "VARCHAR(128)" },
            { name: "product_category", type: "VARCHAR(64)" },
            { name: "customer_segment", type: "VARCHAR(64)" },
            { name: "sales_channel", type: "VARCHAR(64)" },
            { name: "revenue", type: "DOUBLE PRECISION" },
            { name: "cost", type: "DOUBLE PRECISION" },
            { name: "shipping_cost", type: "DOUBLE PRECISION" },
            { name: "material_cost", type: "DOUBLE PRECISION" },
          ],
        },
      ],
    };
  }

  /**
   * Executes a parameterized SQL statement against the in-memory relational store.
   *
   * @param sql Parameterized SQL query string (containing `?` placeholders)
   * @param params Parameter values to safely bind into the query
   * @returns Array of aggregated/projected result rows and execution duration in ms
   */
  public async executeQuery(
    sql: string,
    params: (string | number | boolean)[] = []
  ): Promise<{ rows: Record<string, any>[]; executionTimeMs: number }> {
    this.init();
    const startTime = performance.now();

    // Safely substitute bind parameters
    let filledSql = sql;
    for (const param of params) {
      const formatted = typeof param === "string" ? `'${param.replace(/'/g, "''")}'` : String(param);
      filledSql = filledSql.replace("?", formatted);
    }

    const rows = this.evaluateSql(filledSql);
    const executionTimeMs = Math.round((performance.now() - startTime) * 10) / 10 + 12; // Realistic simulated latency

    return { rows, executionTimeMs };
  }

  /**
   * Evaluates the parsed SQL query over in-memory dataset rows.
   * @param sql Bound SQL query
   * @returns Result rows
   */
  private evaluateSql(sql: string): Record<string, any>[] {
    let filteredRows = [...this.data];

    // 1. Evaluate WHERE clause
    const whereMatch = sql.match(/WHERE\s+([\s\S]*?)(?:GROUP BY|ORDER BY|LIMIT|$)/i);
    if (whereMatch) {
      const whereClause = whereMatch[1].trim();
      filteredRows = filteredRows.filter((row) => this.matchesWhereClause(row, whereClause));
    }

    // 2. Evaluate GROUP BY dimensions
    const groupByMatch = sql.match(/GROUP BY\s+([\s\S]*?)(?:ORDER BY|LIMIT|$)/i);
    const groupByCols = groupByMatch
      ? groupByMatch[1]
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [];

    // 3. Extract and compute SELECT items
    const selectMatch = sql.match(/SELECT\s+([\s\S]*?)\s+FROM/i);
    if (!selectMatch) return [];

    const selectRaw = selectMatch[1].trim();
    const selectItems = this.parseSelectItems(selectRaw);

    let resultRows: Record<string, any>[] = [];

    if (groupByCols.length > 0) {
      // Grouping via hash map key buckets
      const groups = new Map<string, SalesOrderRow[]>();

      for (const row of filteredRows) {
        const groupKey = groupByCols.map((col) => (row as any)[col] ?? "").join(":::");
        if (!groups.has(groupKey)) {
          groups.set(groupKey, []);
        }
        groups.get(groupKey)!.push(row);
      }

      for (const [_, groupRows] of groups.entries()) {
        const resultRow: Record<string, any> = {};
        for (const item of selectItems) {
          resultRow[item.alias] = this.computeSelectExpression(item.expr, groupRows);
        }
        resultRows.push(resultRow);
      }
    } else {
      // Global aggregate over all filtered rows
      const resultRow: Record<string, any> = {};
      for (const item of selectItems) {
        resultRow[item.alias] = this.computeSelectExpression(item.expr, filteredRows);
      }
      resultRows.push(resultRow);
    }

    // 4. Evaluate ORDER BY sorting
    const orderByMatch = sql.match(/ORDER BY\s+([\s\S]*?)(?:LIMIT|$)/i);
    if (orderByMatch) {
      const orderParts = orderByMatch[1].split(",").map((p) => p.trim());
      resultRows.sort((a, b) => {
        for (const part of orderParts) {
          const [colRaw, dirRaw] = part.split(/\s+/);
          const col = colRaw.trim();
          const isDesc = dirRaw?.toUpperCase() === "DESC";

          const valA = a[col] ?? 0;
          const valB = b[col] ?? 0;

          if (valA < valB) return isDesc ? 1 : -1;
          if (valA > valB) return isDesc ? -1 : 1;
        }
        return 0;
      });
    }

    // 5. Evaluate LIMIT pagination
    const limitMatch = sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      resultRows = resultRows.slice(0, limit);
    }

    return resultRows;
  }

  /**
   * Splits SELECT expressions while ignoring commas inside parenthesis.
   */
  private parseSelectItems(selectRaw: string): { expr: string; alias: string }[] {
    const items: { expr: string; alias: string }[] = [];
    const parts = selectRaw.split(/,\s*(?![^()]*\))/);

    for (const part of parts) {
      const trimmed = part.trim();
      const asMatch = trimmed.match(/^(.*?)\s+AS\s+([a-zA-Z0-9_]+)$/i);
      if (asMatch) {
        items.push({ expr: asMatch[1].trim(), alias: asMatch[2].trim() });
      } else {
        items.push({ expr: trimmed, alias: trimmed });
      }
    }
    return items;
  }

  /**
   * Computes an individual SELECT aggregation or column projection over a group of rows.
   */
  private computeSelectExpression(expr: string, rows: SalesOrderRow[]): any {
    const cleanExpr = expr.trim();

    // Direct column reference (from GROUP BY)
    if (rows.length > 0 && cleanExpr in rows[0]) {
      return (rows[0] as any)[cleanExpr];
    }

    // COUNT(order_id) or COUNT(*)
    if (/^COUNT\(/i.test(cleanExpr)) {
      return rows.length;
    }

    // SUM(revenue), SUM(cost), SUM(shipping_cost), SUM(material_cost)
    const sumMatch = cleanExpr.match(/^SUM\(([a-zA-Z0-9_]+)\)$/i);
    if (sumMatch) {
      const col = sumMatch[1];
      const sum = rows.reduce((acc, r) => acc + ((r as any)[col] || 0), 0);
      return Math.round(sum * 100) / 100;
    }

    // AVG(col)
    const avgMatch = cleanExpr.match(/^AVG\(([a-zA-Z0-9_]+)\)$/i);
    if (avgMatch) {
      const col = avgMatch[1];
      if (rows.length === 0) return 0;
      const sum = rows.reduce((acc, r) => acc + ((r as any)[col] || 0), 0);
      return Math.round((sum / rows.length) * 100) / 100;
    }

    // Gross Profit: SUM(revenue) - SUM(cost)
    if (cleanExpr.includes("SUM(revenue) - SUM(cost)") && !cleanExpr.includes("/")) {
      const rev = rows.reduce((acc, r) => acc + r.revenue, 0);
      const cost = rows.reduce((acc, r) => acc + r.cost, 0);
      return Math.round((rev - cost) * 100) / 100;
    }

    // Gross Margin: CAST(SUM(revenue) - SUM(cost) AS FLOAT) / NULLIF(SUM(revenue), 0)
    if (cleanExpr.includes("SUM(revenue) - SUM(cost)") && cleanExpr.includes("SUM(revenue)")) {
      const rev = rows.reduce((acc, r) => acc + r.revenue, 0);
      const cost = rows.reduce((acc, r) => acc + r.cost, 0);
      if (rev === 0) return 0;
      const margin = (rev - cost) / rev;
      return Math.round(margin * 10000) / 10000;
    }

    // Average Order Value (AOV): CAST(SUM(revenue) AS FLOAT) / NULLIF(COUNT(order_id), 0)
    if (cleanExpr.includes("SUM(revenue)") && cleanExpr.includes("COUNT(order_id)")) {
      const rev = rows.reduce((acc, r) => acc + r.revenue, 0);
      if (rows.length === 0) return 0;
      return Math.round((rev / rows.length) * 100) / 100;
    }

    return null;
  }

  /**
   * Tests whether a single row satisfies all conditions in the WHERE clause.
   */
  private matchesWhereClause(row: SalesOrderRow, whereClause: string): boolean {
    const conditions = whereClause.split(/\s+AND\s+/i);

    for (const cond of conditions) {
      const trimmed = cond.trim();

      // col = 'val'
      const eqMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*=\s*'?(.*?)'?$/);
      if (eqMatch) {
        const col = eqMatch[1];
        const val = eqMatch[2].replace(/'/g, "");
        if (String((row as any)[col]) !== val) return false;
        continue;
      }

      // col != 'val'
      const neMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s*!=\s*'?(.*?)'?$/);
      if (neMatch) {
        const col = neMatch[1];
        const val = neMatch[2].replace(/'/g, "");
        if (String((row as any)[col]) === val) return false;
        continue;
      }

      // col IN ('v1', 'v2')
      const inMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s+IN\s*\((.*?)\)$/i);
      if (inMatch) {
        const col = inMatch[1];
        const rawVals = inMatch[2].split(",").map((v) => v.trim().replace(/^'|'$/g, ""));
        if (!rawVals.includes(String((row as any)[col]))) return false;
        continue;
      }

      // col NOT IN ('v1', 'v2')
      const notInMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s+NOT\s+IN\s*\((.*?)\)$/i);
      if (notInMatch) {
        const col = notInMatch[1];
        const rawVals = notInMatch[2].split(",").map((v) => v.trim().replace(/^'|'$/g, ""));
        if (rawVals.includes(String((row as any)[col]))) return false;
        continue;
      }

      // col LIKE '%val%'
      const likeMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s+LIKE\s*'%?(.*?)%?'$/i);
      if (likeMatch) {
        const col = likeMatch[1];
        const val = likeMatch[2].toLowerCase();
        const rowVal = String((row as any)[col] || "").toLowerCase();
        if (!rowVal.includes(val)) return false;
        continue;
      }

      // col BETWEEN 'd1' AND 'd2'
      const betweenMatch = trimmed.match(/^([a-zA-Z0-9_]+)\s+BETWEEN\s*'?(.*?)'?\s+AND\s*'?(.*?)'?$/i);
      if (betweenMatch) {
        const col = betweenMatch[1];
        const startVal = betweenMatch[2];
        const endVal = betweenMatch[3];
        const rowVal = String((row as any)[col] || "");
        if (rowVal < startVal || rowVal > endVal) return false;
        continue;
      }
    }

    return true;
  }
}

/**
 * Singleton instance of the Mock In-Memory Relational Warehouse Adapter.
 */
export const mockWarehouseAdapter = new MockWarehouseAdapter();
