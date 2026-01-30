"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Play, RotateCcw, CheckCircle2, XCircle, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { getLocaleField, type ChainScenario, type ChainStep } from "./locales";

const scenarioIcons: Record<string, typeof CheckCircle2> = {
  success: CheckCircle2,
  retry: RefreshCw,
  fallback: AlertTriangle,
};

type StepStatus = "pending" | "running" | "success" | "failed" | "retrying" | "fallback";

interface Step {
  id: string;
  name: string;
  status: StepStatus;
  output?: string;
  error?: string;
  attempt?: number;
}


export function ChainErrorDemo() {
  const [selectedScenario, setSelectedScenario] = useState<string>("success");
  const [isRunning, setIsRunning] = useState(false);
  const t = useTranslations("book.interactive");
  const locale = useLocale();
  
  const scenarios = getLocaleField(locale, "scenarios");
  const initialSteps = getLocaleField(locale, "steps") as Step[];
  const [steps, setSteps] = useState<Step[]>(initialSteps);

  const resetSteps = () => {
    setSteps(getLocaleField(locale, "steps") as Step[]);
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const updateStep = (id: string, updates: Partial<Step>) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const runScenario = async () => {
    setIsRunning(true);
    resetSteps();
    await delay(300);

    if (selectedScenario === "success") {
      // Happy path - all steps succeed
      updateStep("extract", { status: "running" });
      await delay(800);
      updateStep("extract", { status: "success", output: '{"name": "John", "email": "john@example.com"}' });

      updateStep("validate", { status: "running" });
      await delay(600);
      updateStep("validate", { status: "success", output: "VALID - All fields present" });

      updateStep("transform", { status: "running" });
      await delay(700);
      updateStep("transform", { status: "success", output: "Formatted for database" });

      updateStep("output", { status: "running" });
      await delay(500);
      updateStep("output", { status: "success", output: "✓ Record saved successfully" });

    } else if (selectedScenario === "retry") {
      // Retry scenario - extraction fails once, then succeeds
      updateStep("extract", { status: "running", attempt: 1 });
      await delay(800);
      updateStep("extract", { status: "failed", error: "Malformed JSON response", attempt: 1 });
      await delay(600);
      
      updateStep("extract", { status: "retrying", attempt: 2 });
      await delay(1000);
      updateStep("extract", { status: "success", output: '{"name": "John", "email": "john@example.com"}', attempt: 2 });

      updateStep("validate", { status: "running" });
      await delay(600);
      updateStep("validate", { status: "success", output: "VALID - All fields present" });

      updateStep("transform", { status: "running" });
      await delay(700);
      updateStep("transform", { status: "success", output: "Formatted for database" });

      updateStep("output", { status: "running" });
      await delay(500);
      updateStep("output", { status: "success", output: "✓ Record saved successfully" });

    } else if (selectedScenario === "fallback") {
      // Fallback scenario - complex extraction fails, fallback to simple
      updateStep("extract", { status: "running" });
      await delay(800);
      updateStep("extract", { status: "failed", error: "Complex extraction failed" });
      await delay(500);
      
      updateStep("extract", { status: "fallback", output: "Using simple regex extraction..." });
      await delay(800);
      updateStep("extract", { status: "success", output: '{"name": "John"} (partial data)' });

      updateStep("validate", { status: "running" });
      await delay(600);
      updateStep("validate", { status: "success", output: "VALID - Minimum fields present" });

      updateStep("transform", { status: "running" });
      await delay(700);
      updateStep("transform", { status: "success", output: "Formatted with defaults" });

      updateStep("output", { status: "running" });
      await delay(500);
      updateStep("output", { status: "success", output: "✓ Record saved (partial)" });
    }

    setIsRunning(false);
  };

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case "pending": return <div className="w-4 h-4 rounded-full border-2 border-muted-foreground/30" />;
      case "running": return <div className="w-4 h-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />;
      case "success": return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
      case "retrying": return <RefreshCw className="w-4 h-4 text-amber-500 animate-spin" />;
      case "fallback": return <AlertTriangle className="w-4 h-4 text-purple-500" />;
    }
  };

  const getStatusBg = (status: StepStatus) => {
    switch (status) {
      case "pending": return "bg-muted/50";
      case "running": return "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800";
      case "success": return "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800";
      case "failed": return "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800";
      case "retrying": return "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800";
      case "fallback": return "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800";
    }
  };

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
        <span className="font-medium text-sm">{t("chainErrorHandlingDemo")}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={resetSteps}
            disabled={isRunning}
            className="p-1.5 rounded hover:bg-muted disabled:opacity-50"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={runScenario}
            disabled={isRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded text-sm font-medium disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {t("run")}
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Scenario Selector */}
        <div className="flex gap-2 mb-4">
          {scenarios.map(scenario => {
            const Icon = scenarioIcons[scenario.id];
            return (
              <button
                key={scenario.id}
                onClick={() => { setSelectedScenario(scenario.id); resetSteps(); }}
                disabled={isRunning}
                className={cn(
                  "flex-1 p-3 rounded-lg border text-left transition-colors",
                  selectedScenario === scenario.id
                    ? `bg-${scenario.color}-50 dark:bg-${scenario.color}-950/30 border-${scenario.color}-300 dark:border-${scenario.color}-700`
                    : "bg-muted/30 hover:bg-muted/50 disabled:opacity-50"
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={cn("w-4 h-4", selectedScenario === scenario.id ? `text-${scenario.color}-600 dark:text-${scenario.color}-400` : "text-muted-foreground")} />
                  <span className="text-sm font-medium">{scenario.name}</span>
                </div>
                <p className="text-xs text-muted-foreground">{scenario.description}</p>
              </button>
            );
          })}
        </div>

        {/* Chain Visualization */}
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center border",
                  getStatusBg(step.status)
                )}>
                  {getStatusIcon(step.status)}
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-0.5 h-8 mt-1",
                    step.status === "success" ? "bg-green-300 dark:bg-green-700" : "bg-muted-foreground/20"
                  )} />
                )}
              </div>
              <div className={cn(
                "flex-1 p-3 rounded-lg border transition-all",
                getStatusBg(step.status)
              )}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{step.name}</span>
                  {step.attempt && step.attempt > 1 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200">
                      {t("attempt")} {step.attempt}
                    </span>
                  )}
                </div>
                {step.error && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-mono">{step.error}</p>
                )}
                {step.output && (
                  <p className="text-xs text-muted-foreground font-mono">{step.output}</p>
                )}
                {step.status === "retrying" && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">{t("retryingWithFeedback")}</p>
                )}
                {step.status === "fallback" && (
                  <p className="text-xs text-purple-600 dark:text-purple-400">{t("switchingToFallback")}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 pt-4 border-t flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
            <span>{t("success")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <XCircle className="w-3.5 h-3.5 text-red-500" />
            <span>{t("failed")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
            <span>{t("retry")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-purple-500" />
            <span>{t("fallback")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
