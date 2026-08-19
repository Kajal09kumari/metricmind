"use client";

import { DimensionDefinition } from "@/types";
import { Database, Filter, Tag } from "lucide-react";

interface DimensionCardProps {
  dimension: DimensionDefinition;
}

export function DimensionCard({ dimension }: DimensionCardProps) {
  return (
    <div className="p-5 rounded-xl border border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-foreground">{dimension.label}</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground border">
              {dimension.name}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            {dimension.dataType}
          </span>
        </div>

        <p className="text-xs text-muted-foreground leading-relaxed">
          {dimension.description}
        </p>

        <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground bg-muted/40 p-2 rounded border border-border">
          <Database className="w-3.5 h-3.5" />
          <span>Warehouse Column:</span>
          <span className="font-bold text-foreground">{dimension.sqlColumn}</span>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-border/60 text-xs">
        {dimension.allowedValues && dimension.allowedValues.length > 0 && (
          <div>
            <span className="text-[10px] font-semibold uppercase text-muted-foreground block mb-1">
              Sample Allowed Values ({dimension.allowedValues.length})
            </span>
            <div className="flex flex-wrap gap-1">
              {dimension.allowedValues.slice(0, 6).map((val) => (
                <span
                  key={val}
                  className="text-[10px] px-1.5 py-0.5 rounded bg-muted/80 text-muted-foreground border"
                >
                  {val}
                </span>
              ))}
              {dimension.allowedValues.length > 6 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded text-muted-foreground">
                  +{dimension.allowedValues.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
          <Tag className="w-3 h-3" />
          <span className="font-medium">Synonyms:</span>
          <span className="truncate">{dimension.synonyms.join(", ")}</span>
        </div>
      </div>
    </div>
  );
}
