import { WarehouseAdapter } from "@/types";
import { MockWarehouseAdapter, mockWarehouseAdapter } from "./mock-adapter";
import { SnowflakeWarehouseAdapter } from "./snowflake-adapter";
import { DatabricksWarehouseAdapter } from "./databricks-adapter";

export function getWarehouseAdapter(): WarehouseAdapter {
  const provider = (process.env.WAREHOUSE_PROVIDER || "mock").toLowerCase();

  switch (provider) {
    case "snowflake":
      return new SnowflakeWarehouseAdapter();
    case "databricks":
      return new DatabricksWarehouseAdapter();
    case "mock":
    default:
      return mockWarehouseAdapter;
  }
}
