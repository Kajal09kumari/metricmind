"use client";

import { useState, useEffect } from "react";
import {
  Sun,
  Moon,
  Search,
  ShieldCheck,
  Zap,
  Activity,
} from "lucide-react";

export function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }
  };

  return (
    <header className="h-16 border-b border-border/60 bg-background/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted/60 border border-border/60 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-muted-foreground">Semantic Engine:</span>
          <span className="font-semibold text-foreground">Governed</span>
        </div>

        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-muted/60 border border-border/60 text-xs font-medium">
          <Activity className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
          <span className="text-muted-foreground">Deterministic Truth:</span>
          <span className="text-blue-600 dark:text-blue-400 font-semibold">100% Traceable</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Model Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400 font-medium">
          <Zap className="w-3.5 h-3.5" />
          <span>Agent Orchestration Mode</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          className="p-2 rounded-lg border border-border/60 bg-card hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>
    </header>
  );
}
