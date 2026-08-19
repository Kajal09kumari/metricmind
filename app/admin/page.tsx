"use client";

import { useEffect, useState } from "react";
import { QueryAudit } from "@/types";
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  Database,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Code2,
  Search,
  ExternalLink,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminPage() {
  const [audits, setAudits] = useState<QueryAudit[]>([]);
  const [stats, setStats] = useState({
    totalQueries: 0,
    successRate: 100,
    avgLatencyMs: 0,
    blockedCount: 0,
  });
  const [selectedAudit, setSelectedAudit] = useState<QueryAudit | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    fetchAudits();
  }, []);

  const fetchAudits = async () => {
    try {
      const res = await fetch("/api/audit");
      const data = await res.json();
      if (data.audits) setAudits(data.audits);
      if (data.stats) setStats(data.stats);
    } catch (err) {
      console.error("Failed to load audit logs", err);
    }
  };

  const filteredAudits = audits.filter((a) => {
    const matchesSearch =
      a.userQuestion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.metrics.some((m) => m.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || a.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Governance & Query Audit Log
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Audit Trail Active
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Complete server-side compliance log of every natural-language question, compiled SQL,
            execution latency, and policy validation check.
          </p>
        </div>

        <button
          onClick={fetchAudits}
          className="px-3.5 py-2 rounded-lg bg-card hover:bg-muted border border-border text-xs font-semibold text-foreground transition-colors self-start"
        >
          Refresh Logs
        </button>
      </div>

      {/* Governance Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Total Executed Queries</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.totalQueries}</p>
          <p className="text-[11px] text-muted-foreground">Recorded in session</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Governance Success Rate</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.successRate}%
          </p>
          <p className="text-[11px] text-muted-foreground">Zero hallucinated SQL</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Average Latency</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.avgLatencyMs} ms</p>
          <p className="text-[11px] text-muted-foreground">Semantic compilation + SQL execution</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold uppercase">
            <span>Blocked / Policy Violations</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
            {stats.blockedCount}
          </p>
          <p className="text-[11px] text-muted-foreground">Unapproved metric / dimension requests</p>
        </div>
      </div>

      {/* Governance Limits Configuration Box */}
      <div className="p-5 rounded-xl border border-border/80 bg-muted/20 space-y-3 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-foreground text-sm">
              Active Server-Side Governance Limits
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted border">
            Enforced in lib/governance/engine.ts
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1">
          <div className="p-2.5 rounded-lg bg-card border border-border space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Max Agent Steps
            </span>
            <p className="font-mono font-bold text-foreground">8 steps</p>
          </div>
          <div className="p-2.5 rounded-lg bg-card border border-border space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Max Queries / Question
            </span>
            <p className="font-mono font-bold text-foreground">5 queries</p>
          </div>
          <div className="p-2.5 rounded-lg bg-card border border-border space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Max Rows Returned
            </span>
            <p className="font-mono font-bold text-foreground">5,000 rows</p>
          </div>
          <div className="p-2.5 rounded-lg bg-card border border-border space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Max Query Latency
            </span>
            <p className="font-mono font-bold text-foreground">10,000 ms</p>
          </div>
          <div className="p-2.5 rounded-lg bg-card border border-border space-y-0.5">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              Max Breakdown Dims
            </span>
            <p className="font-mono font-bold text-foreground">3 dimensions</p>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by question, metric, or query ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-card border border-border focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-lg border border-border text-xs self-end sm:self-auto">
            {["all", "success", "blocked", "failed"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={cn(
                  "px-2.5 py-1 rounded font-semibold capitalize transition-all",
                  statusFilter === st
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 font-semibold text-muted-foreground">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">User Question</th>
                  <th className="py-3 px-4">Metrics Used</th>
                  <th className="py-3 px-4">Queries</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">Rows</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredAudits.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-muted-foreground">
                      No audit records found.
                    </td>
                  </tr>
                ) : (
                  filteredAudits.map((audit) => (
                    <tr
                      key={audit.id}
                      onClick={() => setSelectedAudit(audit)}
                      className="hover:bg-muted/30 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(audit.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground max-w-xs truncate">
                        {audit.userQuestion}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {audit.metrics.map((m) => (
                            <span
                              key={m}
                              className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {audit.queryCount}
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {audit.executionTimeMs} ms
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {audit.rowsReturned}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                            audit.status === "success" &&
                              "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                            audit.status === "blocked" &&
                              "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
                            audit.status === "failed" &&
                              "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                          )}
                        >
                          {audit.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <ChevronRight className="w-4 h-4 text-muted-foreground inline" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Detail Modal */}
      {selectedAudit && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-foreground text-base">
                  Audit Record: {selectedAudit.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAudit(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
                  User Question
                </span>
                <p className="p-2.5 rounded-lg bg-muted/40 border border-border text-foreground font-medium">
                  {selectedAudit.userQuestion}
                </p>
              </div>

              {selectedAudit.errorMessage && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-500 block mb-0.5">
                    Governance Block Reason
                  </span>
                  <p className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-medium">
                    {selectedAudit.errorMessage}
                  </p>
                </div>
              )}

              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
                  Structured Semantic Query
                </span>
                <pre className="p-3 rounded-lg bg-muted/30 border border-border font-mono text-[11px] overflow-x-auto">
                  {JSON.stringify(selectedAudit.semanticQuery, null, 2)}
                </pre>
              </div>

              {selectedAudit.generatedSql && (
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">
                    Compiled SQL Statement
                  </span>
                  <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 border border-border font-mono text-[11px] overflow-x-auto">
                    {selectedAudit.generatedSql}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAudit(null)}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
