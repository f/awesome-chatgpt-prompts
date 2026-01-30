"use client";

import { useState, useEffect, Fragment } from "react";
import { ChevronDown, ChevronRight, Check, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { getLocaleField, type ChainType } from "./locales";

// Chain Flow Demo Data

const chainColors: Record<string, { bg: string; border: string; text: string; stepBg: string; arrow: string }> = {
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-300", stepBg: "bg-blue-100 dark:bg-blue-900/50", arrow: "text-blue-400" },
  purple: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", text: "text-purple-700 dark:text-purple-300", stepBg: "bg-purple-100 dark:bg-purple-900/50", arrow: "text-purple-400" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", stepBg: "bg-amber-100 dark:bg-amber-900/50", arrow: "text-amber-400" },
  green: { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", text: "text-green-700 dark:text-green-300", stepBg: "bg-green-100 dark:bg-green-900/50", arrow: "text-green-400" },
};

// Chain Step Example Component
interface ChainStep {
  step: string;
  prompt: string;
  output: string;
}

interface ChainExampleProps {
  type: "sequential" | "parallel" | "conditional" | "iterative";
  steps: ChainStep[];
}

export function ChainExample({ type, steps }: ChainExampleProps) {
  const [activeSteps, setActiveSteps] = useState<number[]>([]);
  const [loadingSteps, setLoadingSteps] = useState<number[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentIteration, setCurrentIteration] = useState(0);
  const [iterationOutput, setIterationOutput] = useState<string | null>(null);
  const t = useTranslations("book.interactive");

  const runAnimation = () => {
    setActiveSteps([]);
    setLoadingSteps([]);
    setCurrentIteration(0);
    setIterationOutput(null);
    setIsAnimating(true);
    
    if (type === "sequential") {
      steps.forEach((_, i) => {
        setTimeout(() => {
          setLoadingSteps(prev => [...prev, i]);
        }, i * 1000);
        setTimeout(() => {
          setLoadingSteps(prev => prev.filter(s => s !== i));
          setActiveSteps(prev => [...prev, i]);
          if (i === steps.length - 1) setIsAnimating(false);
        }, (i + 1) * 1000);
      });
    } else if (type === "iterative") {
      const stepDuration = 900;
      const iterationGap = 600;
      
      setCurrentIteration(1);
      steps.forEach((_, i) => {
        setTimeout(() => setLoadingSteps([i]), i * stepDuration);
        setTimeout(() => {
          setLoadingSteps([]);
          setActiveSteps(prev => [...prev, i]);
          if (i === steps.length - 1) {
            setIterationOutput(steps[i].output.slice(0, 60) + "...");
          }
        }, (i + 1) * stepDuration);
      });
      
      const iter1End = steps.length * stepDuration + iterationGap;
      setTimeout(() => {
        setCurrentIteration(2);
        setActiveSteps([]);
      }, iter1End);
      
      steps.forEach((_, i) => {
        setTimeout(() => setLoadingSteps([i]), iter1End + i * stepDuration);
        setTimeout(() => {
          setLoadingSteps([]);
          setActiveSteps(prev => [...prev, i]);
          if (i === steps.length - 1) {
            setIsAnimating(false);
          }
        }, iter1End + (i + 1) * stepDuration);
      });
    } else if (type === "parallel") {
      setLoadingSteps([0]);
      setTimeout(() => {
        setLoadingSteps([]);
        setActiveSteps([0]);
      }, 600);
      setTimeout(() => {
        const parallelIndexes = steps.slice(1, -1).map((_, i) => i + 1);
        setLoadingSteps(parallelIndexes);
      }, 800);
      setTimeout(() => {
        const parallelIndexes = steps.slice(1, -1).map((_, i) => i + 1);
        setLoadingSteps([]);
        setActiveSteps(prev => [...prev, ...parallelIndexes]);
      }, 2000);
      setTimeout(() => {
        setLoadingSteps([steps.length - 1]);
      }, 2200);
      setTimeout(() => {
        setLoadingSteps([]);
        setActiveSteps(prev => [...prev, steps.length - 1]);
        setIsAnimating(false);
      }, 2800);
    } else if (type === "conditional") {
      setLoadingSteps([0]);
      setTimeout(() => {
        setLoadingSteps([]);
        setActiveSteps([0]);
      }, 800);
      setTimeout(() => {
        setActiveSteps(prev => [...prev, 1]);
      }, 1000);
      setTimeout(() => setLoadingSteps([2]), 1200);
      setTimeout(() => {
        setLoadingSteps([]);
        setActiveSteps(prev => [...prev, 2]);
      }, 2000);
      setTimeout(() => setLoadingSteps([3]), 2200);
      setTimeout(() => {
        setLoadingSteps([]);
        setActiveSteps(prev => [...prev, 3]);
        setIsAnimating(false);
      }, 3000);
    }
  };

  const isStepActive = (index: number) => activeSteps.includes(index);
  const isStepLoading = (index: number) => loadingSteps.includes(index);

  return (
    <div className="my-4 rounded-lg border overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
        <span className="text-xs text-muted-foreground capitalize">{t(`${type}Chain`)}</span>
        <button
          onClick={runAnimation}
          disabled={isAnimating}
          className="text-xs px-2 py-1 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isAnimating ? t("running") : t("run")}
        </button>
      </div>
      <div className="p-4 space-y-0">
        {type === "conditional" ? (
          steps.map((step, i) => {
            const isSkipped = step.step.toLowerCase().includes("skipped");
            return (
              <div key={i}>
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border transition-all duration-300",
                      isSkipped && isStepActive(i) ? "bg-muted text-muted-foreground border-dashed" :
                      isStepActive(i) ? "bg-green-500 text-white border-green-500" : 
                      isStepLoading(i) ? "bg-primary/20 border-primary" : "bg-muted text-muted-foreground"
                    )}>
                      {isSkipped && isStepActive(i) ? <X className="h-3 w-3" /> :
                       isStepActive(i) ? <Check className="h-3 w-3" /> : 
                       isStepLoading(i) ? <RefreshCw className="h-3 w-3 animate-spin text-primary" /> : i + 1}
                    </div>
                    {i < steps.length - 1 && (
                      <div className={cn("w-px flex-1 my-1 transition-colors duration-300", 
                        isSkipped && isStepActive(i) ? "bg-border border-dashed" :
                        isStepActive(i) ? "bg-green-300" : 
                        isStepLoading(i) ? "bg-primary/30" : "bg-border")} />
                    )}
                  </div>
                  <div className={cn("flex-1 pb-4 transition-opacity duration-300", 
                    isSkipped && isStepActive(i) ? "opacity-50" :
                    isStepActive(i) || isStepLoading(i) ? "opacity-100" : "opacity-50")}>
                    <p className={cn("text-sm font-medium mb-2 m-0!", isSkipped && isStepActive(i) ? "line-through text-muted-foreground" : "")}>{step.step}</p>
                    {!isSkipped && (
                      <>
                        <div className="text-sm p-3 rounded border bg-muted/50 mb-2">
                          <p className="text-xs text-muted-foreground mb-1 m-0!">{t("prompt")}:</p>
                          <p className="m-0! font-mono text-xs whitespace-pre-wrap">{step.prompt}</p>
                        </div>
                        <div className={cn("text-sm p-3 rounded border transition-colors duration-300", isStepActive(i) ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" : "bg-background")}>
                          <p className="text-xs text-muted-foreground mb-1 m-0!">{t("outputLabel")}:</p>
                          <p className="m-0! font-mono text-xs whitespace-pre-wrap">{step.output}</p>
                        </div>
                      </>
                    )}
                    {isSkipped && isStepActive(i) && (
                      <p className="text-xs text-muted-foreground italic m-0!">{t("skippedConditionNotMet")}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          steps.map((step, i) => (
            <div key={i}>
              <div className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium border transition-all duration-300",
                    isStepActive(i) ? "bg-green-500 text-white border-green-500" : isStepLoading(i) ? "bg-primary/20 border-primary" : "bg-muted text-muted-foreground"
                  )}>
                    {isStepActive(i) ? <Check className="h-3 w-3" /> : isStepLoading(i) ? <RefreshCw className="h-3 w-3 animate-spin text-primary" /> : i + 1}
                  </div>
                  {i < steps.length - 1 && (
                    <div className={cn("w-px flex-1 my-1 transition-colors duration-300", isStepActive(i) ? "bg-green-300" : isStepLoading(i) ? "bg-primary/30" : "bg-border")} />
                  )}
                </div>
                <div className={cn("flex-1 pb-4 transition-opacity duration-300", isStepActive(i) || isStepLoading(i) ? "opacity-100" : "opacity-50")}>
                  <p className="text-sm font-medium mb-2 m-0!">{step.step}</p>
                  <div className="text-sm p-3 rounded border bg-muted/50 mb-2">
                    <p className="text-xs text-muted-foreground mb-1 m-0!">{t("prompt")}:</p>
                    <p className="m-0! font-mono text-xs whitespace-pre-wrap">{step.prompt}</p>
                  </div>
                  <div className={cn("text-sm p-3 rounded border transition-colors duration-300", isStepActive(i) ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800" : "bg-background")}>
                    <p className="text-xs text-muted-foreground mb-1 m-0!">{t("outputLabel")}:</p>
                    <p className="m-0! font-mono text-xs whitespace-pre-wrap">{step.output}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        {type === "iterative" && (
          <div className="mt-3 space-y-2">
            {currentIteration > 0 && (
              <div className="flex items-center justify-center gap-2">
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  currentIteration === 1 ? "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300" : "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                )}>
                  {t("iterationOf", { current: currentIteration, total: 2 })}
                </span>
              </div>
            )}
            {iterationOutput && currentIteration === 2 && (
              <div className="mx-4 p-2 rounded border border-dashed bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700">
                <p className="text-xs text-amber-700 dark:text-amber-300 m-0!">
                  <span className="font-medium">↳ {t("previousOutputAsInput")}:</span> {iterationOutput}
                </p>
              </div>
            )}
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <RefreshCw className={cn("h-3 w-3", isAnimating && "animate-spin")} />
              <span>{t("loopUntilQualityMet")}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function ChainFlowDemo() {
  const locale = useLocale();
  const chainTypes = getLocaleField(locale, "chainTypes");
  const [selected, setSelected] = useState(chainTypes[0]);
  const [activeStep, setActiveStep] = useState(0);
  const colors = chainColors[selected.color];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % selected.steps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [selected]);

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="flex border-b">
        {chainTypes.map((chain) => {
          const c = chainColors[chain.color];
          return (
            <button
              key={chain.id}
              onClick={() => { setSelected(chain); setActiveStep(0); }}
              className={cn(
                "flex-1 px-3 py-2 text-sm font-medium transition-colors",
                selected.id === chain.id
                  ? cn(c.bg, c.text)
                  : "text-muted-foreground hover:bg-muted/50"
              )}
            >
              {chain.name}
            </button>
          );
        })}
      </div>
      
      <div className={cn("p-6", colors.bg)}>
        <p className={cn("text-sm font-medium m-0! mb-4!", colors.text)}>{selected.description}</p>
        
        <div className="flex items-center justify-center gap-2">
          {selected.id === "parallel" ? (
            <div className="flex flex-col items-center gap-2">
              <div className={cn("px-3 py-2 rounded-lg text-xs font-medium", colors.stepBg, colors.text)}>
                Input
              </div>
              <ChevronDown className={cn("h-4 w-4", colors.arrow)} />
              <div className="flex gap-2">
                {selected.steps.map((step, i) => (
                  <div
                    key={i}
                    className={cn(
                      "px-3 py-2 rounded-lg text-center transition-all duration-300",
                      colors.stepBg,
                      activeStep === i ? cn("ring-2", colors.border, "scale-105") : "opacity-70"
                    )}
                  >
                    <p className={cn("text-xs font-medium m-0!", colors.text)}>{step.label}</p>
                    <p className="text-xs text-muted-foreground m-0!">{step.desc}</p>
                  </div>
                ))}
              </div>
              <ChevronDown className={cn("h-4 w-4", colors.arrow)} />
              <div className={cn("px-3 py-2 rounded-lg text-xs font-medium", colors.stepBg, colors.text)}>
                Merge
              </div>
            </div>
          ) : selected.id === "conditional" ? (
            <div className="flex flex-col items-center gap-2">
              <div className={cn(
                "px-4 py-2 rounded-lg transition-all duration-300",
                colors.stepBg,
                activeStep === 0 ? cn("ring-2", colors.border, "scale-105") : "opacity-70"
              )}>
                <p className={cn("text-xs font-medium m-0!", colors.text)}>{selected.steps[0].label}</p>
                <p className="text-xs text-muted-foreground m-0!">{selected.steps[0].desc}</p>
              </div>
              <div className="flex gap-8">
                <div className="flex flex-col items-center">
                  <ChevronDown className={cn("h-4 w-4", colors.arrow)} />
                  <div className={cn(
                    "px-4 py-2 rounded-lg transition-all duration-300",
                    colors.stepBg,
                    activeStep === 1 ? cn("ring-2", colors.border, "scale-105") : "opacity-70"
                  )}>
                    <p className={cn("text-xs font-medium m-0!", colors.text)}>{selected.steps[1].label}</p>
                    <p className="text-xs text-muted-foreground m-0!">{selected.steps[1].desc}</p>
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <ChevronDown className={cn("h-4 w-4", colors.arrow)} />
                  <div className={cn(
                    "px-4 py-2 rounded-lg transition-all duration-300",
                    colors.stepBg,
                    activeStep === 2 ? cn("ring-2", colors.border, "scale-105") : "opacity-70"
                  )}>
                    <p className={cn("text-xs font-medium m-0!", colors.text)}>{selected.steps[2].label}</p>
                    <p className="text-xs text-muted-foreground m-0!">{selected.steps[2].desc}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : selected.id === "iterative" ? (
            <div className="flex items-center gap-2">
              {selected.steps.map((step, i) => (
                <Fragment key={i}>
                  <div className={cn(
                    "px-4 py-2 rounded-lg text-center transition-all duration-300",
                    colors.stepBg,
                    activeStep === i ? cn("ring-2", colors.border, "scale-105") : "opacity-70"
                  )}>
                    <p className={cn("text-xs font-medium m-0!", colors.text)}>{step.label}</p>
                    <p className="text-xs text-muted-foreground m-0!">{step.desc}</p>
                  </div>
                  {i < selected.steps.length - 1 && (
                    <ChevronRight className={cn("h-4 w-4 shrink-0", colors.arrow)} />
                  )}
                </Fragment>
              ))}
              <div className={cn("ml-2 flex items-center gap-1 text-xs", colors.text)}>
                <RefreshCw className="h-3 w-3" />
                <span>Loop</span>
              </div>
            </div>
          ) : (
            selected.steps.map((step, i) => (
              <Fragment key={i}>
                <div className={cn(
                  "px-4 py-2 rounded-lg text-center transition-all duration-300",
                  colors.stepBg,
                  activeStep === i ? cn("ring-2", colors.border, "scale-105") : "opacity-70"
                )}>
                  <p className={cn("text-xs font-medium m-0!", colors.text)}>{step.label}</p>
                  <p className="text-xs text-muted-foreground m-0!">{step.desc}</p>
                </div>
                {i < selected.steps.length - 1 && (
                  <ChevronRight className={cn("h-4 w-4 shrink-0", colors.arrow)} />
                )}
              </Fragment>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
