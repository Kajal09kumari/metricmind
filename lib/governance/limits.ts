import { GovernanceLimits } from "@/types";

export const DEFAULT_GOVERNANCE_LIMITS: GovernanceLimits = {
  maxAgentSteps: parseInt(process.env.MAX_AGENT_STEPS || "8", 10),
  maxQueriesPerQuestion: parseInt(process.env.MAX_QUERIES_PER_QUESTION || "5", 10),
  maxRowsReturned: parseInt(process.env.MAX_ROWS_RETURNED || "5000", 10),
  maxQueryExecutionTimeMs: parseInt(process.env.MAX_QUERY_EXECUTION_TIME_MS || "10000", 10),
  maxBreakdownDimensions: 3,
};
