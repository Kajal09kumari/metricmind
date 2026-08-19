import { WarehouseSchema } from "@/types";

export interface WarehouseAdapter {
  name: string;
  executeQuery(
    sql: string,
    params?: (string | number | boolean)[]
  ): Promise<{ rows: Record<string, any>[]; executionTimeMs: number }>;
  getSchema(): Promise<WarehouseSchema>;
  ping(): Promise<boolean>;
}
