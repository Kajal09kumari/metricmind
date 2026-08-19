"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  TrendingDown,
  Globe,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
  BarChart3,
  Search,
  CheckCircle2,
} from "lucide-react";
import { KPICard } from "@/components/kpi/kpi-card";
import { KPISpec } from "@/types";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPISpec[]>([
    {
      metricName: "revenue",
      label: "Global Net Revenue (2024)",
      currentValue: 148920000,
      previousValue: 139500000,
      changeValue: 9420000,
      changePercentage: 6.75,
      format: "currency",
      direction: "up",
      isPositiveChange: true,
    },
    {
      metricName: "gross_margin",
      label: "Global Gross Margin",
      currentValue: 0.412,
      previousValue: 0.428,
      changeValue: -0.016,
      changePercentage: -3.74,
      format: "percentage",
      direction: "down",
      isPositiveChange: false,
    },
    {
      metricName: "orders",
      label: "Total Orders Fulfilled",
      currentValue: 3240,
      previousValue: 3010,
      changeValue: 230,
      changePercentage: 7.64,
      format: "integer",
      direction: "up",
      isPositiveChange: true,
    },
    {
      metricName: "shipping_cost",
      label: "Global Shipping & Freight",
      currentValue: 17240000,
      previousValue: 15450000,
      changeValue: 1790000,
      changePercentage: 11.58,
      format: "currency",
      direction: "up",
      isPositiveChange: false,
    },
  ]);

  const starterQueries = [
    {
      title: "European Margin Drop Analysis",
      prompt: "Why did our European margins drop last quarter?",
      badge: "Primary Demo Case",
      description: "Autonomous root cause breakdown detecting shipping cost surge (+9.4%) and Germany logistics disruption.",
    },
    {
      title: "Revenue by Region",
      prompt: "Show revenue and gross margin by region this year",
      badge: "Regional",
      description: "Aggregates 2024 sales volume and margins across Europe, North America, APAC, and LATAM.",
    },
    {
      title: "Category Margin Ranking",
      prompt: "Which product category has the highest margin?",
      badge: "Product Profitability",
      description: "Ranks Cloud Hardware, Enterprise Servers, SaaS, and Workstations by profitability ratio.",
    },
    {
      title: "Shipping Cost Growth",
      prompt: "What caused the increase in shipping costs?",
      badge: "Cost Drivers",
      description: "Compares logistics surcharges across quarters and countries.",
    },
  ];

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
      {/* Hero Banner */}
      <div className="p-6 sm:p-8 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-600/10 via-card to-indigo-600/10 backdrop-blur-md shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/15 border border-blue-500/30 text-xs font-semibold text-blue-600 dark:text-blue-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Agentic Semantic BI Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Ask your enterprise data anything.
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Get governed, explainable executive answers with interactive charts and deterministic
            data lineage. The LLM never writes arbitrary SQL or hallucinates numbers.
          </p>
        </div>

        <Link
          href="/chat"
          className="px-5 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all shadow-md shadow-primary/25 shrink-0"
        >
          <span>Open Conversational Studio</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-blue-500" />
            <span>Enterprise Key Performance Indicators (Live Semantic Layer)</span>
          </h2>
          <span className="text-[11px] font-mono text-muted-foreground">Source: sales_orders (3.2K Rows)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <KPICard key={idx} kpi={kpi} />
          ))}
        </div>
      </div>

      {/* Suggested Analyses */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Recommended Executive Analyses</h3>
            <p className="text-xs text-muted-foreground">
              Select any pre-configured question or type your own query in the studio.
            </p>
          </div>
          <Link
            href="/chat"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {starterQueries.map((item, idx) => (
            <Link
              key={idx}
              href={`/chat?prompt=${encodeURIComponent(item.prompt)}`}
              className="p-5 rounded-xl border border-border/80 bg-card hover:border-primary/50 hover:shadow-md transition-all group flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {item.badge}
                </span>
              </div>

              <p className="text-xs font-mono font-medium text-foreground/80">
                "{item.prompt}"
              </p>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* Architecture & Governance Principles Grid */}
      <div className="p-6 rounded-2xl border border-border/80 bg-muted/20 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <h3 className="text-sm font-bold text-foreground">How MetricMind Eliminates Hallucinations</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <span className="font-bold text-foreground">1. Semantic Registry Guard</span>
            <p className="text-muted-foreground leading-relaxed">
              Business formulas (e.g. <code className="text-primary font-mono text-[11px]">(revenue - cost) / revenue</code>) are
              defined centrally in code, not invented by the LLM.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <span className="font-bold text-foreground">2. Zero Raw Warehouse Access</span>
            <p className="text-muted-foreground leading-relaxed">
              The agent outputs typed <code className="text-primary font-mono text-[11px]">SemanticQuery</code> JSON. A deterministic
              compiler converts it into parameterized SQL.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card space-y-2">
            <span className="font-bold text-foreground">3. 100% Traceable Provenance</span>
            <p className="text-muted-foreground leading-relaxed">
              Every chart and number references the exact query execution ID, row count, execution latency, and source table.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
