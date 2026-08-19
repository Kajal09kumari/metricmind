import { governanceEngine } from "../lib/governance/engine";
import { auditService } from "../lib/governance/audit";
import { SemanticQuery } from "../types";

export function runGovernanceTests() {
  console.log("\n🧪 Running Governance & Guardrail Tests...");
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

  // 1. Max Breakdown Dimensions Policy
  const excessiveDimsQuery: SemanticQuery = {
    metrics: ["revenue"],
    dimensions: ["quarter", "region", "country", "product_category"], // 4 dimensions (limit is 3)
  };
  const valDims = governanceEngine.validateSemanticQuery(excessiveDimsQuery);
  assert(valDims.valid === false, "Query with 4 breakdown dimensions is blocked by governance policy (limit 3)");

  // 2. Row Limit Enforcement / Auto-Capping
  const highRowLimitQuery: SemanticQuery = {
    metrics: ["revenue"],
    dimensions: ["country"],
    limit: 50000,
  };
  const valLimit = governanceEngine.validateSemanticQuery(highRowLimitQuery);
  assert(valLimit.sanitizedQuery?.limit === 5000, "High row limit request (50,000) is automatically capped to governance max (5,000)");

  // 3. Execution Budget / Watchdog Check
  const budgetNormal = governanceEngine.checkExecutionBudget(2, 4);
  assert(budgetNormal.allowed === true, "Execution within budget (2 queries, 4 steps) is permitted");

  const budgetExceeded = governanceEngine.checkExecutionBudget(6, 4);
  assert(budgetExceeded.allowed === false, "Execution exceeding query budget (6 queries > max 5) is gracefully blocked");

  // 4. Audit Trail Recording
  const audit = auditService.record({
    timestamp: new Date().toISOString(),
    userQuestion: "Test governance question",
    metrics: ["revenue"],
    dimensions: ["quarter"],
    semanticQuery: { metrics: ["revenue"] },
    queryCount: 1,
    executionTimeMs: 15,
    rowsReturned: 4,
    status: "success",
    governanceChecksPassed: true,
  });
  assert(audit.id.startsWith("aud-") && audit.status === "success", "Audit trail correctly records governed execution record");

  console.log(`  📊 Governance Tests: ${passed} Passed, ${failed} Failed`);
  return { passed, failed };
}
