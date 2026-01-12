"use client";

import { useState } from "react";
import { Check, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PromiWithMessage } from "./character-guide";

interface PromptVsMistakeProps {
  question: string;
  good: string;
  bad: string;
  goodLabel?: string;
  badLabel?: string;
  explanation?: string;
  promiMessage?: string;
}

export function PromptVsMistake({
  question,
  good,
  bad,
  goodLabel = "Good prompt ✓",
  badLabel = "Not so good ✗",
  explanation,
  promiMessage,
}: PromptVsMistakeProps) {
  const [selected, setSelected] = useState<"good" | "bad" | null>(null);
  const [showResult, setShowResult] = useState(false);

  // Randomize order
  const [order] = useState(() => Math.random() > 0.5 ? ["good", "bad"] : ["bad", "good"]);

  const handleSelect = (choice: "good" | "bad") => {
    setSelected(choice);
    setShowResult(true);
  };

  const handleReset = () => {
    setSelected(null);
    setShowResult(false);
  };

  const isCorrect = selected === "good";

  const options = order.map((type) => ({
    type: type as "good" | "bad",
    text: type === "good" ? good : bad,
  }));

  return (
    <div className="my-6 rounded-2xl border-2 border-primary/20 overflow-hidden">
      {/* Question */}
      <div className="px-4 py-3 bg-primary/10 border-b border-primary/20">
        <p className="font-semibold text-lg m-0">🤔 {question}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Options */}
        <div className="grid sm:grid-cols-2 gap-4">
          {options.map(({ type, text }) => (
            <button
              key={type}
              onClick={() => handleSelect(type)}
              disabled={showResult}
              className={cn(
                "p-4 rounded-xl border-2 text-left transition-all",
                !showResult && "hover:border-primary hover:shadow-md cursor-pointer",
                showResult && type === "good" && "border-green-500 bg-green-50 dark:bg-green-950/30",
                showResult && type === "bad" && "border-red-400 bg-red-50 dark:bg-red-950/30",
                !showResult && "border-muted-foreground/20 bg-muted/30"
              )}
            >
              <pre className="whitespace-pre-wrap text-sm font-mono m-0">{text}</pre>
              
              {showResult && (
                <div className={cn(
                  "flex items-center gap-2 mt-3 pt-3 border-t text-sm font-medium",
                  type === "good" ? "text-green-600 border-green-200" : "text-red-500 border-red-200"
                )}>
                  {type === "good" ? (
                    <>
                      <Check className="h-4 w-4" />
                      {goodLabel}
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      {badLabel}
                    </>
                  )}
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Result */}
        {showResult && (
          <div className={cn(
            "p-4 rounded-xl",
            isCorrect 
              ? "bg-green-100 dark:bg-green-950/50 border border-green-300 dark:border-green-800"
              : "bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800"
          )}>
            <p className="font-semibold text-lg m-0 mb-2">
              {isCorrect ? "🎉 Great job!" : "🤔 Not quite!"}
            </p>
            {explanation && <p className="text-sm m-0">{explanation}</p>}
          </div>
        )}

        {/* Promi message */}
        {showResult && promiMessage && (
          <PromiWithMessage 
            message={promiMessage} 
            mood={isCorrect ? "celebrating" : "thinking"} 
          />
        )}

        {/* Reset button */}
        {showResult && (
          <Button onClick={handleReset} variant="outline" size="sm" className="rounded-full">
            <RefreshCw className="h-4 w-4 mr-1" />
            Try again
          </Button>
        )}
      </div>
    </div>
  );
}
