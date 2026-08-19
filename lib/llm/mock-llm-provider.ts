import { LLMMessage, LLMProvider, Intent, SemanticFilter } from "@/types";
import { semanticRegistry } from "@/lib/semantic/registry";

export class MockLLMProvider implements LLMProvider {
  public name = "Deterministic Semantic Agent Engine";

  public async generateText(messages: LLMMessage[]): Promise<string> {
    const lastMsg = messages[messages.length - 1]?.content || "";
    return `Analysis completed based on governed semantic warehouse data for query: "${lastMsg}".`;
  }

  public async generateJSON<T>(messages: LLMMessage[], schemaDescription?: string): Promise<T> {
    const userMsg = messages.find((m) => m.role === "user")?.content || "";
    const lower = userMsg.toLowerCase();

    // 1. Intent Extraction
    if (schemaDescription?.includes("Intent") || schemaDescription?.includes("intent")) {
      return this.extractIntent(userMsg) as unknown as T;
    }

    // Default fallback
    return {} as T;
  }

  public extractIntent(question: string): Intent {
    const lower = question.toLowerCase();

    // 1. Identify Metric
    let primaryMetric = "revenue"; // default
    const allMetrics = semanticRegistry.listMetrics();

    // Check direct names and synonyms
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

    // Specific phrase rules
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

    // 2. Identify Dimensions & Filters
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

    // Time Dimensions & Filters
    let timeRange: Intent["timeRange"] = undefined;

    if (lower.includes("last quarter") || lower.includes("previous quarter") || lower.includes("q4")) {
      // In executive BI, trend analysis across quarters shows prior vs last
      targetDimensions.push("quarter");
      timeRange = { type: "year_to_date" }; // retrieve quarters in year to show drop
    } else if (lower.includes("monthly") || lower.includes("month") || lower.includes("12 months")) {
      targetDimensions.push("month");
      timeRange = { type: "last_12_months" };
    } else if (lower.includes("this year") || lower.includes("year to date") || lower.includes("ytd")) {
      timeRange = { type: "year_to_date" };
    }

    // Dimension breakdown requests in prompt
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

    // Default dimension for trend questions
    if (targetDimensions.length === 0) {
      if (lower.includes("why") || lower.includes("drop") || lower.includes("decline") || lower.includes("trend") || lower.includes("drop last quarter")) {
        targetDimensions.push("quarter");
      } else if (filters.some((f) => f.dimension === "region")) {
        targetDimensions.push("quarter");
      } else {
        targetDimensions.push("region");
      }
    }

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

export const mockLLMProvider = new MockLLMProvider();
