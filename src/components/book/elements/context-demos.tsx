"use client";

import { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { RunPromptButton } from "@/components/prompts/run-prompt-button";
import { getLocaleField, type ConversationMessage, type ContextBlock, type SummarizationStrategy } from "./locales";

// Strategy apply functions - logic is the same across locales, only summaries differ
const strategyApplyFunctions: Record<number, (summary?: string) => { kept: number[]; summarized: number[]; summary?: string }> = {
  0: (summary) => ({ kept: [8, 9, 10, 11], summarized: [0, 1, 2, 3, 4, 5, 6, 7], summary }),
  1: (summary) => ({ kept: [10, 11], summarized: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], summary }),
  2: (summary) => ({ kept: [2, 5, 7, 9, 11], summarized: [0, 1, 3, 4, 6, 8, 10], summary }),
  3: () => ({ kept: [6, 7, 8, 9, 10, 11], summarized: [0, 1, 2, 3, 4, 5] }),
};

const strategyColors: Record<string, { bg: string; border: string; text: string; pill: string }> = {
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-700", text: "text-blue-700 dark:text-blue-300", pill: "bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300" },
  purple: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-700", text: "text-purple-700 dark:text-purple-300", pill: "bg-purple-100 dark:bg-purple-900/50 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300" },
  green: { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-700", text: "text-green-700 dark:text-green-300", pill: "bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-700", text: "text-amber-700 dark:text-amber-300", pill: "bg-amber-100 dark:bg-amber-900/50 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300" },
};

export function SummarizationDemo() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const t = useTranslations("book.interactive");
  const locale = useLocale();
  
  const sampleConversation = getLocaleField(locale, "sampleConversation");
  const strategies = getLocaleField(locale, "strategies");
  const strategy = strategies[selectedIndex];
  const colors = strategyColors[strategy.color];
  const applyFn = strategyApplyFunctions[selectedIndex];
  const result = applyFn(strategy.summary);
  
  const originalTokens = sampleConversation.reduce((sum: number, m: ConversationMessage) => sum + m.tokens, 0);
  const keptTokens = result.kept.reduce((sum: number, i: number) => sum + sampleConversation[i].tokens, 0);
  const summaryTokens = result.summary ? 20 : 0;
  const savedTokens = originalTokens - keptTokens - summaryTokens;
  const savedPercent = Math.round((savedTokens / originalTokens) * 100);

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b">
        <h4 className="font-semibold mt-2!">{t("summarizationStrategies")}</h4>
      </div>
      
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {strategies.map((s, index) => {
            const c = strategyColors[s.color];
            return (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full border transition-all",
                  selectedIndex === index ? c.pill : "bg-muted/30 border-transparent hover:bg-muted/50"
                )}
              >
                {s.name}
              </button>
            );
          })}
        </div>

        <p className={cn("text-sm mb-4", colors.text)}>{strategy.description}</p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground mb-2 mt-0!">{t("originalConversation")}</p>
            {sampleConversation.map((msg: ConversationMessage, index: number) => {
              const isKept = result.kept.includes(index);
              const isSummarized = result.summarized.includes(index);
              return (
                <div
                  key={index}
                  className={cn(
                    "px-2 py-1 rounded text-xs transition-all",
                    isKept && cn(colors.bg, colors.border, "border"),
                    isSummarized && "bg-muted/30 opacity-50 line-through",
                    !isKept && !isSummarized && "bg-muted/20"
                  )}
                >
                  <span className="font-medium">{msg.role === "user" ? "U:" : "A:"}</span>{" "}
                  <span className="text-muted-foreground">{msg.content}</span>
                  <span className="text-muted-foreground/50 ml-1">({msg.tokens}t)</span>
                </div>
              );
            })}
          </div>

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground m-0!">{t("after")} {strategy.name}</p>
            
            {result.summary && (
              <div className={cn("p-3 rounded-lg border", colors.bg, colors.border)}>
                <p className="text-xs font-medium m-0! mb-1">
                  <span className={colors.text}>{t("summary")} ({summaryTokens}t)</span>
                </p>
                <p className="text-xs text-muted-foreground m-0!">{result.summary}</p>
              </div>
            )}

            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground m-0!">{t("keptMessages")} ({keptTokens}t)</p>
              {result.kept.map((index: number) => {
                const msg = sampleConversation[index];
                return (
                  <div key={index} className={cn("px-2 py-1 rounded text-xs", colors.bg, colors.border, "border")}>
                    <span className="font-medium">{msg.role === "user" ? "U:" : "A:"}</span>{" "}
                    <span className="text-muted-foreground">{msg.content}</span>
                  </div>
                );
              })}
            </div>

            <div className={cn("p-3 rounded-lg", colors.bg)}>
              <p className="text-sm font-medium m-0!">
                <span className={colors.text}>{t("saved")} {savedPercent}%</span>
                <span className="text-muted-foreground text-xs ml-2">
                  ({originalTokens}t → {keptTokens + summaryTokens}t)
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Context Playground

const contextColors: Record<string, { bg: string; border: string; text: string }> = {
  system: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-700", text: "text-purple-700 dark:text-purple-300" },
  history: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-700", text: "text-blue-700 dark:text-blue-300" },
  rag: { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-700", text: "text-green-700 dark:text-green-300" },
  tools: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-700", text: "text-amber-700 dark:text-amber-300" },
  query: { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-700", text: "text-rose-700 dark:text-rose-300" },
};

export function ContextPlayground() {
  const t = useTranslations("book.interactive");
  const locale = useLocale();
  const defaultBlocks = getLocaleField(locale, "contextBlocks");
  const [blocks, setBlocks] = useState<ContextBlock[]>(defaultBlocks);
  const maxTokens = 200;

  const toggleBlock = (id: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b));
  };

  const totalTokens = blocks.filter(b => b.enabled).reduce((sum, b) => sum + b.tokens, 0);
  const usagePercent = Math.min((totalTokens / maxTokens) * 100, 100);
  const isOverLimit = totalTokens > maxTokens;

  const buildPrompt = () => {
    const parts: string[] = [];
    blocks.filter(b => b.enabled).forEach(block => {
      parts.push(`--- ${block.label.toUpperCase()} ---\n${block.content}`);
    });
    return parts.join("\n\n");
  };

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
        <h4 className="font-semibold mt-2!">{t("contextPlayground")}</h4>
        <div className="flex items-center gap-2 text-sm">
          <span className={cn(isOverLimit ? "text-red-600" : "text-muted-foreground")}>
            {totalTokens} / {maxTokens} {t("tokens")}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4 mt-0!">
          {t("toggleContextBlocks")}
        </p>
        
        <div className="mb-4">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-300",
                isOverLimit ? "bg-red-500" : usagePercent > 80 ? "bg-amber-500" : "bg-green-500"
              )}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          {isOverLimit && (
            <p className="text-xs text-red-600 mt-1 mb-0!">{t("overContextLimit")}</p>
          )}
        </div>

        <div className="grid gap-2 mb-4">
          {blocks.map(block => {
            const colors = contextColors[block.type];
            return (
              <button
                key={block.id}
                onClick={() => toggleBlock(block.id)}
                className={cn(
                  "p-3 rounded-lg border text-left transition-all",
                  block.enabled ? colors.bg : "bg-muted/30 opacity-50",
                  block.enabled ? colors.border : "border-muted"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn("font-medium text-sm", block.enabled ? colors.text : "text-muted-foreground")}>
                    {block.enabled ? "✓" : "○"} {block.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{block.tokens} tokens</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 font-mono m-0!">{block.content}</p>
              </button>
            );
          })}
        </div>

        <div className="relative">
          <pre className="p-3 pr-12 bg-muted/30 rounded-lg text-xs whitespace-pre-wrap font-mono max-h-48 overflow-y-auto">
            {buildPrompt() || t("enableContextBlocksToBuild")}
          </pre>
          {blocks.some(b => b.enabled) && (
            <div className="absolute top-2 right-2">
              <RunPromptButton
                content={buildPrompt()}
                title={t("testContext")}
                variant="ghost"
                size="icon"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
