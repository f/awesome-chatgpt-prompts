"use client";

import { useState, useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";

import { getLocaleField, type EmbeddingWord, type Capability } from "./locales";

function cosineSimilarity(a: number[], b: number[]): number {
  const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

const embeddingColors: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  amber: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-300 dark:border-amber-700", text: "text-amber-700 dark:text-amber-300", bar: "bg-amber-500" },
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-300 dark:border-blue-700", text: "text-blue-700 dark:text-blue-300", bar: "bg-blue-500" },
  red: { bg: "bg-red-50 dark:bg-red-950/30", border: "border-red-300 dark:border-red-700", text: "text-red-700 dark:text-red-300", bar: "bg-red-500" },
};

export function EmbeddingsDemo() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const t = useTranslations("book.interactive");
  const locale = useLocale();
  
  const embeddingWords = getLocaleField(locale, "embeddingWords");
  const selected = embeddingWords[selectedIndex];
  const selectedColors = embeddingColors[selected.color];

  const similarities = embeddingWords.map((w: EmbeddingWord, i: number) => ({
    ...w,
    similarity: i === selectedIndex ? 1 : cosineSimilarity(selected.vector, w.vector),
    index: i,
  })).sort((a: { similarity: number }, b: { similarity: number }) => b.similarity - a.similarity);

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b">
        <h4 className="font-semibold mt-2!">{t("embeddingsVisualization")}</h4>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4 mt-0!">
          {t("clickWordToSeeVector")}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {embeddingWords.map((w: EmbeddingWord, index: number) => {
            const c = embeddingColors[w.color];
            return (
              <button
                key={index}
                onClick={() => setSelectedIndex(index)}
                className={cn(
                  "px-3 py-1.5 text-sm rounded-full border transition-all",
                  selectedIndex === index 
                    ? cn(c.bg, c.border, c.text, "border-2") 
                    : "bg-muted/30 border-transparent hover:bg-muted/50"
                )}
              >
                {w.word}
              </button>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className={cn("p-4 rounded-lg border", selectedColors.bg, selectedColors.border)}>
            <p className={cn("font-semibold mb-2 mt-0!", selectedColors.text)}>"{selected.word}" {t("vector")}</p>
            <div className="space-y-2">
              {selected.vector.map((val: number, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-8">d{i + 1}:</span>
                  <div className="flex-1 h-4 bg-muted/30 rounded overflow-hidden">
                    <div 
                      className={cn("h-full rounded transition-all", selectedColors.bar)}
                      style={{ width: `${val * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono w-10">{val.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground mb-2 m-0!">{t("similarityTo")} "{selected.word}"</p>
            {similarities.map((w: EmbeddingWord & { similarity: number; index: number }) => {
              const c = embeddingColors[w.color];
              const percent = Math.round(w.similarity * 100);
              const isSame = w.index === selectedIndex;
              return (
                <div key={w.index} className="flex items-center gap-2">
                  <span className={cn("text-sm w-20", c.text)}>{w.word}</span>
                  <div className="flex-1 h-5 bg-muted/30 rounded overflow-hidden">
                    <div 
                      className={cn("h-full rounded transition-all", c.bar, isSame && "opacity-50")}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className={cn(
                    "text-xs font-mono w-12",
                    percent >= 95 ? "text-green-600 dark:text-green-400" : 
                    percent >= 80 ? "text-amber-600 dark:text-amber-400" : 
                    "text-muted-foreground"
                  )}>
                    {percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-muted-foreground mt-4 m-0!">
          {t("embeddingsExplanation")}
        </p>
      </div>
    </div>
  );
}

// LLM Capabilities Demo
export function LLMCapabilitiesDemo() {
  const t = useTranslations("book.interactive");
  const locale = useLocale();
  
  const capabilities = getLocaleField(locale, "capabilities");
  const canDo = capabilities.filter(c => c.canDo);
  const cannotDo = capabilities.filter(c => !c.canDo);

  return (
    <div className="my-6 grid md:grid-cols-2 gap-4">
      <div className="border rounded-lg overflow-hidden">
        <div className="px-3 py-2 bg-green-50 dark:bg-green-950/30 border-b border-green-200 dark:border-green-800 flex items-center gap-2">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="font-semibold text-sm text-green-700 dark:text-green-300">{t("canDoWell")}</span>
        </div>
        <div className="p-2 space-y-1">
          {canDo.map((cap) => (
            <div key={cap.title} className="px-2 py-1.5 rounded bg-green-50/50 dark:bg-green-950/20">
              <p className="font-medium text-sm text-green-800 dark:text-green-200 m-0!">{cap.title}</p>
              <p className="text-xs text-muted-foreground m-0!">{cap.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="px-3 py-2 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800 flex items-center gap-2">
          <X className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="font-semibold text-sm text-red-700 dark:text-red-300">{t("cannotDo")}</span>
        </div>
        <div className="p-2 space-y-1">
          {cannotDo.map((cap) => (
            <div key={cap.title} className="px-2 py-1.5 rounded bg-red-50/50 dark:bg-red-950/20">
              <p className="font-medium text-sm text-red-800 dark:text-red-200 m-0!">{cap.title}</p>
              <p className="text-xs text-muted-foreground m-0!">{cap.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
