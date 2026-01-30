"use client";

import { useState, useCallback } from "react";
import { useLocale } from "next-intl";
import { Check, X, RefreshCw, Lightbulb, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getLocaleField } from "./locales";

// ============================================================================
// FillInTheBlank Component
// ============================================================================

interface BlankConfig {
  id: string;
  correctAnswers: string[]; // Multiple acceptable answers (used as examples for AI)
  hint?: string;
  caseSensitive?: boolean;
  context?: string; // Additional context for AI validation
}

interface FillInTheBlankProps {
  title?: string;
  description?: string;
  template: string; // Use {{id}} for blanks
  blanks: BlankConfig[];
  explanation?: string;
  useAI?: boolean; // Enable AI-backed semantic validation
  openEnded?: boolean; // Allow any answers, check consistency instead of correctness
}

interface AIValidationResult {
  blankId: string;
  isCorrect: boolean;
  feedback?: string;
}

interface ConsistencyResult {
  isConsistent: boolean;
  overallScore: number;
  issues: Array<{ blankId: string; issue: string }>;
  suggestions: string[];
  praise?: string;
}

export function FillInTheBlank({ 
  title,
  description,
  template,
  blanks,
  explanation,
  useAI = false,
  openEnded = false
}: FillInTheBlankProps) {
  const locale = useLocale();
  const t = getLocaleField(locale, "exercises").fillInTheBlank;
  const displayTitle = title || t.defaultTitle;
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [aiResults, setAiResults] = useState<Record<string, AIValidationResult>>({});
  const [consistencyResult, setConsistencyResult] = useState<ConsistencyResult | null>(null);
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const checkAnswerLocal = useCallback((blankId: string, value: string): boolean => {
    const blank = blanks.find(b => b.id === blankId);
    if (!blank) return false;
    
    const normalizedValue = blank.caseSensitive ? value.trim() : value.trim().toLowerCase();
    return blank.correctAnswers.some(answer => {
      const normalizedAnswer = blank.caseSensitive ? answer.trim() : answer.trim().toLowerCase();
      return normalizedValue === normalizedAnswer;
    });
  }, [blanks]);

  const checkAnswer = useCallback((blankId: string, value: string): boolean => {
    // If AI validation was used, check AI results
    if (useAI && aiResults[blankId]) {
      return aiResults[blankId].isCorrect;
    }
    // Fallback to local validation
    return checkAnswerLocal(blankId, value);
  }, [useAI, aiResults, checkAnswerLocal]);

  const validateWithAI = async () => {
    setIsValidating(true);
    setError(null);
    
    try {
      const res = await fetch("/api/book/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: openEnded ? "check_consistency" : "validate_blanks",
          blanks: blanks.map(b => ({
            id: b.id,
            expectedAnswers: b.correctAnswers,
            userAnswer: answers[b.id] || "",
            context: b.context || b.hint,
          })),
          template,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 429) {
          setError(`${t.rateLimitReached}${openEnded ? "" : " " + t.usingLocalValidation}`);
          if (!openEnded) setSubmitted(true);
          return;
        }
        throw new Error(data.error);
      }

      if (openEnded) {
        // Store consistency check results
        setConsistencyResult(data.result as ConsistencyResult);
      } else {
        // Store AI validation results
        const results: Record<string, AIValidationResult> = {};
        for (const result of data.result.validations as AIValidationResult[]) {
          results[result.blankId] = result;
        }
        setAiResults(results);
      }
      setSubmitted(true);
    } catch {
      setError(openEnded ? t.aiCheckFailed : t.aiValidationFailed);
      if (!openEnded) setSubmitted(true);
    } finally {
      setIsValidating(false);
    }
  };

  const handleSubmit = async () => {
    if (useAI) {
      await validateWithAI();
    } else {
      setSubmitted(true);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setSubmitted(false);
    setAiResults({});
    setConsistencyResult(null);
    setShowHints({});
    setError(null);
  };

  // For openEnded mode, we don't check individual answers
  const allCorrect = openEnded 
    ? (consistencyResult?.isConsistent ?? false)
    : (submitted && blanks.every(blank => checkAnswer(blank.id, answers[blank.id] || "")));
  const score = openEnded
    ? (consistencyResult?.overallScore ?? 0)
    : (submitted ? blanks.filter(blank => checkAnswer(blank.id, answers[blank.id] || "")).length : 0);

  // Parse template and render with inputs
  const renderTemplate = () => {
    const parts = template.split(/(\{\{[^}]+\}\})/g);
    
    return parts.map((part, index) => {
      const match = part.match(/\{\{([^}]+)\}\}/);
      if (match) {
        const blankId = match[1];
        const blank = blanks.find(b => b.id === blankId);
        const hasIssue = openEnded && consistencyResult?.issues.some(i => i.blankId === blankId);
        const isCorrect = openEnded ? (submitted && !hasIssue) : (submitted && checkAnswer(blankId, answers[blankId] || ""));
        const isWrong = openEnded ? (submitted && hasIssue) : (submitted && !isCorrect);
        
        return (
          <span key={index} className="inline-flex items-center gap-1 mx-1">
            <input
              type="text"
              value={answers[blankId] || ""}
              onChange={(e) => setAnswers(prev => ({ ...prev, [blankId]: e.target.value }))}
              disabled={submitted}
              placeholder="..."
              className={cn(
                "px-2 py-1 border-b-2 bg-transparent text-center min-w-[80px] max-w-[200px] focus:outline-none transition-colors",
                !submitted && "border-primary/50 focus:border-primary",
                isCorrect && "border-green-500 bg-green-50 dark:bg-green-950/30",
                isWrong && "border-amber-500 bg-amber-50 dark:bg-amber-950/30"
              )}
              style={{ width: `${Math.max(80, (answers[blankId]?.length || 3) * 10)}px` }}
            />
            {submitted && isCorrect && !openEnded && <Check className="h-4 w-4 text-green-500" />}
            {submitted && isWrong && !openEnded && <X className="h-4 w-4 text-red-500" />}
            {!submitted && blank?.hint && (
              <button
                onClick={() => setShowHints(prev => ({ ...prev, [blankId]: !prev[blankId] }))}
                className="text-muted-foreground hover:text-primary"
                title={t.showHint}
              >
                <Lightbulb className="h-4 w-4" />
              </button>
            )}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b">
        <span className="font-semibold">{displayTitle}</span>
        {description && <span className="text-muted-foreground text-sm ml-2">{description}</span>}
      </div>
      
      <div className="p-4 space-y-4">
        <div className="text-sm leading-relaxed font-mono bg-muted/30 p-4 rounded-lg whitespace-pre-wrap">
          {renderTemplate()}
        </div>

        {/* Hints */}
        {Object.entries(showHints).filter(([, show]) => show).map(([blankId]) => {
          const blank = blanks.find(b => b.id === blankId);
          return blank?.hint ? (
            <div key={blankId} className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/30 p-2 rounded flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              <span><strong>{t.hintForBlank}</strong> {blank.hint}</span>
            </div>
          ) : null;
        })}

        {/* Results - Standard mode */}
        {submitted && !openEnded && (
          <div className={cn(
            "p-3 rounded-lg text-sm",
            allCorrect 
              ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
              : "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
          )}>
            <p className="font-medium m-0!">
              {allCorrect ? t.perfect : t.xOfYCorrect.replace("{score}", String(score)).replace("{total}", String(blanks.length))}
            </p>
            {!allCorrect && (
              <div className="mt-2 space-y-1">
                {blanks.filter(blank => !checkAnswer(blank.id, answers[blank.id] || "")).map(blank => (
                  <p key={blank.id} className="m-0! text-muted-foreground">
                    <span className="text-red-600 dark:text-red-400">✗</span> {t.correctAnswer} <code className="bg-muted px-1 rounded">{blank.correctAnswers[0]}</code>
                  </p>
                ))}
              </div>
            )}
            {explanation && <p className="mt-2 m-0!">{explanation}</p>}
          </div>
        )}

        {/* Results - Open-ended mode */}
        {submitted && openEnded && consistencyResult && (
          <div className={cn(
            "p-3 rounded-lg text-sm",
            consistencyResult.isConsistent
              ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
              : "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
          )}>
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "text-2xl font-bold",
                consistencyResult.overallScore >= 8 ? "text-green-600" :
                consistencyResult.overallScore >= 5 ? "text-amber-600" : "text-red-600"
              )}>
                {consistencyResult.overallScore}/10
              </div>
              <p className="font-medium m-0!">
                {consistencyResult.isConsistent ? t.wellStructuredPrompt : t.consistencyIssuesFound}
              </p>
            </div>
            
            {consistencyResult.praise && (
              <p className="m-0! text-green-700 dark:text-green-400 mb-2">{consistencyResult.praise}</p>
            )}
            
            {consistencyResult.issues.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="font-medium m-0! text-amber-700 dark:text-amber-400">{t.issues}</p>
                {consistencyResult.issues.map((issue, i) => (
                  <p key={i} className="m-0! text-muted-foreground">
                    <span className="text-amber-600">⚠</span> {issue.issue}
                  </p>
                ))}
              </div>
            )}
            
            {consistencyResult.suggestions.length > 0 && (
              <div className="mt-2 space-y-1">
                <p className="font-medium m-0!">{t.suggestions}</p>
                {consistencyResult.suggestions.map((suggestion, i) => (
                  <p key={i} className="m-0! text-muted-foreground">• {suggestion}</p>
                ))}
              </div>
            )}
            
            {explanation && <p className="mt-2 m-0!">{explanation}</p>}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded text-sm text-amber-700 dark:text-amber-300">
            {error}
          </div>
        )}

        {/* AI Feedback */}
        {useAI && submitted && Object.values(aiResults).some(r => r.feedback) && (
          <div className="space-y-1">
            {Object.values(aiResults).filter(r => r.feedback).map(result => (
              <div key={result.blankId} className="text-xs text-muted-foreground">
                {result.feedback}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!submitted ? (
            <Button onClick={handleSubmit} size="sm" disabled={isValidating}>
              {isValidating ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              {isValidating ? t.checking : t.checkAnswers}
            </Button>
          ) : (
            <Button onClick={handleReset} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-1" />
              {t.tryAgain}
            </Button>
          )}
          {useAI && !submitted && (
            <span className="text-xs text-muted-foreground self-center">{t.aiPoweredValidation}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// InteractiveChecklist Component
// ============================================================================

interface ChecklistItem {
  id: string;
  label: string;
  description?: string;
}

interface InteractiveChecklistProps {
  title?: string;
  items: ChecklistItem[];
  onComplete?: () => void;
}

export function InteractiveChecklist({ 
  title,
  items,
  onComplete
}: InteractiveChecklistProps) {
  const locale = useLocale();
  const t = getLocaleField(locale, "exercises").checklist;
  const displayTitle = title || t.defaultTitle;
  const [checked, setChecked] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setChecked(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
        if (next.size === items.length && onComplete) {
          onComplete();
        }
      }
      return next;
    });
  };

  const progress = (checked.size / items.length) * 100;
  const allComplete = checked.size === items.length;

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
        <span className="font-semibold">{displayTitle}</span>
        <span className="text-sm text-muted-foreground">
          {checked.size}/{items.length} {t.complete}
        </span>
      </div>
      
      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div 
          className={cn(
            "h-full transition-all duration-300",
            allComplete ? "bg-green-500" : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
      
      <div className="p-4 space-y-2">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={cn(
              "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
              checked.has(item.id) 
                ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                : "bg-muted/30 hover:bg-muted/50 border border-transparent"
            )}
          >
            <div className={cn(
              "shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors",
              checked.has(item.id) 
                ? "bg-green-500 border-green-500 text-white"
                : "border-muted-foreground/50"
            )}>
              {checked.has(item.id) && <Check className="h-3 w-3" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "font-medium m-0! text-sm",
                checked.has(item.id) && "line-through text-muted-foreground"
              )}>
                {item.label}
              </p>
              {item.description && (
                <p className="text-xs text-muted-foreground m-0! mt-0.5">
                  {item.description}
                </p>
              )}
            </div>
          </button>
        ))}
        
        {allComplete && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
            <p className="font-medium text-green-700 dark:text-green-300 m-0!">
              {t.allDone}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// PromptDebugger Component
// ============================================================================

interface DebugOption {
  id: string;
  label: string;
  isCorrect: boolean;
  explanation: string;
}

interface PromptDebuggerProps {
  title?: string;
  badPrompt: string;
  badOutput: string;
  options: DebugOption[];
  hint?: string;
}

export function PromptDebugger({
  title,
  badPrompt,
  badOutput,
  options,
  hint
}: PromptDebuggerProps) {
  const locale = useLocale();
  const t = getLocaleField(locale, "exercises").debugger;
  const displayTitle = title || t.defaultTitle;
  const [selected, setSelected] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  const selectedOption = options.find(o => o.id === selected);

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b flex items-center justify-between">
        <span className="font-semibold">{displayTitle}</span>
        {hint && !selected && (
          <button
            onClick={() => setShowHint(!showHint)}
            className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
          >
            <Lightbulb className="h-4 w-4" />
            {showHint ? t.hideHint : t.showHint}
          </button>
        )}
      </div>
      
      <div className="p-4 space-y-4">
        {/* Bad prompt */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1 m-0!">{t.thePrompt}</p>
          <pre className="p-3 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap">{badPrompt}</pre>
        </div>

        {/* Bad output */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1 m-0!">{t.theOutputProblematic}</p>
          <pre className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm whitespace-pre-wrap">{badOutput}</pre>
        </div>

        {/* Hint */}
        {showHint && hint && (
          <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded text-sm flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
            {hint}
          </div>
        )}

        {/* Question */}
        <div>
          <p className="font-medium m-0! mb-2">{t.whatsWrong}</p>
          <div className="space-y-2">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelected(option.id)}
                disabled={!!selected}
                className={cn(
                  "w-full p-3 text-left rounded-lg border transition-colors text-sm",
                  selected === option.id
                    ? option.isCorrect
                      ? "bg-green-100 border-green-500 dark:bg-green-950 dark:border-green-700"
                      : "bg-red-100 border-red-500 dark:bg-red-950 dark:border-red-700"
                    : selected && option.isCorrect
                    ? "bg-green-100 border-green-500 dark:bg-green-950 dark:border-green-700"
                    : "hover:bg-muted border-border"
                )}
              >
                <div className="flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 shrink-0" />
                  {option.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Explanation */}
        {selected && selectedOption && (
          <div className={cn(
            "p-3 rounded-lg text-sm",
            selectedOption.isCorrect
              ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
              : "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800"
          )}>
            <p className="font-medium m-0!">
              {selectedOption.isCorrect ? t.correct : t.notQuite}
            </p>
            <p className="m-0! mt-1">{selectedOption.explanation}</p>
          </div>
        )}

        {/* Reset */}
        {selected && (
          <Button onClick={() => setSelected(null)} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-1" />
            {t.tryAgain}
          </Button>
        )}
      </div>
    </div>
  );
}
