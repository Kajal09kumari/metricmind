"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { VisualizationSpec } from "@/types";
import { formatValue } from "@/lib/utils";

interface BarBreakdownChartProps {
  spec: VisualizationSpec;
}

export function BarBreakdownChart({ spec }: BarBreakdownChartProps) {
  const { data, series = [], xAxis = "country", format = "number" } = spec;

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-muted/30" />
          <XAxis
            dataKey={xAxis}
            stroke="currentColor"
            className="text-xs text-muted-foreground"
            tickLine={false}
          />
          <YAxis
            stroke="currentColor"
            className="text-xs text-muted-foreground"
            tickLine={false}
            axisLine={false}
            tickFormatter={(val) => formatValue(val, format)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
              borderRadius: "0.5rem",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              fontSize: "12px",
            }}
            formatter={(value: any, name: any) => [formatValue(value, format), name]}
            labelStyle={{ fontWeight: "bold", color: "hsl(var(--foreground))" }}
          />
          {series.length > 1 && <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />}
          {series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color || "#3B82F6"}
              radius={[4, 4, 0, 0]}
              maxBarSize={50}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
