import { runSemanticTests } from "./semantic.test";
import { runGovernanceTests } from "./governance.test";
import { runAgentTests } from "./agent.test";

async function main() {
  console.log("=================================================");
  console.log("  MetricMind: Agentic Semantic BI Test Suite     ");
  console.log("=================================================");

  const t1 = runSemanticTests();
  const t2 = runGovernanceTests();
  const t3 = await runAgentTests();

  const totalPassed = t1.passed + t2.passed + t3.passed;
  const totalFailed = t1.failed + t2.failed + t3.failed;

  console.log("\n=================================================");
  console.log(`  SUMMARY: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log("=================================================");

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 ALL TESTS PASSED SUCCESSFULLY!\n");
    process.exit(0);
  }
}

main().catch((err) => {
  console.error("Test runner encountered an error:", err);
  process.exit(1);
});
