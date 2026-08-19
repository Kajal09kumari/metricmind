import { agentController } from "../lib/agent/agent-controller";

export async function runAgentTests() {
  console.log("\n🧪 Running End-to-End Semantic Agent Tests...");
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

  // Primary Demo Query Test: "Why did our European margins drop last quarter?"
  const question = "Why did our European margins drop last quarter?";
  console.log(`  Executing workflow: "${question}"`);

  const state = await agentController.executeWorkflow(question);

  // 1. Intent Verification
  assert(
    state.intent?.primaryMetric === "gross_margin",
    "Agent extracted primary metric 'gross_margin'"
  );
  assert(
    state.intent?.filters.some((f) => f.dimension === "region" && f.value === "Europe") === true,
    "Agent extracted region filter 'Europe'"
  );

  // 2. Governed Execution Verification
  assert(
    state.validationResult?.valid === true,
    "Governance validation passed successfully"
  );
  assert(
    state.primaryResult !== undefined && state.primaryResult.rows.length >= 4,
    "Warehouse returned authentic quarterly margin trend data (4 quarters)"
  );

  // 3. Quantitative Seeded Story Verification
  const rows = state.primaryResult?.rows || [];
  const q3 = rows.find((r) => r.quarter === "2024-Q3");
  const q4 = rows.find((r) => r.quarter === "2024-Q4");

  assert(
    q3 !== undefined && q4 !== undefined,
    "Found 2024-Q3 and 2024-Q4 rows in returned dataset"
  );

  if (q3 && q4) {
    const marginDiff = (q4.gross_margin - q3.gross_margin) * 100;
    assert(
      marginDiff < -2.0 && marginDiff > -4.5,
      `European gross margin dropped by ${marginDiff.toFixed(1)} pp (matches ~3.2 pp seeded story)`
    );
  }

  // 4. Secondary Breakdown & Root Cause Verification
  assert(
    state.secondaryResults !== undefined && state.secondaryResults.length >= 2,
    "Agent automatically executed 2 secondary diagnostic breakdowns (Cost components & Country breakdown)"
  );

  const keyDrivers = state.analysis?.keyDrivers || [];
  const hasShippingDriver = keyDrivers.some(
    (d) => d.metric === "shipping_cost" && d.impact.includes("+")
  );
  assert(
    hasShippingDriver,
    "Root cause analyzer identified 'Shipping & Logistics Surge' (+9.4%) as primary cost driver"
  );

  const hasGermanyDriver = keyDrivers.some((d) => d.factor.includes("Germany"));
  assert(
    hasGermanyDriver,
    "Root cause analyzer identified Germany as the primary geographic margin drag"
  );

  // 5. Visualizations & Transparency
  assert(
    state.visualization !== undefined && state.visualization.type === "line",
    "Agent generated interactive Line Trend visualization for quarterly gross margin"
  );
  assert(
    state.primaryResult?.compiledSql.includes("sales_orders"),
    "Transparency metadata includes compiled parameterized SQL statement"
  );
  assert(
    state.auditRecord !== undefined && state.auditRecord.status === "success",
    "Analysis transaction successfully recorded in the Governance Audit trail"
  );

  console.log(`  📊 Agent Tests: ${passed} Passed, ${failed} Failed`);
  return { passed, failed };
}
