import {
  QueryResult,
  VisualizationSpec,
  ChartType,
  ChartSeries,
  DataType,
} from "@/types";
import { semanticRegistry } from "@/lib/semantic/registry";

export class VisualizerEngine {
  private colors = [
    "#3B82F6", // blue-500
    "#10B981", // emerald-500
    "#F59E0B", // amber-500
    "#8B5CF6", // purple-500
    "#EC4899", // pink-500
    "#06B6D4", // cyan-500
    "#F97316", // orange-500
  ];

  public generateSpec(
    queryResult: QueryResult,
    title?: string,
    forcedType?: ChartType
  ): VisualizationSpec {
    const { rows, columns } = queryResult;
    if (rows.length === 0) {
      return {
        type: "table",
        title: title || "Query Results",
        data: [],
      };
    }

    const metricCols = columns.filter((col) => {
      const metricDef = semanticRegistry.getMetric(col.name);
      return Boolean(metricDef);
    });

    const dimCols = columns.filter((col) => {
      const dimDef = semanticRegistry.getDimension(col.name);
      return Boolean(dimDef);
    });

    // 1. If forced type is provided
    if (forcedType) {
      return this.buildSpecForType(forcedType, queryResult, title, metricCols, dimCols);
    }

    // 2. Single row, single metric -> KPI
    if (rows.length === 1 && dimCols.length === 0 && metricCols.length === 1) {
      const metricDef = semanticRegistry.getMetric(metricCols[0].name);
      return {
        type: "kpi",
        title: title || metricDef?.label || "KPI Metric",
        data: rows,
        yAxis: metricCols[0].name,
        format: metricDef?.dataType || "number",
      };
    }

    // 3. Time series (date, month, quarter, year) -> Line Chart or Area Chart
    const timeDims = ["quarter", "month", "date", "year"];
    const timeDim = dimCols.find((d) => timeDims.includes(d.name));

    if (timeDim && rows.length > 1) {
      const series: ChartSeries[] = metricCols.map((m, idx) => {
        const metricDef = semanticRegistry.getMetric(m.name);
        return {
          key: m.name,
          label: metricDef?.label || m.name,
          color: this.colors[idx % this.colors.length],
          format: metricDef?.dataType || "number",
        };
      });

      return {
        type: "line",
        title: title || `${metricCols.map((m) => m.label).join(" & ")} by ${timeDim.label}`,
        xAxis: timeDim.name,
        xAxisLabel: timeDim.label,
        yAxis: metricCols[0]?.name,
        series,
        data: rows,
        format: metricCols[0]?.type as DataType,
      };
    }

    // 4. Categorical Breakdown (region, country, product_category, etc.) -> Bar Chart
    if (dimCols.length === 1 && metricCols.length > 0) {
      const dim = dimCols[0];
      const series: ChartSeries[] = metricCols.map((m, idx) => {
        const metricDef = semanticRegistry.getMetric(m.name);
        return {
          key: m.name,
          label: metricDef?.label || m.name,
          color: this.colors[idx % this.colors.length],
          format: metricDef?.dataType || "number",
        };
      });

      return {
        type: "bar",
        title: title || `${metricCols.map((m) => m.label).join(" & ")} by ${dim.label}`,
        xAxis: dim.name,
        xAxisLabel: dim.label,
        series,
        data: rows,
        format: metricCols[0]?.type as DataType,
      };
    }

    // 5. Default -> Table or Multi-series Bar
    return {
      type: "table",
      title: title || "Data Table",
      data: rows,
    };
  }

  private buildSpecForType(
    type: ChartType,
    queryResult: QueryResult,
    title: string | undefined,
    metricCols: QueryResult["columns"],
    dimCols: QueryResult["columns"]
  ): VisualizationSpec {
    const { rows } = queryResult;
    const xAxis = dimCols[0]?.name || "category";
    const series: ChartSeries[] = metricCols.map((m, idx) => {
      const metricDef = semanticRegistry.getMetric(m.name);
      return {
        key: m.name,
        label: metricDef?.label || m.name,
        color: this.colors[idx % this.colors.length],
        format: metricDef?.dataType || "number",
      };
    });

    return {
      type,
      title: title || "Visualization",
      xAxis,
      series,
      data: rows,
      format: metricCols[0]?.type as DataType,
    };
  }
}

export const visualizerEngine = new VisualizerEngine();
