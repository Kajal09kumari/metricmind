"use client";

import { MetricDefinition } from "@/types";
import { Layers, ShieldCheck, Tag, Table } from "lucide-react";

interface MetricCardProps {
  metric: MetricDefinition;
}

export function MetricCard({ metric }: MetricCardProps) {
  return (
    <div className="p-5 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-foreground">{metric.label}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border">
              {metric.name}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            {metric.dataType}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {metric.description}
        </p>

        {/* Formula Box */}
        <div className="p-2.5 rounded-lg bg-muted/40 border border-border/80 font-mono text-xs space-y-1">
          <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Governed Business Formula</span>
          </div>
          <p className="font-semibold text-primary">{metric.formula}</p>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
        <div>
          <span className="text-[10px] font-semibold uppercase text-muted-foreground block mb-1">
            Allowed Breakdown Dimensions
          </span>
          <div className="flex flex-wrap gap-1">
            {metric.allowedDimensions.map((dim) => (
              <span
                key={dim}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground border"
              >
                {dim}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
          <Tag className="w-3 h-3" />
          <span className="font-medium">Synonyms:</span>
          <span className="truncate">{metric.synonyms.join(", ")}</span>
        </div>
      </div>
    </div>
  );
}
