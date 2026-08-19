import { QueryAudit } from "@/types";

class AuditService {
  private audits: QueryAudit[] = [];

  constructor() {
    // Seed initial realistic audit entries for demonstration
    this.seedAudits();
  }

  private seedAudits() {
    const pastAudits: QueryAudit[] = [
      {
        id: "aud-001",
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        userQuestion: "Show gross margin across all regions for 2024-Q3",
        metrics: ["gross_margin"],
        dimensions: ["region"],
        semanticQuery: {
          metrics: ["gross_margin"],
          dimensions: ["region"],
          timeRange: { type: "previous_quarter" },
        },
        generatedSql:
          "SELECT region AS region, CAST(SUM(revenue) - SUM(cost) AS FLOAT) / NULLIF(SUM(revenue), 0) AS gross_margin FROM sales_orders WHERE quarter = '2024-Q3' GROUP BY region LIMIT 1000;",
        queryCount: 1,
        executionTimeMs: 24,
        rowsReturned: 4,
        status: "success",
        governanceChecksPassed: true,
      },
      {
        id: "aud-002",
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        userQuestion: "Total revenue and orders by product category this year",
        metrics: ["revenue", "orders"],
        dimensions: ["product_category"],
        semanticQuery: {
          metrics: ["revenue", "orders"],
          dimensions: ["product_category"],
          timeRange: { type: "year_to_date" },
        },
        generatedSql:
          "SELECT product_category AS product_category, SUM(revenue) AS revenue, COUNT(order_id) AS orders FROM sales_orders WHERE year = '2024' GROUP BY product_category LIMIT 1000;",
        queryCount: 1,
        executionTimeMs: 31,
        rowsReturned: 5,
        status: "success",
        governanceChecksPassed: true,
      },
      {
        id: "aud-003",
        timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
        userQuestion: "Show user NPS score by sales rep salary",
        metrics: ["nps_score"],
        dimensions: ["sales_rep_salary"],
        semanticQuery: {
          metrics: ["nps_score"],
          dimensions: ["sales_rep_salary"],
        },
        queryCount: 0,
        executionTimeMs: 4,
        rowsReturned: 0,
        status: "blocked",
        errorMessage:
          "Metric 'nps_score' and dimension 'sales_rep_salary' not found in approved semantic catalog. Raw table access prohibited by governance policy.",
        governanceChecksPassed: false,
      },
    ];

    this.audits.push(...pastAudits);
  }

  public record(audit: Omit<QueryAudit, "id">): QueryAudit {
    const id = `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const record: QueryAudit = {
      id,
      ...audit,
    };
    this.audits.unshift(record); // Prepend so newest is first
    return record;
  }

  public getAll(): QueryAudit[] {
    return [...this.audits];
  }

  public getById(id: string): QueryAudit | undefined {
    return this.audits.find((a) => a.id === id);
  }

  public getStats(): {
    totalQueries: number;
    successRate: number;
    avgLatencyMs: number;
    blockedCount: number;
  } {
    const total = this.audits.length;
    if (total === 0) {
      return { totalQueries: 0, successRate: 100, avgLatencyMs: 0, blockedCount: 0 };
    }

    const successful = this.audits.filter((a) => a.status === "success");
    const blocked = this.audits.filter((a) => a.status === "blocked");
    const totalLatency = successful.reduce((acc, a) => acc + a.executionTimeMs, 0);

    return {
      totalQueries: total,
      successRate: Math.round((successful.length / total) * 100),
      avgLatencyMs: successful.length > 0 ? Math.round(totalLatency / successful.length) : 0,
      blockedCount: blocked.length,
    };
  }
}

export const auditService = new AuditService();
