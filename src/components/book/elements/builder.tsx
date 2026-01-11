"use client";

import { useState, useCallback } from "react";
import { Play, Copy, Check, Loader2, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

interface BuilderField {
  id: keyof NonNullable<PromptBuilderProps["defaultValues"]>;
  label: string;
  placeholder: string;
  hint: string;
  required?: boolean;
}

const BUILDER_FIELDS: BuilderField[] = [
  {
    id: "role",
    label: "Role / Persona",
    placeholder: "You are a senior software engineer...",
    hint: "Who should the AI act as? What expertise should it have?",
  },
  {
    id: "context",
    label: "Context / Background",
    placeholder: "I'm building a React app that...",
    hint: "What does the AI need to know about your situation?",
  },
  {
    id: "task",
    label: "Task / Instruction",
    placeholder: "Review this code and identify bugs...",
    hint: "What specific action should the AI take?",
    required: true,
  },
  {
    id: "constraints",
    label: "Constraints / Rules",
    placeholder: "Keep response under 200 words. Focus only on...",
    hint: "What limitations or rules should the AI follow?",
  },
  {
    id: "format",
    label: "Output Format",
    placeholder: "Return as a numbered list with...",
    hint: "How should the response be structured?",
  },
  {
    id: "examples",
    label: "Examples",
    placeholder: "Example input: X → Output: Y",
    hint: "Show examples of what you want (few-shot learning)",
  },
];

export function PromptBuilder({
  title = "Prompt Builder",
  description = "Build your prompt step by step",
  defaultValues = {},
  showAllFields = false,
}: PromptBuilderProps) {
  const [values, setValues] = useState<Record<string, string>>(defaultValues as Record<string, string>);
  const [expandedFields, setExpandedFields] = useState<Set<string>>(
    new Set(showAllFields ? BUILDER_FIELDS.map(f => f.id) : ["task"])
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
      setError("Please add at least a task to your prompt");
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
          setError(`Rate limit reached. Try again in ${data.resetIn}s${data.signInForMore ? " or sign in for more." : "."}`);
        } else {
          setError(data.error || "Failed to run prompt");
        }
        return;
      }

      setResponse(data.result);
      setRateLimit({ remaining: data.remaining, dailyRemaining: data.dailyRemaining });
    } catch {
      setError("Failed to connect to API");
    } finally {
      setIsRunning(false);
    }
  };

  const prompt = buildPrompt();
  const hasContent = prompt.trim().length > 0;

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b">
        <span className="font-semibold">{title}</span>
        <span className="text-muted-foreground text-sm ml-2">{description}</span>
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
                    filled
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
              <span className="text-sm font-medium">Generated Prompt</span>
              <span className="text-xs text-muted-foreground">{prompt.length} chars</span>
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
            {copied ? "Copied!" : "Copy"}
          </Button>
          <Button onClick={handleRun} size="sm" disabled={!hasContent || isRunning}>
            {isRunning ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            Run with AI
          </Button>
          {rateLimit?.remaining !== undefined && (
            <span className="text-xs text-muted-foreground ml-auto">
              {rateLimit.remaining} {rateLimit.dailyRemaining !== undefined ? `(${rateLimit.dailyRemaining}/day)` : ""} remaining
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
              <span className="text-sm font-medium text-green-700 dark:text-green-400">AI Response</span>
              <Button onClick={() => setResponse(null)} variant="ghost" size="sm" className="h-6 text-xs">
                <RefreshCw className="h-3 w-3 mr-1" />
                Clear
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
  title = "Prompt Analyzer",
  description = "Get AI feedback on your prompt",
  defaultPrompt = "",
}: PromptAnalyzerProps) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rateLimit, setRateLimit] = useState<{ remaining?: number } | null>(null);

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to analyze");
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
          setError(`Rate limit reached. Try again in ${data.resetIn}s.`);
        } else {
          setError(data.error || "Failed to analyze prompt");
        }
        return;
      }

      setAnalysis(data.result as AnalysisResult);
      setRateLimit({ remaining: data.remaining });
    } catch {
      setError("Failed to connect to API");
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
        <span className="font-semibold">{title}</span>
        <span className="text-muted-foreground text-sm ml-2">{description}</span>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Your Prompt</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Paste or write your prompt here..."
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
            Analyze
          </Button>
          {rateLimit?.remaining !== undefined && (
            <span className="text-xs text-muted-foreground">
              {rateLimit.remaining} remaining
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
                  <span className="text-xs font-medium w-20">Clarity</span>
                  <span className="text-xs text-muted-foreground flex-1">{analysis.clarity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium w-20">Specificity</span>
                  <span className="text-xs text-muted-foreground flex-1">{analysis.specificity}</span>
                </div>
              </div>
            </div>

            {/* Missing Elements */}
            {analysis.missingElements.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 m-0!">Missing Elements</p>
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
                <p className="text-sm font-medium mb-2 m-0!">Suggestions</p>
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
                <p className="text-sm font-medium mb-2 m-0!">Improved Version</p>
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
