/**
 * @file Dynamic Visualization & Recharts Specification Generator
 * @module lib/visualization/visualizer
 * @description
 * Automatically determines the most effective chart type (Line, Bar, Area, Composite, KPI card, or Table)
 * based on query dimensions, metric data types, and temporal vs categorical cardinality.
 *
 * Chart Selection Rules:
 * 1. Single row with single metric -> KPI Card
 * 2. Time-series dimension (`quarter`, `month`, `date`, `year`) -> Line / Area Chart
 * 3. Categorical dimension (`region`, `country`, `product_category`) -> Bar Chart
 * 4. Multi-dimensional / multi-metric dataset -> Interactive Data Table
 */

import {
  QueryResult,
  VisualizationSpec,
  ChartType,
  ChartSeries,
  DataType,
} from "@/types";
import { semanticRegistry } from "@/lib/semantic/registry";

/**
 * VisualizerEngine produces strongly-typed chart specifications for frontend rendering.
 */
export class VisualizerEngine {
  /** High-contrast, accessible color palette for multi-series charts */
  private colors = [
    "#3B82F6", // Blue 500
    "#10B981", // Emerald 500
    "#F59E0B", // Amber 500
    "#8B5CF6", // Purple 500
    "#EC4899", // Pink 500
    "#06B6D4", // Cyan 500
    "#F97316", // Orange 500
  ];

  /**
   * Evaluates a QueryResult and generates an optimal visualization specification.
   *
   * @param queryResult Aggregated result rows from the governed semantic layer
   * @param title Optional chart title
   * @param forcedType Optional override to force a specific chart type
   * @returns VisualizationSpec ready for dynamic UI rendering with Recharts
   */
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

    // Partition result columns into metrics vs dimensions
    const metricCols = columns.filter((col) => {
      const metricDef = semanticRegistry.getMetric(col.name);
      return Boolean(metricDef);
    });

    const dimCols = columns.filter((col) => {
      const dimDef = semanticRegistry.getDimension(col.name);
      return Boolean(dimDef);
    });

    // 1. If explicit chart type override is requested
    if (forcedType) {
      return this.buildSpecForType(forcedType, queryResult, title, metricCols, dimCols);
    }

    // 2. Single row, single metric -> KPI Card
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

    // 3. Time series dimension detected -> Interactive Line Chart
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

    // 4. Categorical dimension detected -> Interactive Bar Chart
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

    // 5. Default fallback -> Interactive Data Table
    return {
      type: "table",
      title: title || "Data Table",
      data: rows,
    };
  }

  /**
   * Helper constructing a specification for an explicitly requested chart type.
   */
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

/**
 * Singleton instance of the Dynamic Visualizer Engine.
 */
export const visualizerEngine = new VisualizerEngine();
