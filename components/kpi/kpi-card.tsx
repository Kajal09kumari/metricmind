"use client";

import { KPISpec } from "@/types";
import { formatValue, formatDelta, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  kpi: KPISpec;
  className?: string;
}

export function KPICard({ kpi, className }: KPICardProps) {
  const isPositive = kpi.isPositiveChange ?? (kpi.changeValue ? kpi.changeValue > 0 : true);
  const isNeutral = kpi.changeValue === 0 || kpi.changeValue === undefined;

  return (
    <div
      className={cn(
        "p-4 rounded-xl border border-border/80 bg-card/80 backdrop-blur-sm shadow-sm hover:shadow transition-all space-y-2",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {kpi.label}
        </p>
        {kpi.changePercentage !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
              isNeutral
                ? "bg-muted text-muted-foreground"
                : isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
            )}
          >
            {isNeutral ? (
              <Minus className="w-3 h-3" />
            ) : kpi.changePercentage > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {kpi.changePercentage > 0 ? "+" : ""}
              {kpi.changePercentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between">
        <div className="text-2xl font-bold tracking-tight text-foreground">
          {formatValue(kpi.currentValue, kpi.format)}
        </div>
      </div>

      {kpi.previousValue !== undefined && (
        <p className="text-[11px] text-muted-foreground font-medium">
          Prior Period:{" "}
          <span className="font-semibold text-foreground/80">
            {formatValue(kpi.previousValue, kpi.format)}
          </span>{" "}
          ({formatDelta(kpi.changeValue || 0, kpi.format)})
        </p>
      )}
    </div>
  );
}
