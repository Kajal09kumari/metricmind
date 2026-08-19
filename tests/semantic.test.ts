import { semanticRegistry } from "../lib/semantic/registry";
import { semanticValidator } from "../lib/semantic/validator";
import { queryCompiler } from "../lib/semantic/compiler";
import { SemanticQuery } from "../types";

export function runSemanticTests() {
  console.log("\n🧪 Running Semantic Layer Tests...");
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Metric Lookup & Synonym Resolution
  const metric = semanticRegistry.getMetric("margin");
  assert(metric !== undefined && metric.name === "gross_margin", "Synonym 'margin' resolves to canonical metric 'gross_margin'");

  const metricSales = semanticRegistry.getMetric("sales");
  assert(metricSales !== undefined && metricSales.name === "revenue", "Synonym 'sales' resolves to canonical metric 'revenue'");

  const metricFreight = semanticRegistry.getMetric("freight");
  assert(metricFreight !== undefined && metricFreight.name === "shipping_cost", "Synonym 'freight' resolves to canonical metric 'shipping_cost'");

  // 2. Dimension Lookup
  const dim = semanticRegistry.getDimension("geo");
  assert(dim !== undefined && dim.name === "region", "Synonym 'geo' resolves to canonical dimension 'region'");

  // 3. Formula Verification
  const gmDef = semanticRegistry.getMetric("gross_margin");
  assert(gmDef?.formula === "(revenue - cost) / revenue", "Gross margin official formula is strictly (revenue - cost) / revenue");

  // 4. Validation - Valid Query
  const validQuery: SemanticQuery = {
    metrics: ["gross_margin"],
    dimensions: ["quarter"],
    filters: [{ dimension: "region", operator: "equals", value: "Europe" }],
  };
  const valResult = semanticValidator.validateQuery(validQuery);
  assert(valResult.valid === true, "Valid query with gross_margin, quarter, and Europe filter passes validation");

  // 5. Validation - Unknown Metric Rejection
  const invalidMetricQuery: SemanticQuery = {
    metrics: ["customer_happiness"],
    dimensions: ["quarter"],
  };
  const valInvMetric = semanticValidator.validateQuery(invalidMetricQuery);
  assert(valInvMetric.valid === false && valInvMetric.errors.length > 0, "Unknown metric 'customer_happiness' is strictly rejected");

  // 6. Validation - Unknown Dimension Rejection
  const invalidDimQuery: SemanticQuery = {
    metrics: ["revenue"],
    dimensions: ["astrological_sign"],
  };
  const valInvDim = semanticValidator.validateQuery(invalidDimQuery);
  assert(valInvDim.valid === false, "Unknown dimension 'astrological_sign' is strictly rejected");

  // 7. Query Compiler - Parameterized SQL
  const compiled = queryCompiler.compile(valResult.sanitizedQuery!);
  assert(compiled.sql.includes("sales_orders") && compiled.sql.includes("LIMIT"), "Query compiler generates SELECT statement against sales_orders with LIMIT");
  assert(compiled.params.includes("Europe"), "Query compiler parameterizes filter value 'Europe'");

  console.log(`  📊 Semantic Tests: ${passed} Passed, ${failed} Failed`);
  return { passed, failed };
}
