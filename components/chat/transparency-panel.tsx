"use client";

import { useState } from "react";
import {
  MetricDefinition,
  SemanticQuery,
  DataProvenance,
} from "@/types";
import {
  Code2,
  Database,
  FileCode,
  Info,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TransparencyPanelProps {
  metricDefinitions?: MetricDefinition[];
  semanticQuery?: SemanticQuery;
  compiledSql?: string;
  provenance?: DataProvenance;
}

export function TransparencyPanel({
  metricDefinitions = [],
  semanticQuery,
  compiledSql,
  provenance,
}: TransparencyPanelProps) {
  const [activeTab, setActiveTab] = useState<
    "metrics" | "semantic" | "sql" | "provenance"
  >("metrics");
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-muted/30 hover:bg-muted/50 flex items-center justify-between transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Info className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-foreground">
            Transparency & Governance Inspector
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            Read-Only Provenance
          </span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{isOpen ? "Collapse Details" : "View SQL, Semantic AST & Provenance"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded Content */}
      {isOpen && (
        <div className="p-4 border-t border-border/80 space-y-4">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 border-b border-border/60 pb-2 overflow-x-auto">
            <button
              onClick={() => setActiveTab("metrics")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                activeTab === "metrics"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Metric Definition ({metricDefinitions.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("semantic")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                activeTab === "semantic"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Semantic Query AST</span>
            </button>

            <button
              onClick={() => setActiveTab("sql")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                activeTab === "sql"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Compiled SQL</span>
            </button>

            <button
              onClick={() => setActiveTab("provenance")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                activeTab === "provenance"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Data Provenance</span>
            </button>
          </div>

          {/* TAB 1: Metric Definitions */}
          {activeTab === "metrics" && (
            <div className="space-y-3">
              {metricDefinitions.length === 0 ? (
                <p className="text-xs text-muted-foreground">No metric definitions associated.</p>
              ) : (
                metricDefinitions.map((metric) => (
                  <div
                    key={metric.name}
                    className="p-3 rounded-lg border border-border/80 bg-muted/20 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{metric.label}</span>
                        <span className="font-mono text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {metric.name}
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                        {metric.dataType}
                      </span>
                    </div>

                    <p className="text-muted-foreground text-xs">{metric.description}</p>

                    <div className="p-2 rounded bg-background border border-border font-mono text-[11px] space-y-1">
                      <div className="text-muted-foreground text-[10px] uppercase font-bold">
                        Official Semantic Formula:
                      </div>
                      <div className="text-primary font-bold">{metric.formula}</div>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-muted-foreground font-semibold">
                        Allowed Dimensions:
                      </span>
                      {metric.allowedDimensions.map((d) => (
                        <span
                          key={d}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border"
                        >
                          {d}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <span className="font-semibold">Synonyms:</span>
                      <span>{metric.synonyms.join(", ")}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Semantic Query AST */}
          {activeTab === "semantic" && (
            <div className="relative">
              <button
                onClick={() => copyToClipboard(JSON.stringify(semanticQuery, null, 2))}
                className="absolute top-2 right-2 p-1.5 rounded bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy JSON"}</span>
              </button>
              <pre className="p-3 rounded-lg bg-muted/40 border border-border/80 font-mono text-xs text-foreground/90 overflow-x-auto">
                {JSON.stringify(semanticQuery, null, 2) || "// No semantic query AST available"}
              </pre>
            </div>
          )}

          {/* TAB 3: Compiled SQL */}
          {activeTab === "sql" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-medium">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Read-Only Output generated by Semantic Compiler (LLM cannot execute ad-hoc SQL)
                </span>
                <button
                  onClick={() => copyToClipboard(compiledSql || "")}
                  className="p-1.5 rounded bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground text-xs flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? "Copied" : "Copy SQL"}</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-lg bg-slate-950 text-emerald-400 border border-border font-mono text-xs overflow-x-auto leading-relaxed">
                {compiledSql || "-- No SQL statement generated"}
              </pre>
            </div>
          )}

          {/* TAB 4: Data Provenance */}
          {activeTab === "provenance" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Source Table</span>
                <p className="font-mono font-bold text-foreground">{provenance?.sourceTable || "sales_orders"}</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Dataset</span>
                <p className="font-semibold text-foreground">{provenance?.datasetName || "Enterprise Sales"}</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Warehouse Provider</span>
                <p className="font-semibold text-foreground">{provenance?.warehouseProvider || "Mock Relational Warehouse"}</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Query Execution Latency</span>
                <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{provenance?.executionTimeMs || 18} ms</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1 col-span-1 sm:col-span-2">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase">Audit Query ID</span>
                <p className="font-mono text-xs text-muted-foreground break-all">{provenance?.queryId || `qry-${Date.now()}`}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
