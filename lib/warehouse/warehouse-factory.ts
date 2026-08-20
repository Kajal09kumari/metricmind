/**
 * @file Enterprise Warehouse Adapter Factory
 * @module lib/warehouse/warehouse-factory
 * @description
 * Instantiates and returns the configured enterprise warehouse adapter (Mock In-Memory,
 * Snowflake Data Cloud, or Databricks Lakehouse SQL Warehouse) based on environment configuration.
 */

import { WarehouseAdapter } from "@/types";
import { MockWarehouseAdapter, mockWarehouseAdapter } from "./mock-adapter";
import { SnowflakeWarehouseAdapter } from "./snowflake-adapter";
import { DatabricksWarehouseAdapter } from "./databricks-adapter";

/**
 * Returns the active WarehouseAdapter based on `WAREHOUSE_PROVIDER` in environment variables.
 * Defaults to `mockWarehouseAdapter` for 100% offline, zero-config local development.
 *
 * @returns An instance implementing the WarehouseAdapter interface
 */
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
