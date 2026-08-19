<<<<<<< HEAD
# metricmind
=======
# MetricMind — Agentic Semantic BI Engine

> **Governed, accurate, and explainable conversational Business Intelligence powered by semantic layers and AI agents.**

---

## 1. Architectural Philosophy

Traditional Text-to-SQL solutions suffer from critical enterprise flaws:
* **Hallucinated SQL**: Fabricating table joins, schemas, and non-existent columns.
* **Incorrect Metric Calculations**: Inventing conflicting definitions for revenue, gross margin, ARR, or churn.
* **Unrestricted Warehouse Vulnerabilities**: Exposing raw database DDL/DML and potential SQL injection.
* **Non-Deterministic Prose**: Calculating figures directly in LLM text generation instead of querying structured database records.

### MetricMind Principle
> **The LLM must NOT freely generate SQL against raw warehouse tables.**  
> `Natural Language → Agent Controller → Semantic Layer Registry → Governed API / Query Validator → Query Compiler → Warehouse Adapter → Structured Result → Explanation + Visualization`

```text
                         ┌───────────────────────┐
                         │     Next.js 14 UI     │
                         │ Chat + Charts + Data  │
                         └───────────┬───────────┘
                                     │  (JSON / Stream)
                                     ▼
                         ┌───────────────────────┐
                         │   Agent Controller    │
                         │ Multi-Step Reasoning  │
                         └───────────┬───────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    ▼                                 ▼
          ┌───────────────────┐             ┌───────────────────┐
          │ Semantic Registry │             │ Governance Engine │
          │ Metrics/Dimensions│             │ Limits/Validation │
          └─────────┬─────────┘             └─────────┬─────────┘
                    │                                 │
                    └────────────────┬────────────────┘
                                     ▼
                         ┌───────────────────────┐
                         │   Semantic Query API  │
                         └───────────┬───────────┘
                                     ▼
                         ┌───────────────────────┐
                         │    Query Compiler     │
                         └───────────┬───────────┘
                                     ▼
                         ┌───────────────────────┐
                         │      Warehouse        │
                         │ Mock / Snowflake / DBX│
                         └───────────────────────┘
```

---

## 2. Primary Demo Use Case

### Executive Question:
> *"Why did our European margins drop last quarter?"*

### Autonomous Multi-Step Agent Workflow:
1. **Intent Extraction**: Identifies primary metric (`gross_margin`), geographical filter (`region = 'Europe'`), and time period (quarterly series in 2024).
2. **Semantic Metadata Retrieval**: Pulls official formula `(revenue - cost) / revenue` and allowed breakdown dimensions from the Semantic Registry.
3. **Query Construction & Validation**: Emits a strongly-typed `SemanticQuery` AST, verified by the Governance Engine.
4. **Warehouse Execution**: Compiles into parameterized SQL and executes against the sales warehouse.
5. **Variance Detection**: Observes that European gross margin dropped from **41.8% in Q3 to 38.6% in Q4 (–3.2 percentage points)**.
6. **Automated Secondary Breakdown**:
   - **Cost Component Analysis**: Identifies that European shipping costs surged by **+9.4% (€145K increase)** and material costs rose +3.8%, while revenue remained steady (+0.8%).
   - **Geographic Breakdown**: Discovers that **Germany** experienced a severe localized margin contraction (–6.1 pp) due to logistics freight bottlenecks.
7. **Synthesis & Transparency**: Generates an executive summary, KPI delta cards, interactive trend/breakdown charts, and an inspectable transparency drawer with compiled SQL, formula definitions, and data provenance.

---

## 3. Technology Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React, Recharts.
- **Backend**: Next.js Route Handlers (`app/api/*`).
- **Semantic Layer**: Strongly-typed Semantic Registry compatible with Cube.dev and dbt Semantic Layer paradigms.
- **Warehouse Adapters**:
  - `MockWarehouseAdapter`: In-memory relational SQL engine seeded with 3,200+ realistic enterprise sales transactions.
  - `SnowflakeWarehouseAdapter`: Snowflake Data Cloud enterprise connector skeleton.
  - `DatabricksWarehouseAdapter`: Databricks Lakehouse (SQL Warehouse) connector skeleton.
- **AI / LLM Orchestration**:
  - `LLMProvider` abstraction supporting OpenAI (`gpt-4o`), Anthropic, Gemini, and a built-in deterministic semantic analytical engine.
- **Governance**: Configurable query execution limits, step limits, row capping, SQL parameterization, and audit logging.

---

## 4. Semantic Model Definitions

### Core Metrics

| Metric Name | Official Formula | SQL Implementation | Type | Category |
| :--- | :--- | :--- | :--- | :--- |
| **`revenue`** | `SUM(order_revenue)` | `SUM(revenue)` | Currency | Financial |
| **`cost`** | `SUM(total_cost)` | `SUM(cost)` | Currency | Financial |
| **`gross_profit`** | `revenue - cost` | `SUM(revenue) - SUM(cost)` | Currency | Financial |
| **`gross_margin`** | `(revenue - cost) / revenue` | `CAST(SUM(revenue) - SUM(cost) AS FLOAT) / NULLIF(SUM(revenue), 0)` | Percentage | Financial |
| **`orders`** | `COUNT(order_id)` | `COUNT(order_id)` | Integer | Operations |
| **`aov`** | `revenue / orders` | `CAST(SUM(revenue) AS FLOAT) / NULLIF(COUNT(order_id), 0)` | Currency | Operations |
| **`shipping_cost`** | `SUM(shipping_cost)` | `SUM(shipping_cost)` | Currency | Logistics |
| **`material_cost`** | `SUM(material_cost)` | `SUM(material_cost)` | Currency | Manufacturing |

### Dimensions
- `date`, `year`, `quarter`, `month` (Time)
- `region`, `country` (Geography)
- `product`, `product_category` (Product)
- `customer_segment`, `sales_channel` (Operations)

---

## 5. Governance & Guardrails

The Governance Engine (`lib/governance/engine.ts`) enforces strict limits:

```typescript
const GOVERNANCE_LIMITS = {
  maxAgentSteps: 8,              // Stops exploratory infinite loops
  maxQueriesPerQuestion: 5,      // Protects warehouse compute
  maxRowsReturned: 5000,         // Protects memory and bandwidth
  maxQueryExecutionTimeMs: 10000,// Query timeout safety
  maxBreakdownDimensions: 3      // Prevents high-cardinality explosions
};
```

All interactions are recorded in the server-side **Governance Audit Trail** (`/admin`), tracking query latency, row counts, compiled SQL statements, and policy validation outcomes.

---

## 6. How MetricMind Prevents LLM Hallucinations

1. **Decoupled Business Logic**: Business formulas are declared in code within the Semantic Registry. The LLM cannot change `gross_margin` or invent calculations.
2. **No Raw SQL Tooling**: The Agent is never given an `execute_sql` tool. It can only emit a structured `SemanticQuery` JSON.
3. **Deterministic Compiler**: A compiler translates the structured `SemanticQuery` into parameterized SQL.
4. **Fact-First Explanation**: The Response Synthesizer injects verified database numbers into the prompt context for explanation, guaranteeing that every stated number exists in the database.
5. **Auditable Provenance**: Users can inspect the exact SQL, source table, execution time, and query ID behind every chart.

---

## 7. Local Development & Quick Start

### 1. Installation
```bash
npm install
```

### 2. Configure Environment (Optional)
MetricMind runs 100% locally out-of-the-box in mock mode with zero configuration needed. To connect external LLMs or warehouses:
```bash
cp .env.example .env.local
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Test Suite
```bash
npm test
```

---

## 8. Enterprise Deployment

### Connecting Snowflake
In `.env.local`:
```env
WAREHOUSE_PROVIDER=snowflake
SNOWFLAKE_ACCOUNT=xy12345.us-east-1
SNOWFLAKE_USERNAME=analytics_svc
SNOWFLAKE_PASSWORD=secret_password
SNOWFLAKE_DATABASE=ENTERPRISE_EDW
SNOWFLAKE_SCHEMA=CORE_SALES
SNOWFLAKE_WAREHOUSE=COMPUTE_WH
```

### Connecting Databricks
In `.env.local`:
```env
WAREHOUSE_PROVIDER=databricks
DATABRICKS_HOST=https://adb-123456789.azuredatabricks.net
DATABRICKS_TOKEN=dapi_secret_token
DATABRICKS_WAREHOUSE_ID=ab1234c5678d90e
```
>>>>>>> cef1b8a (feat: complete MetricMind Agentic Semantic BI Engine)
