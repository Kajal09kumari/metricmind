/**
 * @file Semantic Registry for Governed Metric & Dimension Definitions
 * @module lib/semantic/registry
 * @description
 * Centralized governance registry responsible for storing, searching, and validating
 * official enterprise metrics and dimensions. Acts as the single source of truth (SSOT)
 * for the AI agent, resolving natural language synonyms to canonical schema definitions
 * and preventing LLM hallucination of un-governed business logic.
 */

import { MetricDefinition, DimensionDefinition } from "@/types";
import { METRIC_DEFINITIONS } from "@/data/semantic-model/metrics";
import { DIMENSION_DEFINITIONS } from "@/data/semantic-model/dimensions";

/**
 * Master Semantic Registry managing metrics, dimensions, and synonym resolution.
 */
class SemanticRegistry {
  /** Map of canonical metric names to their complete metadata definition */
  private metrics: Map<string, MetricDefinition> = new Map();
  /** Lookup map linking alternate natural language terms/labels to canonical metric names */
  private metricSynonyms: Map<string, string> = new Map();
  /** Map of canonical dimension names to their complete metadata definition */
  private dimensions: Map<string, DimensionDefinition> = new Map();
  /** Lookup map linking alternate natural language terms/labels to canonical dimension names */
  private dimensionSynonyms: Map<string, string> = new Map();

  /**
   * Initializes the registry by loading official models from the semantic definition layers.
   */
  constructor() {
    this.registerMetrics(METRIC_DEFINITIONS);
    this.registerDimensions(DIMENSION_DEFINITIONS);
  }

  /**
   * Indexes official metrics and builds bidirectional synonym search tables.
   * @param metrics Array of metric definitions to index
   */
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

  /**
   * Indexes official dimensions and builds synonym lookup tables.
   * @param dimensions Array of dimension definitions to index
   */
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

  /**
   * Resolves a natural language term or canonical identifier into an official Metric definition.
   * @param identifier Natural language phrase, synonym, or metric name (e.g., 'margin', 'gross_margin')
   * @returns The resolved MetricDefinition or undefined if not registered
   */
  public getMetric(identifier: string): MetricDefinition | undefined {
    const cleanId = identifier.trim().toLowerCase();
    const canonicalName = this.metricSynonyms.get(cleanId);
    if (!canonicalName) return undefined;
    return this.metrics.get(canonicalName);
  }

  /**
   * Resolves a natural language term or canonical identifier into an official Dimension definition.
   * @param identifier Natural language phrase, synonym, or dimension name (e.g., 'geo', 'region')
   * @returns The resolved DimensionDefinition or undefined if not registered
   */
  public getDimension(identifier: string): DimensionDefinition | undefined {
    const cleanId = identifier.trim().toLowerCase();
    const canonicalName = this.dimensionSynonyms.get(cleanId);
    if (!canonicalName) return undefined;
    return this.dimensions.get(canonicalName);
  }

  /**
   * Retrieves all certified enterprise metrics.
   * @returns Array of all registered MetricDefinition records
   */
  public listMetrics(): MetricDefinition[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Retrieves all certified breakdown dimensions.
   * @returns Array of all registered DimensionDefinition records
   */
  public listDimensions(): DimensionDefinition[] {
    return Array.from(this.dimensions.values());
  }

  /**
   * Resolves an arbitrary search term into the canonical metric name string.
   * @param identifier Search term (e.g., 'sales', 'turnover')
   * @returns Canonical metric string (e.g., 'revenue')
   */
  public resolveMetricName(identifier: string): string | undefined {
    const metric = this.getMetric(identifier);
    return metric?.name;
  }

  /**
   * Resolves an arbitrary search term into the canonical dimension name string.
   * @param identifier Search term (e.g., 'country', 'geography')
   * @returns Canonical dimension string (e.g., 'country')
   */
  public resolveDimensionName(identifier: string): string | undefined {
    const dim = this.getDimension(identifier);
    return dim?.name;
  }

  /**
   * Enforces semantic compatibility by checking if a metric permits slicing by a given dimension.
   * @param metricName Canonical metric name
   * @param dimensionName Canonical dimension name
   * @returns True if the breakdown is allowed by governance policy
   */
  public isMetricAllowedWithDimension(metricName: string, dimensionName: string): boolean {
    const metric = this.getMetric(metricName);
    const dim = this.getDimension(dimensionName);
    if (!metric || !dim) return false;
    return metric.allowedDimensions.includes(dim.name);
  }

  /**
   * Performs fuzzy/substring matching across metric labels, names, descriptions, and synonyms.
   * @param query Search query text
   * @returns Array of matching MetricDefinitions
   */
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

  /**
   * Performs fuzzy/substring matching across dimension labels, names, descriptions, and synonyms.
   * @param query Search query text
   * @returns Array of matching DimensionDefinitions
   */
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

/**
 * Singleton instance of the Semantic Registry.
 */
export const semanticRegistry = new SemanticRegistry();
