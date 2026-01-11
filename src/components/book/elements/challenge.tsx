"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Loader2, Trophy, Clock, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ============================================================================
// PromptChallenge Component - Timed exercises with AI scoring
// ============================================================================

interface ChallengeResult {
  score: number;
  criteriaScores: Array<{ criterion: string; met: boolean; feedback: string }>;
  overallFeedback: string;
  suggestions: string[];
}

interface PromptChallengeProps {
  title?: string;
  task: string;
  criteria: string[];
  timeLimit?: number; // seconds, 0 = no limit
  hints?: string[];
  exampleSolution?: string;
  difficulty?: "beginner" | "intermediate" | "advanced";
}

export function PromptChallenge({
  title = "Prompt Challenge",
  task,
  criteria,
  timeLimit = 0,
  hints = [],
  exampleSolution,
  difficulty = "intermediate",
}: PromptChallengeProps) {
  const [prompt, setPrompt] = useState("");
  const [isStarted, setIsStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ChallengeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [showHints, setShowHints] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [rateLimit, setRateLimit] = useState<{ remaining?: number } | null>(null);

  // Timer
  useEffect(() => {
    if (!isStarted || timeLimit === 0 || result) return;
    
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isStarted, timeRemaining, timeLimit, result]);

  const handleStart = () => {
    setIsStarted(true);
    setTimeRemaining(timeLimit);
    setPrompt("");
    setResult(null);
    setError(null);
    setHintsUsed(0);
    setShowSolution(false);
  };

  const handleSubmit = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please write a prompt before submitting");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/book/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "score_challenge",
          prompt,
          task,
          criteria,
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 429) {
          setError(`Rate limit reached. Try again in ${data.resetIn}s.`);
        } else {
          setError(data.error || "Failed to score challenge");
        }
        return;
      }

      // Adjust score based on hints used
      const baseResult = data.result as ChallengeResult;
      const hintPenalty = hintsUsed * 5; // -5 points per hint
      const adjustedScore = Math.max(0, baseResult.score - hintPenalty);
      
      setResult({ ...baseResult, score: adjustedScore });
      setRateLimit({ remaining: data.remaining });
    } catch {
      setError("Failed to connect to API");
    } finally {
      setIsSubmitting(false);
    }
  }, [prompt, task, criteria, hintsUsed]);

  const handleShowHint = () => {
    if (hintsUsed < hints.length) {
      setHintsUsed(prev => prev + 1);
      setShowHints(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const difficultyColors = {
    beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    intermediate: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  const scoreColor = result?.score 
    ? result.score >= 80 ? "text-green-600" 
    : result.score >= 50 ? "text-amber-600" 
    : "text-red-600"
    : "";

  return (
    <div className="my-6 border-2 border-primary/20 rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-primary/5 border-b border-primary/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          <span className="font-semibold">{title}</span>
          <span className={cn("px-2 py-0.5 text-xs rounded-full", difficultyColors[difficulty])}>
            {difficulty}
          </span>
        </div>
        {isStarted && timeLimit > 0 && !result && (
          <div className={cn(
            "flex items-center gap-1 font-mono text-sm",
            timeRemaining <= 30 && "text-red-600 animate-pulse"
          )}>
            <Clock className="h-4 w-4" />
            {formatTime(timeRemaining)}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Task */}
        <div>
          <p className="font-medium mb-2 m-0!">Your Task:</p>
          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            {task}
          </div>
        </div>

        {/* Criteria */}
        <div>
          <p className="font-medium mb-2 m-0!">Your prompt will be scored on:</p>
          <ul className="space-y-1 text-sm">
            {criteria.map((c, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary font-mono">{i + 1}.</span>
                <span className={cn(
                  result?.criteriaScores?.[i]?.met === true && "text-green-600",
                  result?.criteriaScores?.[i]?.met === false && "text-red-600"
                )}>
                  {c}
                  {result?.criteriaScores?.[i] && (
                    <span className="ml-2">
                      {result.criteriaScores[i].met ? "✓" : "✗"}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Not started state */}
        {!isStarted && (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-4 m-0!">
              {timeLimit > 0 
                ? `You'll have ${formatTime(timeLimit)} to complete this challenge.`
                : "Take your time to craft the best prompt."}
            </p>
            <Button onClick={handleStart} size="lg">
              <Play className="h-4 w-4 mr-2" />
              Start Challenge
            </Button>
          </div>
        )}

        {/* Active challenge */}
        {isStarted && !result && (
          <>
            <div>
              <label className="text-sm font-medium mb-1 block">Your Prompt:</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Write your prompt here..."
                rows={6}
                className="w-full px-3 py-2 text-sm border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono"
                autoFocus
              />
            </div>

            {/* Hints */}
            {hints.length > 0 && (
              <div>
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
                >
                  {showHints ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  Hints ({hintsUsed}/{hints.length} used, -5 points each)
                </button>
                {showHints && (
                  <div className="mt-2 space-y-2">
                    {hints.slice(0, hintsUsed).map((hint, i) => (
                      <div key={i} className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded text-sm">
                        <strong>Hint {i + 1}:</strong> {hint}
                      </div>
                    ))}
                    {hintsUsed < hints.length && (
                      <Button onClick={handleShowHint} variant="outline" size="sm">
                        Reveal Next Hint (-5 points)
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button onClick={handleSubmit} disabled={!prompt.trim() || isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Trophy className="h-4 w-4 mr-1" />
                )}
                Submit for Scoring
              </Button>
              {rateLimit?.remaining !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {rateLimit.remaining} AI calls remaining
                </span>
              )}
            </div>
          </>
        )}

        {/* Error */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Score */}
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
              <div className="text-center">
                <div className={cn("text-5xl font-bold", scoreColor)}>{result.score}</div>
                <div className="text-xs text-muted-foreground">/ 100</div>
              </div>
              <div className="flex-1">
                <p className="font-medium m-0!">
                  {result.score >= 80 ? "🎉 Excellent!" : result.score >= 50 ? "👍 Good effort!" : "Keep practicing!"}
                </p>
                <p className="text-sm text-muted-foreground m-0!">{result.overallFeedback}</p>
                {hintsUsed > 0 && (
                  <p className="text-xs text-amber-600 m-0! mt-1">
                    ({hintsUsed} hint{hintsUsed > 1 ? "s" : ""} used, -{hintsUsed * 5} points)
                  </p>
                )}
              </div>
            </div>

            {/* Criteria breakdown */}
            <div>
              <p className="font-medium mb-2 m-0!">Criteria Breakdown:</p>
              <div className="space-y-2">
                {result.criteriaScores.map((cs, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "p-2 rounded-lg text-sm",
                      cs.met 
                        ? "bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                        : "bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span>{cs.met ? "✓" : "✗"}</span>
                      <span className="font-medium">{cs.criterion}</span>
                    </div>
                    <p className="text-muted-foreground m-0! mt-1 ml-5">{cs.feedback}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <div>
                <p className="font-medium mb-2 m-0!">Suggestions for Improvement:</p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Example solution */}
            {exampleSolution && (
              <div>
                <button
                  onClick={() => setShowSolution(!showSolution)}
                  className="flex items-center gap-1 text-sm font-medium hover:text-primary"
                >
                  {showSolution ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showSolution ? "Hide" : "Show"} Example Solution
                </button>
                {showSolution && (
                  <pre className="mt-2 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm whitespace-pre-wrap font-mono">
                    {exampleSolution}
                  </pre>
                )}
              </div>
            )}

            {/* Retry */}
            <Button onClick={handleStart} variant="outline">
              <RefreshCw className="h-4 w-4 mr-1" />
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// BeforeAfterEditor Component - Edit prompts and compare
// ============================================================================

interface BeforeAfterEditorProps {
  title?: string;
  badPrompt: string;
  idealPrompt: string;
  task?: string;
  showComparison?: boolean; // Show side-by-side AI responses
}

export function BeforeAfterEditor({
  title = "Improve This Prompt",
  badPrompt,
  idealPrompt,
  task = "Improve this prompt to get better results",
}: BeforeAfterEditorProps) {
  const [userPrompt, setUserPrompt] = useState(badPrompt);
  const [showIdeal, setShowIdeal] = useState(false);
  const [isComparing, setIsComparing] = useState(false);
  const [comparison, setComparison] = useState<{
    winner: number;
    prompt1Analysis: { strengths: string[]; weaknesses: string[] };
    prompt2Analysis: { strengths: string[]; weaknesses: string[] };
    explanation: string;
    keyDifferences: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    setIsComparing(true);
    setError(null);
    setComparison(null);

    try {
      const res = await fetch("/api/book/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "compare_prompts",
          prompts: [badPrompt, userPrompt],
        }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 429) {
          setError(`Rate limit reached. Try again in ${data.resetIn}s.`);
        } else {
          setError(data.error || "Failed to compare prompts");
        }
        return;
      }

      setComparison(data.result);
    } catch {
      setError("Failed to connect to API");
    } finally {
      setIsComparing(false);
    }
  };

  const handleReset = () => {
    setUserPrompt(badPrompt);
    setComparison(null);
    setShowIdeal(false);
  };

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b">
        <span className="font-semibold">{title}</span>
      </div>

      <div className="p-4 space-y-4">
        <p className="text-sm text-muted-foreground m-0!">{task}</p>

        <div className="grid md:grid-cols-2 gap-4 mt-3">
          {/* Original */}
          <div>
            <label className="text-sm font-medium mb-1 block text-red-600 dark:text-red-400">
              Original (Weak) Prompt
            </label>
            <pre className="mt-0! p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm whitespace-pre-wrap h-40 overflow-y-auto">
              {badPrompt}
            </pre>
          </div>

          {/* User's version */}
          <div>
            <label className="text-sm font-medium mb-1 block text-primary">
              Your Improved Version
            </label>
            <textarea
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className="w-full px-3 py-2 text-sm border rounded-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 font-mono h-40"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleCompare} disabled={isComparing || userPrompt === badPrompt}>
            {isComparing ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            Compare with AI
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RefreshCw className="h-4 w-4 mr-1" />
            Reset
          </Button>
          <Button 
            onClick={() => setShowIdeal(!showIdeal)} 
            variant="ghost"
            className="ml-auto"
          >
            {showIdeal ? "Hide" : "Show"} Ideal Solution
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Ideal solution */}
        {showIdeal && (
          <div>
            <label className="text-sm font-medium mb-1 block text-green-600 dark:text-green-400">
              Ideal Solution
            </label>
            <pre className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-sm whitespace-pre-wrap">
              {idealPrompt}
            </pre>
          </div>
        )}

        {/* Comparison results */}
        {comparison && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {comparison.winner === 2 
                  ? "🎉 Your version is better!" 
                  : "The original might still be better. Keep improving!"}
              </span>
            </div>
            
            <p className="text-sm m-0!">{comparison.explanation}</p>

            {comparison.keyDifferences.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-1 m-0!">Key Differences:</p>
                <ul className="text-sm space-y-1">
                  {comparison.keyDifferences.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
