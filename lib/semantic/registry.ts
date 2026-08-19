import { MetricDefinition, DimensionDefinition } from "@/types";
import { METRIC_DEFINITIONS } from "@/data/semantic-model/metrics";
import { DIMENSION_DEFINITIONS } from "@/data/semantic-model/dimensions";

class SemanticRegistry {
  private metrics: Map<string, MetricDefinition> = new Map();
  private metricSynonyms: Map<string, string> = new Map();
  private dimensions: Map<string, DimensionDefinition> = new Map();
  private dimensionSynonyms: Map<string, string> = new Map();

  constructor() {
    this.registerMetrics(METRIC_DEFINITIONS);
    this.registerDimensions(DIMENSION_DEFINITIONS);
  }

  private registerMetrics(metrics: MetricDefinition[]) {
    for (const metric of metrics) {
      const canonicalName = metric.name.toLowerCase();
      this.metrics.set(canonicalName, metric);
      this.metricSynonyms.set(canonicalName, canonicalName);
      this.metricSynonyms.set(metric.label.toLowerCase(), canonicalName);

      for (const syn of metric.synonyms) {
        this.metricSynonyms.set(syn.toLowerCase(), canonicalName);
      }
    }
  }

  private registerDimensions(dimensions: DimensionDefinition[]) {
    for (const dim of dimensions) {
      const canonicalName = dim.name.toLowerCase();
      this.dimensions.set(canonicalName, dim);
      this.dimensionSynonyms.set(canonicalName, canonicalName);
      this.dimensionSynonyms.set(dim.label.toLowerCase(), canonicalName);

      for (const syn of dim.synonyms) {
        this.dimensionSynonyms.set(syn.toLowerCase(), canonicalName);
      }
    }
  }

  public getMetric(identifier: string): MetricDefinition | undefined {
    const cleanId = identifier.trim().toLowerCase();
    const canonicalName = this.metricSynonyms.get(cleanId);
    if (!canonicalName) return undefined;
    return this.metrics.get(canonicalName);
  }

  public getDimension(identifier: string): DimensionDefinition | undefined {
    const cleanId = identifier.trim().toLowerCase();
    const canonicalName = this.dimensionSynonyms.get(cleanId);
    if (!canonicalName) return undefined;
    return this.dimensions.get(canonicalName);
  }

  public listMetrics(): MetricDefinition[] {
    return Array.from(this.metrics.values());
  }

  public listDimensions(): DimensionDefinition[] {
    return Array.from(this.dimensions.values());
  }

  public resolveMetricName(identifier: string): string | undefined {
    const metric = this.getMetric(identifier);
    return metric?.name;
  }

  public resolveDimensionName(identifier: string): string | undefined {
    const dim = this.getDimension(identifier);
    return dim?.name;
  }

  public isMetricAllowedWithDimension(metricName: string, dimensionName: string): boolean {
    const metric = this.getMetric(metricName);
    const dim = this.getDimension(dimensionName);
    if (!metric || !dim) return false;
    return metric.allowedDimensions.includes(dim.name);
  }

  public findMetricsBySearch(query: string): MetricDefinition[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.listMetrics();
    return this.listMetrics().filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.label.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.synonyms.some((s) => s.toLowerCase().includes(q))
    );
  }

  public findDimensionsBySearch(query: string): DimensionDefinition[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.listDimensions();
    return this.listDimensions().filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        d.label.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.synonyms.some((s) => s.toLowerCase().includes(q))
    );
  }
}

export const semanticRegistry = new SemanticRegistry();
