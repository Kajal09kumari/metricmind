"use client";

import { AgentStep } from "@/types";
import {
  CheckCircle2,
  CircleDashed,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  Database,
  ShieldCheck,
  BarChart2,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AgentTimelineProps {
  steps: AgentStep[];
  isStreaming?: boolean;
}

export function AgentTimeline({ steps, isStreaming }: AgentTimelineProps) {
  if (steps.length === 0) return null;

  const getStepIcon = (step: AgentStep) => {
    switch (step.status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
      case "running":
        return <CircleDashed className="w-4 h-4 text-blue-500 animate-spin shrink-0" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground/50 shrink-0" />;
    }
  };

  return (
    <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 backdrop-blur-sm space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            Agent Reasoning & Governance Execution
          </span>
        </div>
        {isStreaming && (
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-blue-500 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Active Workflow
          </span>
        )}
      </div>

      <div className="space-y-2 pt-1">
        {steps.map((step, idx) => {
          const isCurrent = step.status === "running";
          const isDone = step.status === "completed";
          const isFail = step.status === "failed";

          return (
            <div
              key={step.id || idx}
              className={cn(
                "flex items-start gap-2.5 text-xs transition-all",
                isCurrent && "font-semibold text-foreground",
                isDone && "text-foreground/90",
                isFail && "text-rose-500",
                step.status === "pending" && "text-muted-foreground/60"
              )}
            >
              <div className="pt-0.5">{getStepIcon(step)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="leading-tight">{step.label}</span>
                  {step.timestamp && (
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {new Date(step.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  )}
                </div>
                {step.detail && (
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5 break-all">
                    {step.detail}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
