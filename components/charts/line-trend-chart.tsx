"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { VisualizationSpec } from "@/types";
import { formatValue } from "@/lib/utils";

interface LineTrendChartProps {
  spec: VisualizationSpec;
}

export function LineTrendChart({ spec }: LineTrendChartProps) {
  const { data, series = [], xAxis = "quarter", format = "number" } = spec;

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
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
          {series.map((s, idx) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color || "#3B82F6"}
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
