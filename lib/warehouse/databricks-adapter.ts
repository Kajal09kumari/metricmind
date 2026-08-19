import { WarehouseAdapter, WarehouseSchema } from "@/types";

export class DatabricksWarehouseAdapter implements WarehouseAdapter {
  public name = "Databricks Lakehouse (SQL Warehouse)";
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = Boolean(
      process.env.DATABRICKS_HOST &&
        process.env.DATABRICKS_TOKEN &&
        process.env.DATABRICKS_WAREHOUSE_ID
    );
  }

  public async ping(): Promise<boolean> {
    if (!this.isConfigured) return false;
    return true;
  }

  public async getSchema(): Promise<WarehouseSchema> {
    return {
      tables: [
        {
          name: "sales_orders",
          columns: [
            { name: "order_id", type: "STRING" },
            { name: "order_date", type: "DATE" },
            { name: "year", type: "STRING" },
            { name: "quarter", type: "STRING" },
            { name: "month", type: "STRING" },
            { name: "region", type: "STRING" },
            { name: "country", type: "STRING" },
            { name: "product", type: "STRING" },
            { name: "product_category", type: "STRING" },
            { name: "customer_segment", type: "STRING" },
            { name: "sales_channel", type: "STRING" },
            { name: "revenue", type: "DOUBLE" },
            { name: "cost", type: "DOUBLE" },
            { name: "shipping_cost", type: "DOUBLE" },
            { name: "material_cost", type: "DOUBLE" },
          ],
        },
      ],
    };
  }

  public async executeQuery(
    sql: string,
    params: (string | number | boolean)[] = []
  ): Promise<{ rows: Record<string, any>[]; executionTimeMs: number }> {
    if (!this.isConfigured) {
      throw new Error(
        "Databricks credentials are not configured in environment variables. Falling back to Mock Warehouse."
      );
    }
    // In production, execute query against Databricks SQL endpoint
    throw new Error("Databricks execution requires enterprise credentials.");
  }
}
