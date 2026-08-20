/**
 * @file Deterministic Intent Extraction & Semantic Agent Engine
 * @module lib/llm/mock-llm-provider
 * @description
 * High-performance, zero-latency natural language intent extractor and query planner.
 * Accurately parses executive queries into structured `Intent` representations,
 * mapping business terminology to canonical metrics and dimensions with zero external API calls.
 */

import { LLMMessage, LLMProvider, Intent, SemanticFilter } from "@/types";
import { semanticRegistry } from "@/lib/semantic/registry";

/**
 * MockLLMProvider provides deterministic intent extraction and query planning.
 */
export class MockLLMProvider implements LLMProvider {
  /** Engine display identifier */
  public name = "Deterministic Semantic Agent Engine";

  /**
   * Generates standard text responses.
   * @param messages Array of conversational messages
   * @returns Response text
   */
  public async generateText(messages: LLMMessage[]): Promise<string> {
    const lastMsg = messages[messages.length - 1]?.content || "";
    return `Analysis completed based on governed semantic warehouse data for query: "${lastMsg}".`;
  }

  /**
   * Generates typed structured JSON from prompts.
   * @param messages Conversational message history
   * @param schemaDescription Schema expectation tag
   * @returns Parsed object conforming to generic type T
   */
  public async generateJSON<T>(messages: LLMMessage[], schemaDescription?: string): Promise<T> {
    const userMsg = messages.find((m) => m.role === "user")?.content || "";

    // 1. Handle Intent Extraction requests
    if (schemaDescription?.includes("Intent") || schemaDescription?.includes("intent")) {
      return this.extractIntent(userMsg) as unknown as T;
    }

    return {} as T;
  }

  /**
   * Extracts business intent, metrics, dimensions, filters, and diagnostic flags from a natural language prompt.
   *
   * @param question User natural language business question
   * @returns Structured Intent object containing primaryMetric, targetDimensions, filters, and timeRange
   */
  public extractIntent(question: string): Intent {
    const lower = question.toLowerCase();

    // 1. Identify Target Metric
    let primaryMetric = "revenue"; // default fallback
    const allMetrics = semanticRegistry.listMetrics();

    // Check direct names and synonyms from semantic registry
    for (const metric of allMetrics) {
      if (lower.includes(metric.name.toLowerCase()) || lower.includes(metric.label.toLowerCase())) {
        primaryMetric = metric.name;
        break;
      }
      for (const syn of metric.synonyms) {
        if (lower.includes(syn.toLowerCase())) {
          primaryMetric = metric.name;
          break;
        }
      }
    }

    // Explicit domain keyword rules
    if (lower.includes("margin") || lower.includes("margins") || lower.includes("profitability")) {
      primaryMetric = "gross_margin";
    } else if (lower.includes("shipping") || lower.includes("freight") || lower.includes("delivery cost")) {
      primaryMetric = "shipping_cost";
    } else if (lower.includes("material") || lower.includes("materials") || lower.includes("manufacturing cost")) {
      primaryMetric = "material_cost";
    } else if (lower.includes("profit") && !lower.includes("margin")) {
      primaryMetric = "gross_profit";
    } else if (lower.includes("orders") || lower.includes("volume") || lower.includes("transactions")) {
      primaryMetric = "orders";
    } else if (lower.includes("aov") || lower.includes("basket") || lower.includes("average order")) {
      primaryMetric = "aov";
    }

    // 2. Identify Dimensional Slicing & Filters
    const filters: SemanticFilter[] = [];
    const targetDimensions: string[] = [];

    // Region filters
    if (lower.includes("europe") || lower.includes("european")) {
      filters.push({ dimension: "region", operator: "equals", value: "Europe" });
    } else if (lower.includes("north america") || lower.includes("na ") || lower.includes("us ")) {
      if (lower.includes("north america")) {
        filters.push({ dimension: "region", operator: "equals", value: "North America" });
      }
    } else if (lower.includes("apac") || lower.includes("asia")) {
      filters.push({ dimension: "region", operator: "equals", value: "Asia Pacific" });
    }

    // Country filters
    const countries = [
      "germany",
      "united kingdom",
      "uk",
      "france",
      "italy",
      "spain",
      "united states",
      "canada",
      "japan",
      "australia",
      "brazil",
    ];
    for (const c of countries) {
      if (lower.includes(c)) {
        const countryName =
          c === "uk"
            ? "United Kingdom"
            : c.charAt(0).toUpperCase() + c.slice(1);
        filters.push({ dimension: "country", operator: "equals", value: countryName });
      }
    }

    // Time Dimensions & Range Filters
    let timeRange: Intent["timeRange"] = undefined;

    if (lower.includes("last quarter") || lower.includes("previous quarter") || lower.includes("q4")) {
      targetDimensions.push("quarter");
      timeRange = { type: "year_to_date" };
    } else if (lower.includes("monthly") || lower.includes("month") || lower.includes("12 months")) {
      targetDimensions.push("month");
      timeRange = { type: "last_12_months" };
    } else if (lower.includes("this year") || lower.includes("year to date") || lower.includes("ytd")) {
      timeRange = { type: "year_to_date" };
    }

    // Explicit breakdown requests in query string
    if (lower.includes("by region") || lower.includes("across regions")) {
      if (!targetDimensions.includes("region")) targetDimensions.push("region");
    }
    if (lower.includes("by country") || lower.includes("across countries")) {
      if (!targetDimensions.includes("country")) targetDimensions.push("country");
    }
    if (
      lower.includes("by product") ||
      lower.includes("product category") ||
      lower.includes("by category")
    ) {
      if (!targetDimensions.includes("product_category")) targetDimensions.push("product_category");
    }
    if (lower.includes("by channel") || lower.includes("sales channel")) {
      if (!targetDimensions.includes("sales_channel")) targetDimensions.push("sales_channel");
    }

    // Default time dimension for diagnostic questions
    if (targetDimensions.length === 0) {
      if (lower.includes("why") || lower.includes("drop") || lower.includes("decline") || lower.includes("trend") || lower.includes("drop last quarter")) {
        targetDimensions.push("quarter");
      } else if (filters.some((f) => f.dimension === "region")) {
        targetDimensions.push("quarter");
      } else {
        targetDimensions.push("region");
      }
    }

    // Classify question diagnostic / comparative nature
    const isDiagnostic =
      lower.includes("why") ||
      lower.includes("what caused") ||
      lower.includes("explain") ||
      lower.includes("reason") ||
      lower.includes("driver") ||
      lower.includes("drop") ||
      lower.includes("decrease");

    const isComparative =
      lower.includes("compare") ||
      lower.includes("versus") ||
      lower.includes("vs") ||
      lower.includes("difference");

    return {
      primaryMetric,
      targetDimensions,
      filters,
      timeRange,
      isDiagnostic,
      isComparative,
      userGoal: question,
    };
  }
}

/**
 * Singleton instance of the Mock LLM Provider.
 */
export const mockLLMProvider = new MockLLMProvider();
