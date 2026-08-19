import { z } from "zod";

export const FilterOperatorSchema = z.enum([
  "equals",
  "not_equals",
  "in",
  "not_in",
  "greater_than",
  "less_than",
  "contains",
  "between",
]);

export const SemanticFilterSchema = z.object({
  dimension: z.string(),
  operator: FilterOperatorSchema,
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.union([z.string(), z.number()])),
  ]),
});

export const TimeRangeSchema = z.object({
  type: z.enum([
    "all_time",
    "current_quarter",
    "previous_quarter",
    "year_to_date",
    "last_year",
    "last_12_months",
    "custom",
  ]),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  granularity: z.enum(["day", "month", "quarter", "year"]).optional(),
});

export const OrderBySchema = z.object({
  field: z.string(),
  direction: z.enum(["asc", "desc"]),
});

export const SemanticQuerySchema = z.object({
  metrics: z.array(z.string()).min(1, "At least one metric must be requested"),
  dimensions: z.array(z.string()).optional().default([]),
  filters: z.array(SemanticFilterSchema).optional().default([]),
  timeRange: TimeRangeSchema.optional(),
  orderBy: z.array(OrderBySchema).optional(),
  limit: z.number().int().positive().optional(),
});
