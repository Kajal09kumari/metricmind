"use client";

import { useState } from "react";
import { METRIC_DEFINITIONS } from "@/data/semantic-model/metrics";
import { DIMENSION_DEFINITIONS } from "@/data/semantic-model/dimensions";
import { MetricCard } from "@/components/semantic/metric-card";
import { DimensionCard } from "@/components/semantic/dimension-card";
import {
  Layers,
  Database,
  Search,
  Filter,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SemanticCatalogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "metrics" | "dimensions">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    "Financial",
    "Operations",
    "Logistics",
    "Manufacturing",
    "Time",
    "Geography",
    "Product",
    "Customer",
  ];

  const filteredMetrics = METRIC_DEFINITIONS.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.synonyms.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || m.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredDimensions = DIMENSION_DEFINITIONS.filter((d) => {
    const matchesSearch =
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.synonyms.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "All" || d.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Semantic Catalog
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Source of Truth
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Governed registry of approved enterprise business metrics, formulas, dimensions, and
            aggregation rules.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 p-2.5 rounded-xl border border-border">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>Formulas are locked & validated by the Governance Engine.</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border/80 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search metrics, synonyms, dimensions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>

        {/* Tab & Category Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Tab switch */}
          <div className="flex items-center bg-muted/60 p-1 rounded-lg border border-border text-xs">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3 py-1 rounded font-semibold transition-all",
                activeTab === "all" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({METRIC_DEFINITIONS.length + DIMENSION_DEFINITIONS.length})
            </button>
            <button
              onClick={() => setActiveTab("metrics")}
              className={cn(
                "px-3 py-1 rounded font-semibold transition-all",
                activeTab === "metrics" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Metrics ({METRIC_DEFINITIONS.length})
            </button>
            <button
              onClick={() => setActiveTab("dimensions")}
              className={cn(
                "px-3 py-1 rounded font-semibold transition-all",
                activeTab === "dimensions" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Dimensions ({DIMENSION_DEFINITIONS.length})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 text-xs rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Section */}
      {(activeTab === "all" || activeTab === "metrics") && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Layers className="w-4 h-4 text-blue-500" />
            <span>Approved Business Metrics ({filteredMetrics.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMetrics.map((metric) => (
              <MetricCard key={metric.name} metric={metric} />
            ))}
          </div>
        </div>
      )}

      {/* Dimensions Section */}
      {(activeTab === "all" || activeTab === "dimensions") && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <Database className="w-4 h-4 text-emerald-500" />
            <span>Governed Dimensions & Attributes ({filteredDimensions.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDimensions.map((dimension) => (
              <DimensionCard key={dimension.name} dimension={dimension} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
