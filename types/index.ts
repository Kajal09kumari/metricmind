// ==========================================
// Semantic Layer Types
// ==========================================

export type DataType = "number" | "percentage" | "currency" | "integer";
export type DimensionType = "string" | "date" | "number" | "boolean";

export interface MetricDefinition {
  name: string;
  label: string;
  description: string;
  formula: string;
  sqlFormula: string; // e.g. "SUM(revenue)", "(SUM(revenue) - SUM(cost)) / NULLIF(SUM(revenue), 0)"
  dataType: DataType;
  allowedDimensions: string[];
  synonyms: string[];
  category?: string;
  format?: string;
  sourceTable: string;
}

export interface DimensionDefinition {
  name: string;
  label: string;
  description: string;
  sqlColumn: string;
  dataType: DimensionType;
  allowedValues?: string[];
  synonyms: string[];
  category?: string;
}

export type FilterOperator =
  | "equals"
  | "not_equals"
  | "in"
  | "not_in"
  | "greater_than"
  | "less_than"
  | "contains"
  | "between";

export interface SemanticFilter {
  dimension: string;
  operator: FilterOperator;
  value: string | number | boolean | (string | number)[];
}

export interface TimeRange {
  type:
    | "all_time"
    | "current_quarter"
    | "previous_quarter"
    | "year_to_date"
    | "last_year"
    | "last_12_months"
    | "custom";
  startDate?: string;
  endDate?: string;
  granularity?: "day" | "month" | "quarter" | "year";
}

export interface SemanticQuery {
  metrics: string[];
  dimensions?: string[];
  filters?: SemanticFilter[];
  timeRange?: TimeRange;
  orderBy?: {
    field: string;
    direction: "asc" | "desc";
  }[];
  limit?: number;
}

export interface QueryColumn {
  name: string;
  label: string;
  type: DataType | DimensionType;
}

export interface QueryResult {
  columns: QueryColumn[];
  rows: Record<string, any>[];
  totalRows: number;
  executionTimeMs: number;
  compiledSql: string;
  provenance: DataProvenance;
}

export interface DataProvenance {
  sourceTable: string;
  datasetName: string;
  executedAt: string;
  queryId: string;
  warehouseProvider: string;
  rowCount: number;
  executionTimeMs: number;
}

// ==========================================
// Visualization & Analytics Types
// ==========================================

export type ChartType =
  | "line"
  | "bar"
  | "stacked_bar"
  | "area"
  | "donut"
  | "kpi"
  | "table"
  | "comparison";

export interface ChartSeries {
  key: string;
  label: string;
  color?: string;
  format?: DataType;
}

export interface VisualizationSpec {
  type: ChartType;
  title: string;
  description?: string;
  xAxis?: string;
  xAxisLabel?: string;
  yAxis?: string;
  yAxisLabel?: string;
  series?: ChartSeries[];
  data: Record<string, any>[];
  format?: DataType;
}

export interface KPISpec {
  metricName: string;
  label: string;
  currentValue: number;
  previousValue?: number;
  changeValue?: number;
  changePercentage?: number;
  format: DataType;
  direction?: "up" | "down" | "neutral";
  isPositiveChange?: boolean;
}

export interface KeyDriver {
  factor: string;
  metric: string;
  impact: string; // e.g. "+9.4% (€145K)"
  direction: "increase" | "decrease" | "neutral";
  isAdverse: boolean;
  description: string;
}

// ==========================================
// Governance & Audit Types
// ==========================================

export interface GovernanceLimits {
  maxAgentSteps: number;
  maxQueriesPerQuestion: number;
  maxRowsReturned: number;
  maxQueryExecutionTimeMs: number;
  maxBreakdownDimensions: number;
}

export interface GovernanceValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  sanitizedQuery?: SemanticQuery;
}

export interface QueryAudit {
  id: string;
  timestamp: string;
  userQuestion: string;
  metrics: string[];
  dimensions: string[];
  semanticQuery: SemanticQuery | unknown;
  generatedSql?: string;
  queryCount: number;
  executionTimeMs: number;
  rowsReturned: number;
  status: "success" | "blocked" | "failed";
  errorMessage?: string;
  governanceChecksPassed: boolean;
}

// ==========================================
// Agent Workflow & Reasoning Types
// ==========================================

export type AgentStepStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface AgentStep {
  id: string;
  stepName: string;
  label: string;
  status: AgentStepStatus;
  detail?: string;
  timestamp?: string;
  durationMs?: number;
}

export interface Intent {
  primaryMetric: string;
  targetDimensions: string[];
  filters: SemanticFilter[];
  timeRange?: TimeRange;
  isDiagnostic: boolean; // e.g. "Why did...", "What caused..."
  isComparative: boolean; // e.g. "Compare X with Y"
  targetEntity?: string; // e.g. "Europe", "Germany"
  userGoal: string;
}

export interface AnalysisResult {
  executiveSummary: string;
  keyTakeaways: string[];
  keyDrivers?: KeyDriver[];
  observedFacts: string[];
  analyticalInterpretation: string;
  hypotheses?: string[];
  kpis: KPISpec[];
}

export interface AgentState {
  question: string;
  steps: AgentStep[];
  intent?: Intent;
  metricDefinitions?: MetricDefinition[];
  dimensionDefinitions?: DimensionDefinition[];
  semanticQuery?: SemanticQuery;
  validationResult?: GovernanceValidationResult;
  primaryResult?: QueryResult;
  secondaryResults?: {
    breakdownType: string;
    query: SemanticQuery;
    result: QueryResult;
  }[];
  analysis?: AnalysisResult;
  visualization?: VisualizationSpec;
  secondaryVisualizations?: VisualizationSpec[];
  auditRecord?: QueryAudit;
  finalAnswer?: string;
  error?: string;
}

// ==========================================
// Warehouse Adapter Interface
// ==========================================

export interface WarehouseSchema {
  tables: {
    name: string;
    columns: { name: string; type: string }[];
  }[];
}

export interface WarehouseAdapter {
  name: string;
  executeQuery(sql: string, params?: any[]): Promise<{ rows: any[]; executionTimeMs: number }>;
  getSchema(): Promise<WarehouseSchema>;
  ping(): Promise<boolean>;
}

// ==========================================
// LLM Provider Interface
// ==========================================

export interface LLMMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface LLMProvider {
  name: string;
  generateText(messages: LLMMessage[]): Promise<string>;
  generateJSON<T>(messages: LLMMessage[], schemaDescription?: string): Promise<T>;
}
