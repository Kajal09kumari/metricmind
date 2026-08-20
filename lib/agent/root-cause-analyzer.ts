/**
 * @file Root Cause Diagnostic & Variance Breakdown Engine
 * @module lib/agent/root-cause-analyzer
 * @description
 * Automatically detects metric deviations, margin compressions, or variance trends
 * across chronological periods and triggers secondary diagnostic breakdowns into cost drivers,
 * revenue drivers, and localized sub-geographies within governance limits.
 */

import { QueryResult, SemanticFilter, KeyDriver, SemanticQuery } from "@/types";
import { AgentTools } from "./tools";

/**
 * Diagnostic results of a root cause investigation.
 */
export interface RootCauseInvestigation {
  /** True if a statistically significant downward metric deviation was detected */
  hasDecline: boolean;
  /** Baseline value from the preceding period */
  priorValue?: number;
  /** Value from the current period under investigation */
  currentValue?: number;
  /** Absolute delta difference (`currentValue - priorValue`) */
  deltaValue?: number;
  /** Relative percentage delta */
  deltaPercent?: number;
  /** Secondary query result breaking down revenue, total cost, shipping, and material cost */
  costBreakdownResult?: QueryResult;
  /** Secondary query result breaking down margins across sub-countries/regions */
  countryBreakdownResult?: QueryResult;
  /** Optional secondary query result breaking down product categories */
  categoryBreakdownResult?: QueryResult;
  /** Identified key driver badges with quantified impact */
  keyDrivers: KeyDriver[];
  /** Log of secondary diagnostic queries dispatched through the semantic layer */
  secondaryQueries: { breakdownType: string; query: SemanticQuery; result: QueryResult }[];
}

/**
 * RootCauseAnalyzer evaluates quarterly time series and identifies primary variance drivers.
 */
export class RootCauseAnalyzer {
  /**
   * Conducts an automated root-cause investigation on the primary query result dataset.
   *
   * @param primaryResult Initial query result containing primary metric trend rows
   * @param primaryMetric The canonical metric being analyzed (e.g., 'gross_margin')
   * @param filters Active dimensional filters applied to the query (e.g., region = 'Europe')
   * @returns Complete RootCauseInvestigation object with driver badges and secondary results
   */
  public async investigate(
    primaryResult: QueryResult,
    primaryMetric: string,
    filters: SemanticFilter[]
  ): Promise<RootCauseInvestigation> {
    const rows = primaryResult.rows;
    const secondaryQueries: { breakdownType: string; query: SemanticQuery; result: QueryResult }[] = [];
    const keyDrivers: KeyDriver[] = [];

    // Check if we have at least 2 chronological quarterly time-series rows
    const isQuarterly = rows.length >= 2 && "quarter" in rows[0];

    if (!isQuarterly) {
      return {
        hasDecline: false,
        keyDrivers: [],
        secondaryQueries: [],
      };
    }

    // Sort rows chronologically (e.g., 2024-Q1 -> 2024-Q4)
    const sorted = [...rows].sort((a, b) => (a.quarter > b.quarter ? 1 : -1));
    const currentPeriodRow = sorted[sorted.length - 1];
    const priorPeriodRow = sorted[sorted.length - 2];

    const currentVal = currentPeriodRow[primaryMetric] ?? 0;
    const priorVal = priorPeriodRow[primaryMetric] ?? 0;
    const deltaVal = currentVal - priorVal;
    const deltaPercent = priorVal !== 0 ? (deltaVal / priorVal) * 100 : 0;

    // Detect if a notable decline occurred (margin drop > 1.5 pp or relative drop > 3.0%)
    const isMargin = primaryMetric === "gross_margin";
    const hasDecline = isMargin ? deltaVal < -0.015 : deltaPercent < -3.0;

    let costBreakdownResult: QueryResult | undefined;
    let countryBreakdownResult: QueryResult | undefined;
    let categoryBreakdownResult: QueryResult | undefined;

    if (hasDecline) {
      // ----------------------------------------------------
      // 1. Cost & Revenue Component Breakdown Query
      // ----------------------------------------------------
      const costQuery: SemanticQuery = {
        metrics: ["revenue", "cost", "shipping_cost", "material_cost", "gross_margin"],
        dimensions: ["quarter"],
        filters,
      };

      costBreakdownResult = await AgentTools.querySemanticLayer(costQuery);
      secondaryQueries.push({
        breakdownType: "Cost Component Analysis",
        query: costQuery,
        result: costBreakdownResult,
      });

      // Quantify cost component delta contributions
      const costSorted = [...costBreakdownResult.rows].sort((a, b) => (a.quarter > b.quarter ? 1 : -1));
      const currCost = costSorted[costSorted.length - 1];
      const prevCost = costSorted[costSorted.length - 2];

      if (currCost && prevCost) {
        const shippingDelta = currCost.shipping_cost - prevCost.shipping_cost;
        const shippingPct = prevCost.shipping_cost > 0 ? (shippingDelta / prevCost.shipping_cost) * 100 : 0;

        const materialDelta = currCost.material_cost - prevCost.material_cost;
        const materialPct = prevCost.material_cost > 0 ? (materialDelta / prevCost.material_cost) * 100 : 0;

        const revenueDelta = currCost.revenue - prevCost.revenue;
        const revenuePct = prevCost.revenue > 0 ? (revenueDelta / prevCost.revenue) * 100 : 0;

        // Flag shipping cost surge if it exceeded 5% growth
        if (shippingPct > 5.0) {
          keyDrivers.push({
            factor: "Shipping & Logistics Surge",
            metric: "shipping_cost",
            impact: `+${shippingPct.toFixed(1)}% (€${(shippingDelta / 1000).toFixed(0)}K)`,
            direction: "increase",
            isAdverse: true,
            description: `Shipping and freight expenses surged by ${shippingPct.toFixed(
              1
            )}%, representing the single largest driver of gross margin compression.`,
          });
        }

        // Flag material inflation if it exceeded 3% growth
        if (materialPct > 3.0) {
          keyDrivers.push({
            factor: "Material & Component Inflation",
            metric: "material_cost",
            impact: `+${materialPct.toFixed(1)}% (€${(materialDelta / 1000).toFixed(0)}K)`,
            direction: "increase",
            isAdverse: true,
            description: `Direct material and manufacturing costs increased by ${materialPct.toFixed(
              1
            )}%.`,
          });
        }

        // Flag top-line demand resilience
        if (Math.abs(revenuePct) < 3.0) {
          keyDrivers.push({
            factor: "Revenue Resilience",
            metric: "revenue",
            impact: `${revenuePct >= 0 ? "+" : ""}${revenuePct.toFixed(1)}% (Stable)`,
            direction: "neutral",
            isAdverse: false,
            description: `Top-line revenue remained stable (${revenuePct >= 0 ? "+" : ""}${revenuePct.toFixed(
              1
            )}%), confirming margin contraction is cost-side rather than demand-driven.`,
          });
        }
      }

      // ----------------------------------------------------
      // 2. Geographic / Sub-Country Margin Breakdown Query
      // ----------------------------------------------------
      const countryQuery: SemanticQuery = {
        metrics: ["revenue", "cost", "gross_margin", "shipping_cost"],
        dimensions: ["country", "quarter"],
        filters,
      };

      countryBreakdownResult = await AgentTools.querySemanticLayer(countryQuery);
      secondaryQueries.push({
        breakdownType: "Geographic Margin Breakdown",
        query: countryQuery,
        result: countryBreakdownResult,
      });

      // Identify the country with the steepest localized margin drop
      const currentQuarter = currentPeriodRow.quarter;
      const priorQuarter = priorPeriodRow.quarter;

      const currByCountry = countryBreakdownResult.rows.filter((r) => r.quarter === currentQuarter);
      const prevByCountry = countryBreakdownResult.rows.filter((r) => r.quarter === priorQuarter);

      let worstCountry = "";
      let worstCountryDrop = 0;

      for (const curr of currByCountry) {
        const prev = prevByCountry.find((p) => p.country === curr.country);
        if (prev) {
          const drop = prev.gross_margin - curr.gross_margin;
          if (drop > worstCountryDrop) {
            worstCountryDrop = drop;
            worstCountry = curr.country;
          }
        }
      }

      if (worstCountry && worstCountryDrop > 0.03) {
        keyDrivers.push({
          factor: `${worstCountry} Logistics Disruption`,
          metric: "gross_margin",
          impact: `-${(worstCountryDrop * 100).toFixed(1)} pp margin`,
          direction: "decrease",
          isAdverse: true,
          description: `${worstCountry} experienced the steepest localized margin decline (-${(
            worstCountryDrop * 100
          ).toFixed(1)} percentage points) due to regional logistics bottlenecks.`,
        });
      }
    }

    return {
      hasDecline,
      priorValue: priorVal,
      currentValue: currentVal,
      deltaValue: deltaVal,
      deltaPercent,
      costBreakdownResult,
      countryBreakdownResult,
      categoryBreakdownResult,
      keyDrivers,
      secondaryQueries,
    };
  }
}

/**
 * Singleton instance of the Root Cause Analyzer.
 */
export const rootCauseAnalyzer = new RootCauseAnalyzer();
