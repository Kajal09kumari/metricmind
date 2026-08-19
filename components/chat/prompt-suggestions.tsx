"use client";

import { Sparkles, TrendingDown, Globe, Layers, ArrowUpRight } from "lucide-react";

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
}

export function PromptSuggestions({ onSelectPrompt }: PromptSuggestionsProps) {
  const suggestions = [
    {
      title: "European Margin Drop Analysis",
      prompt: "Why did our European margins drop last quarter?",
      icon: TrendingDown,
      badge: "Primary Demo",
      description: "Auto-trigger multi-step root cause breakdown into shipping & material costs",
    },
    {
      title: "Regional Sales Performance",
      prompt: "Show revenue and gross margin by region this year",
      icon: Globe,
      badge: "Regional",
      description: "Compare total revenue and margin across Europe, NA, APAC, and LATAM",
    },
    {
      title: "Product Profitability",
      prompt: "Which product category has the highest gross margin?",
      icon: Layers,
      badge: "Category",
      description: "Compare margin and cost ratio across all enterprise product lines",
    },
    {
      title: "Shipping Cost Growth",
      prompt: "What caused the increase in shipping costs across countries?",
      icon: ArrowUpRight,
      badge: "Cost Drivers",
      description: "Analyze logistics and freight surcharges by country",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
        <Sparkles className="w-3.5 h-3.5 text-blue-500" />
        <span>Executive Analysis Starters</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onSelectPrompt(item.prompt)}
              className="p-4 rounded-xl border border-border/80 bg-card hover:bg-muted/40 hover:border-primary/40 text-left transition-all group flex flex-col justify-between space-y-2 shadow-sm hover:shadow"
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {item.badge}
                </span>
              </div>

              <p className="text-xs font-medium text-foreground/80 font-mono">
                "{item.prompt}"
              </p>

              <p className="text-[11px] text-muted-foreground">
                {item.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
