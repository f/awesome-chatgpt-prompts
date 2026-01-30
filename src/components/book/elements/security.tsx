"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { RunPromptButton } from "@/components/prompts/run-prompt-button";
import { getLocaleField, type JailbreakExample } from "./locales";

export function JailbreakDemo() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const t = useTranslations("book.interactive");
  const locale = useLocale();
  
  const jailbreakExamples = getLocaleField(locale, "jailbreakExamples");
  const selected = jailbreakExamples[selectedIndex];
  
  const fullPrompt = `${t("systemPromptLabel")}:
${selected.systemPrompt}

---

${t("userAttemptsJailbreak")}:
${selected.attack}`;

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800 flex items-center gap-2">
        <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
        <h4 className="font-semibold text-red-700 dark:text-red-300 mt-2!">{t("jailbreakAttackSimulator")}</h4>
      </div>
      
      <div className="p-4">
        <p className="text-sm text-muted-foreground mb-4 mt-0!">
          {t("selectAttackType")}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {jailbreakExamples.map((example: JailbreakExample, index: number) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "px-3 py-1.5 text-sm rounded-full border transition-all",
                selectedIndex === index
                  ? "bg-red-100 dark:bg-red-900/50 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                  : "bg-muted/30 border-transparent hover:bg-muted/50"
              )}
            >
              {example.name}
            </button>
          ))}
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">{t("systemPromptDefense")}</span>
            </div>
            <p className="text-sm font-mono">{selected.systemPrompt}</p>
          </div>
          
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-4 w-4 text-red-600" />
              <span className="text-sm font-semibold text-red-700 dark:text-red-300">{t("attackAttempt")}</span>
            </div>
            <p className="text-sm font-mono">{selected.attack}</p>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mb-3">
          <strong>{t("whatThisAttackDoes")}</strong> {selected.description}
        </p>
        
        <div className="relative">
          <pre className="p-3 pr-12 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap font-mono">{fullPrompt}</pre>
          <div className="absolute top-2 right-2">
            <RunPromptButton
              content={fullPrompt}
              title={t("testJailbreakDefense")}
              variant="ghost"
              size="icon"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
