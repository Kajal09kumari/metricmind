"use client";

import { useState, useRef, useEffect } from "react";
import { AgentState, AgentStep } from "@/types";
import { AgentTimeline } from "./agent-timeline";
import { ExecutiveSummary } from "./executive-summary";
import { DynamicChart } from "@/components/charts/dynamic-chart";
import { DataTable } from "@/components/tables/data-table";
import { TransparencyPanel } from "./transparency-panel";
import { PromptSuggestions } from "./prompt-suggestions";
import {
  Send,
  Sparkles,
  Bot,
  User,
  BarChart2,
  Table as TableIcon,
  RotateCcw,
  ShieldCheck,
  Layers,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: "user" | "agent";
  content?: string;
  state?: AgentState;
  timestamp: string;
}

export function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeSteps, setActiveSteps] = useState<AgentStep[]>([]);
  const [viewModes, setViewModes] = useState<Record<string, "chart" | "table">>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeSteps, isLoading]);

  const handleSend = async (queryText?: string) => {
    const question = (queryText || inputQuery).trim();
    if (!question || isLoading) return;

    setInputQuery("");
    setIsLoading(true);

    const userMessageId = `user-${Date.now()}`;
    const agentMessageId = `agent-${Date.now()}`;

    // Add user message
    const userMsg: ChatMessage = {
      id: userMessageId,
      sender: "user",
      content: question,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);

    // Initialize simulated agent steps for immediate responsive UI feedback
    setActiveSteps([
      {
        id: "step-1",
        stepName: "intent_extraction",
        label: "Analyzing question & business intent",
        status: "running",
      },
    ]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to analyze query");
      }

      const agentState: AgentState = data.state;
      setActiveSteps(agentState.steps || []);

      const agentMsg: ChatMessage = {
        id: agentMessageId,
        sender: "agent",
        state: agentState,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, agentMsg]);
      setViewModes((prev) => ({ ...prev, [agentMessageId]: "chart" }));
    } catch (err: any) {
      const agentMsg: ChatMessage = {
        id: agentMessageId,
        sender: "agent",
        content: `Error: ${err.message || "Failed to process query through Semantic Engine."}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, agentMsg]);
    } finally {
      setIsLoading(false);
      setActiveSteps([]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setActiveSteps([]);
  };

  return (
    <div className="flex flex-col h-full bg-background relative overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-3xl mx-auto py-8 space-y-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-lg shadow-blue-500/25">
                <Sparkles className="w-7 h-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                MetricMind Conversational BI Studio
              </h1>
              <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
                Ask executive questions in plain English. Queries are governed by official semantic
                definitions and compiled directly against the warehouse.
              </p>
            </div>

            {/* Prompt Starter Cards */}
            <PromptSuggestions onSelectPrompt={(p) => handleSend(p)} />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.map((msg) => {
              if (msg.sender === "user") {
                return (
                  <div key={msg.id} className="flex items-start justify-end gap-3">
                    <div className="max-w-xl p-4 rounded-2xl rounded-tr-sm bg-primary text-primary-foreground text-sm font-medium shadow-sm leading-relaxed">
                      {msg.content}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                      <User className="w-4 h-4" />
                    </div>
                  </div>
                );
              }

              // Agent Response Card
              const state = msg.state;
              const viewMode = viewModes[msg.id] || "chart";

              if (msg.content && !state) {
                return (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center shrink-0">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div className="max-w-2xl p-4 rounded-2xl border border-rose-500/30 bg-rose-500/5 text-xs text-rose-600 dark:text-rose-400 font-medium">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              if (!state) return null;

              return (
                <div key={msg.id} className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>

                  <div className="flex-1 space-y-4 min-w-0">
                    {/* Stepper Timeline */}
                    {state.steps && state.steps.length > 0 && (
                      <AgentTimeline steps={state.steps} />
                    )}

                    {/* Executive Summary & KPIs */}
                    {state.analysis && <ExecutiveSummary analysis={state.analysis} />}

                    {/* Visualizations & Data Tables */}
                    {state.primaryResult && (
                      <div className="space-y-4">
                        {/* View Switcher Controls */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Governed Data View
                          </span>

                          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border">
                            <button
                              onClick={() =>
                                setViewModes((prev) => ({ ...prev, [msg.id]: "chart" }))
                              }
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all",
                                viewMode === "chart"
                                  ? "bg-card text-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <BarChart2 className="w-3.5 h-3.5" />
                              <span>Chart</span>
                            </button>
                            <button
                              onClick={() =>
                                setViewModes((prev) => ({ ...prev, [msg.id]: "table" }))
                              }
                              className={cn(
                                "flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold transition-all",
                                viewMode === "table"
                                  ? "bg-card text-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground"
                              )}
                            >
                              <TableIcon className="w-3.5 h-3.5" />
                              <span>Data Table</span>
                            </button>
                          </div>
                        </div>

                        {/* Chart View */}
                        {viewMode === "chart" && (
                          <div className="space-y-4">
                            {state.visualization && (
                              <DynamicChart spec={state.visualization} />
                            )}
                            {state.secondaryVisualizations?.map((secVis, sIdx) => (
                              <DynamicChart key={sIdx} spec={secVis} />
                            ))}
                          </div>
                        )}

                        {/* Table View */}
                        {viewMode === "table" && (
                          <DataTable
                            columns={state.primaryResult.columns}
                            rows={state.primaryResult.rows}
                            tableName={state.intent?.primaryMetric || "dataset"}
                          />
                        )}
                      </div>
                    )}

                    {/* Transparency & Governance Inspector */}
                    <TransparencyPanel
                      metricDefinitions={state.metricDefinitions}
                      semanticQuery={state.semanticQuery}
                      compiledSql={state.primaryResult?.compiledSql}
                      provenance={state.primaryResult?.provenance}
                    />
                  </div>
                </div>
              );
            })}

            {/* Live Loading Stepper */}
            {isLoading && (
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-md shrink-0 mt-1 animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 max-w-2xl">
                  <AgentTimeline
                    steps={
                      activeSteps.length > 0
                        ? activeSteps
                        : [
                            {
                              id: "s1",
                              stepName: "orchestration",
                              label: "Agent analyzing question...",
                              status: "running",
                            },
                          ]
                    }
                    isStreaming={true}
                  />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Composer Footer */}
      <div className="p-4 sm:p-6 border-t border-border/60 bg-background/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about enterprise metrics... (e.g. Why did our European margins drop last quarter?)"
            rows={2}
            className="w-full resize-none rounded-xl border border-border/80 bg-card px-4 py-3 pr-24 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary shadow-sm"
          />

          <div className="absolute right-3 bottom-5 flex items-center gap-1.5">
            {messages.length > 0 && (
              <button
                onClick={resetChat}
                title="Reset Conversation"
                className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isLoading}
              className="px-3.5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs flex items-center gap-1.5 hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Ask BI</span>
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-2 flex items-center justify-between text-[11px] text-muted-foreground px-1">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>LLM strictly constrained to Semantic Layer API. No direct SQL generation.</span>
          </div>
          <span>Shift + Enter for new line</span>
        </div>
      </div>
    </div>
  );
}
