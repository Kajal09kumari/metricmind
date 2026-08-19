"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bot,
  Layers,
  ShieldCheck,
  Database,
  History,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Executive Overview",
      href: "/",
      icon: BarChart3,
      badge: "Live",
    },
    {
      label: "Conversational BI",
      href: "/chat",
      icon: Bot,
      highlight: true,
    },
    {
      label: "Semantic Catalog",
      href: "/semantic-catalog",
      icon: Layers,
    },
    {
      label: "Governance & Audit",
      href: "/admin",
      icon: ShieldCheck,
    },
  ];

  return (
    <aside className="w-64 border-r border-border/60 bg-card/50 backdrop-blur-md flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="h-16 border-b border-border/60 px-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
                MetricMind
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                BI
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">Agentic Semantic Engine</p>
          </div>
        </Link>
      </div>

      {/* Primary Navigation */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Analytics Studio
        </div>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm shadow-primary/25"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn("w-4 h-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20")}>
                  {item.badge}
                </span>
              )}
              {item.highlight && !isActive && (
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              )}
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
          Governance & Guardrails
        </div>

        <div className="p-3 mx-1 rounded-lg border border-border/80 bg-muted/30 text-xs space-y-2">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Semantic Guard Active</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Direct warehouse SQL disabled. All queries route through validated business formulas.
          </p>
          <div className="pt-1 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
            <span>SQL Injection: Blocked</span>
            <span className="text-emerald-500 font-semibold">100% Governed</span>
          </div>
        </div>
      </div>

      {/* Warehouse Status Footer */}
      <div className="p-3 border-t border-border/60 bg-muted/20">
        <div className="flex items-center gap-2.5 px-2 py-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold truncate text-foreground">Mock Warehouse</p>
            <p className="text-[10px] text-muted-foreground truncate">sales_orders (3.2K rows)</p>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">
            DEV
          </span>
        </div>
      </div>
    </aside>
  );
}
