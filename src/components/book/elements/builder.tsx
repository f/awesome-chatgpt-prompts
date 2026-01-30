"use client";

import { useState, useCallback } from "react";
import { Play, Copy, Check, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { getLocaleField, type BuilderField } from "./locales";

// ============================================================================
// PromptBuilder Component - Step-by-step prompt construction
// ============================================================================

interface PromptBuilderProps {
  title?: string;
  description?: string;
  defaultValues?: {
    role?: string;
    context?: string;
    task?: string;
    constraints?: string;
    format?: string;
    examples?: string;
  };
  showAllFields?: boolean;
}


export function PromptBuilder({
  title,
  description,
  defaultValues = {},
  showAllFields = false,
}: PromptBuilderProps) {
  const t = useTranslations("book.interactive");
  const locale = useLocale();
  const BUILDER_FIELDS = getLocaleField(locale, "builderFields");
  
  const [values, setValues] = useState<Record<string, string>>(defaultValues as Record<string, string>);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(
    new Set(showAllFields ? BUILDER_FIELDS.map((f: BuilderField) => f.id) : ["task"])
  );
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [response, setResponse] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<{ remaining?: number; dailyRemaining?: number } | null>(null);

  const toggleField = (id: string) => {
    setExpandedFields(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const buildPrompt = useCallback(() => {
    const parts: string[] = [];
    
    if (values.role) {
      parts.push(`# Role\n${values.role}`);
    }
    if (values.context) {
      parts.push(`# Context\n${values.context}`);
    }
    if (values.task) {
      parts.push(`# Task\n${values.task}`);
    }
    if (values.constraints) {
      parts.push(`# Constraints\n${values.constraints}`);
    }
    if (values.format) {
      parts.push(`# Output Format\n${values.format}`);
    }
    if (values.examples) {
      parts.push(`# Examples\n${values.examples}`);
    }
    
    return parts.join("\n\n");
  }, [values]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(buildPrompt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRun = async () => {
    const prompt = buildPrompt();
    if (!prompt.trim()) {
      setError(t("pleaseAddTask"));
      return;
    }

    setIsRunning(true);
    setError(null);
    setResponse(null);

    try {
      const res = await fetch("/api/book/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "run_prompt",
          prompt,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 429) {
          setError(`${t("rateLimitReached")} ${data.resetIn}s${data.signInForMore ? ` ${t("orSignInForMore")}` : "."}`);
        } else {
          setError(data.error || t("failedToRunPrompt"));
        }
        return;
      }

      setResponse(data.result);
      setRateLimit({ remaining: data.remaining, dailyRemaining: data.dailyRemaining });
    } catch {
      setError(t("failedToConnectApi"));
    } finally {
      setIsRunning(false);
    }
  };

  const prompt = buildPrompt();
  const hasContent = prompt.trim().length > 0;

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b">
        <span className="font-semibold">{title || t("promptBuilder")}</span>
        <span className="text-muted-foreground text-sm ml-2">{description || t("buildYourPromptStepByStep")}</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Builder Fields */}
        {BUILDER_FIELDS.map((field) => (
          <div key={field.id} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleField(field.id)}
              className={cn(
                "w-full flex items-center justify-between p-3 text-left transition-colors",
                expandedFields.has(field.id) ? "bg-muted/50" : "hover:bg-muted/30",
                values[field.id] && "border-l-4 border-l-primary"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{field.label}</span>
                {field.required && <span className="text-red-500 text-xs">*</span>}
                {values[field.id] && (
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {t("filled")}
                  </span>
                )}
              </div>
              {expandedFields.has(field.id) ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            
            {expandedFields.has(field.id) && (
              <div className="p-3 pt-0 space-y-2">
                <p className="text-xs text-muted-foreground">{field.hint}</p>
                <textarea
                  value={values[field.id] || ""}
                  onChange={(e) => setValues(prev => ({ ...prev, [field.id]: e.target.value }))}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            )}
          </div>
        ))}

        {/* Preview */}
        {hasContent && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t("generatedPrompt")}</span>
              <span className="text-xs text-muted-foreground">{prompt.length} {t("chars")}</span>
            </div>
            <pre className="p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap max-h-48 overflow-y-auto">
              {prompt}
            </pre>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button onClick={handleCopy} variant="outline" size="sm" disabled={!hasContent}>
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            {copied ? t("copied") : t("copy")}
          </Button>
          <Button onClick={handleRun} size="sm" disabled={!hasContent || isRunning}>
            {isRunning ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            {t("runWithAI")}
          </Button>
          {rateLimit?.remaining !== undefined && (
            <span className="text-xs text-muted-foreground ml-auto">
              {rateLimit.remaining} {rateLimit.dailyRemaining !== undefined ? `(${rateLimit.dailyRemaining}/${t("day")})` : ""} {t("remaining")}
            </span>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Response */}
        {response && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-700 dark:text-green-400">{t("aiResponse")}</span>
              <Button onClick={() => setResponse(null)} variant="ghost" size="sm" className="h-6 text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                {t("clear")}
              </Button>
            </div>
            <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm whitespace-pre-wrap">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PromptAnalyzer Component - AI analyzes prompt quality
// ============================================================================

interface AnalysisResult {
  score: number;
  clarity: string;
  specificity: string;
  missingElements: string[];
  suggestions: string[];
  improved: string;
}

interface PromptAnalyzerProps {
  title?: string;
  description?: string;
  defaultPrompt?: string;
}

export function PromptAnalyzer({
  title,
  description,
  defaultPrompt = "",
}: PromptAnalyzerProps) {
  const t = useTranslations("book.interactive");
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<{ remaining?: number } | null>(null);

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      setError(t("pleaseEnterPromptToAnalyze"));
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch("/api/book/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "analyze_prompt",
          prompt,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 429) {
          setError(`${t("rateLimitReached")} ${data.resetIn}s.`);
        } else {
          setError(data.error || t("failedToAnalyzePrompt"));
        }
        return;
      }

      setAnalysis(data.result as AnalysisResult);
      setRateLimit({ remaining: data.remaining });
    } catch {
      setError(t("failedToConnectApi"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scoreColor = analysis?.score 
    ? analysis.score >= 8 ? "text-green-600" 
    : analysis.score >= 5 ? "text-amber-600" 
    : "text-red-600"
    : "";

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b">
        <span className="font-semibold">{title || t("promptAnalyzer")}</span>
        <span className="text-muted-foreground text-sm ml-2">{description || t("getAiFeedbackOnPrompt")}</span>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">{t("yourPrompt")}</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("pasteOrWritePromptHere")}
            rows={5}
            className="w-full px-3 py-2 text-sm border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleAnalyze} size="sm" disabled={!prompt.trim() || isAnalyzing}>
            {isAnalyzing ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            {t("analyze")}
          </Button>
          {rateLimit?.remaining !== undefined && (
            <span className="text-xs text-muted-foreground">
              {rateLimit.remaining} {t("remaining")}
            </span>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {analysis && (
          <div className="space-y-4">
            {/* Score */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className={cn("text-4xl font-bold", scoreColor)}>{analysis.score}</div>
                <div className="text-xs text-muted-foreground">/ 10</div>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium w-20">{t("clarity")}</span>
                  <span className="text-xs text-muted-foreground flex-1">{analysis.clarity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium w-20">{t("specificity")}</span>
                  <span className="text-xs text-muted-foreground flex-1">{analysis.specificity}</span>
                </div>
              </div>
            </div>

            {/* Missing Elements */}
            {analysis.missingElements.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 m-0!">{t("missingElements")}</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingElements.map((el, i) => (
                    <span key={i} className="px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs rounded">
                      {el}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {analysis.suggestions.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 m-0!">{t("suggestions")}</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {analysis.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improved Version */}
            {analysis.improved && (
              <div>
                <p className="text-sm font-medium mb-2 m-0!">{t("improvedVersion")}</p>
                <pre className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm whitespace-pre-wrap font-mono">
                  {analysis.improved}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
