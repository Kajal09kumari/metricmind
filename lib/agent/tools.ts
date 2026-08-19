import {
  MetricDefinition,
  DimensionDefinition,
  SemanticQuery,
  QueryResult,
  VisualizationSpec,
  ChartType,
} from "@/types";
import { semanticRegistry } from "@/lib/semantic/registry";
import { governanceEngine } from "@/lib/governance/engine";
import { queryCompiler } from "@/lib/semantic/compiler";
import { getWarehouseAdapter } from "@/lib/warehouse/warehouse-factory";
import { visualizerEngine } from "@/lib/visualization/visualizer";

export class AgentTools {
  public static listAvailableMetrics(): MetricDefinition[] {
    return semanticRegistry.listMetrics();
  }

  public static listAvailableDimensions(): DimensionDefinition[] {
    return semanticRegistry.listDimensions();
  }

  public static getMetricDefinition(name: string): MetricDefinition | undefined {
    return semanticRegistry.getMetric(name);
  }

  public static async querySemanticLayer(query: SemanticQuery): Promise<QueryResult> {
    // 1. Governance Validation
    const validation = governanceEngine.validateSemanticQuery(query);
    if (!validation.valid || !validation.sanitizedQuery) {
      throw new Error(`Governance Policy Violation: ${validation.errors.join("; ")}`);
    }

    const sanitized = validation.sanitizedQuery;

    // 2. Compile to parameterized SQL
    const compiled = queryCompiler.compile(sanitized);

    // 3. Execute via Warehouse Adapter
    const warehouse = getWarehouseAdapter();
    const result = await warehouse.executeQuery(compiled.sql, compiled.params);

    // 4. Map columns with types
    const columns = [
      ...compiled.dimensions.map((d) => {
        const dimDef = semanticRegistry.getDimension(d);
        return {
          name: d,
          label: dimDef?.label || d,
          type: dimDef?.dataType || "string",
        };
      }),
      ...compiled.metrics.map((m) => {
        const metricDef = semanticRegistry.getMetric(m);
        return {
          name: m,
          label: metricDef?.label || m,
          type: metricDef?.dataType || "number",
        };
      }),
    ];

    return {
      columns,
      rows: result.rows,
      totalRows: result.rows.length,
      executionTimeMs: result.executionTimeMs,
      compiledSql: compiled.sql,
      provenance: {
        sourceTable: "sales_orders",
        datasetName: "Enterprise Global Sales Data (Governed)",
        executedAt: new Date().toISOString(),
        queryId: `qry-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        warehouseProvider: warehouse.name,
        rowCount: result.rows.length,
        executionTimeMs: result.executionTimeMs,
      },
    };
  }

  public static async getMetricBreakdown(
    metricName: string,
    dimensionName: string,
    filters?: SemanticQuery["filters"],
    timeRange?: SemanticQuery["timeRange"]
  ): Promise<QueryResult> {
    const query: SemanticQuery = {
      metrics: [metricName],
      dimensions: [dimensionName],
      filters: filters || [],
      timeRange,
    };
    return this.querySemanticLayer(query);
  }

  public static generateVisualization(
    result: QueryResult,
    title?: string,
    chartType?: ChartType
  ): VisualizationSpec {
    return visualizerEngine.generateSpec(result, title, chartType);
  }
}
