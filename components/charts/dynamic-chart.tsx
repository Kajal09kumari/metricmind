"use client";

import { VisualizationSpec } from "@/types";
import { LineTrendChart } from "./line-trend-chart";
import { BarBreakdownChart } from "./bar-breakdown-chart";
import { KPICard } from "@/components/kpi/kpi-card";
import { BarChart3, LineChart as LineIcon } from "lucide-react";

interface DynamicChartProps {
  spec: VisualizationSpec;
  className?: string;
}

export function DynamicChart({ spec, className }: DynamicChartProps) {
  if (!spec || !spec.data || spec.data.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm border border-dashed rounded-xl">
        No visualizable data points returned.
      </div>
    );
  }

  if (spec.type === "kpi" && spec.data.length > 0) {
    const row = spec.data[0];
    const val = spec.yAxis ? row[spec.yAxis] : 0;
    return (
      <KPICard
        kpi={{
          metricName: spec.yAxis || "kpi",
          label: spec.title,
          currentValue: val,
          format: spec.format || "number",
        }}
      />
    );
  }

  return (
    <div className={`p-4 rounded-xl border border-border/80 bg-card/60 backdrop-blur-sm ${className || ""}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-foreground tracking-tight">{spec.title}</h4>
          {spec.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{spec.description}</p>
          )}
        </div>
        <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/60 text-[11px] font-medium text-muted-foreground border">
          {spec.type === "line" ? <LineIcon className="w-3 h-3" /> : <BarChart3 className="w-3 h-3" />}
          <span className="capitalize">{spec.type} View</span>
        </div>
      </div>

      {spec.type === "line" ? (
        <LineTrendChart spec={spec} />
      ) : (
        <BarBreakdownChart spec={spec} />
      )}
    </div>
  );
}
