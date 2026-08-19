"use client";

import { AnalysisResult } from "@/types";
import { KPICard } from "@/components/kpi/kpi-card";
import {
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Activity,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ExecutiveSummaryProps {
  analysis: AnalysisResult;
}

export function ExecutiveSummary({ analysis }: ExecutiveSummaryProps) {
  const {
    executiveSummary,
    kpis = [],
    keyDrivers = [],
    observedFacts = [],
    analyticalInterpretation,
    hypotheses = [],
  } = analysis;

  return (
    <div className="space-y-4">
      {/* Primary Executive Answer Card */}
      <div className="p-4 sm:p-5 rounded-xl border border-blue-500/30 bg-gradient-to-br from-blue-500/5 via-card to-indigo-500/5 backdrop-blur-sm shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-500 text-white flex items-center justify-center shadow-sm">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Executive Summary & Root Cause
          </span>
        </div>

        <p className="text-sm font-medium text-foreground leading-relaxed">
          {executiveSummary}
        </p>

        {/* Key Driver Badges */}
        {keyDrivers.length > 0 && (
          <div className="pt-2 space-y-2">
            <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              <span>Identified Key Drivers</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {keyDrivers.map((driver, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "p-3 rounded-lg border text-xs space-y-1 transition-all",
                    driver.isAdverse
                      ? "bg-rose-500/5 border-rose-500/20 text-foreground"
                      : "bg-emerald-500/5 border-emerald-500/20 text-foreground"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{driver.factor}</span>
                    <span
                      className={cn(
                        "font-mono font-bold text-[11px]",
                        driver.isAdverse ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                      )}
                    >
                      {driver.impact}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {driver.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* KPI Cards Grid */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {kpis.map((kpi, idx) => (
            <KPICard key={idx} kpi={kpi} />
          ))}
        </div>
      )}

      {/* Observed Facts vs Analytical Interpretation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Observed Facts */}
        {observedFacts.length > 0 && (
          <div className="p-4 rounded-xl border border-border/80 bg-card space-y-2">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Observed Warehouse Facts</span>
            </div>
            <ul className="space-y-1.5 text-muted-foreground list-disc list-inside">
              {observedFacts.map((fact, idx) => (
                <li key={idx} className="leading-relaxed">
                  <span className="text-foreground/90">{fact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Analytical Interpretation & Recommendations */}
        {analyticalInterpretation && (
          <div className="p-4 rounded-xl border border-border/80 bg-card space-y-2">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>Analytical Interpretation</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {analyticalInterpretation}
            </p>
            {hypotheses.length > 0 && (
              <div className="pt-2 border-t border-border/60 text-[11px] text-muted-foreground/80 space-y-1">
                <span className="font-semibold text-foreground">Operational Factors:</span>
                <p>{hypotheses[0]}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
