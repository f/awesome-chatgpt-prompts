"use client";

import { useState, useCallback } from "react";
import { Check, RefreshCw, Sparkles, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BlankConfig {
  id: string;
  hint: string;
  answers: string[]; // Words to choose from (first one is correct)
  emoji?: string;
}

interface MagicWordsProps {
  title?: string;
  sentence: string; // Use {{id}} for blanks
  blanks: BlankConfig[];
  successMessage?: string;
}

export function MagicWords({
  title = "Drag the magic words! ✨",
  sentence,
  blanks,
  successMessage = "Amazing! You created a great prompt!",
}: MagicWordsProps) {
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [draggedWord, setDraggedWord] = useState<string | null>(null);

  // Get all available words from blanks (shuffled)
  const [availableWords] = useState(() => {
    const words = blanks.flatMap((blank) => 
      blank.answers.map((answer) => ({ word: answer, blankId: blank.id }))
    );
    // Shuffle
    for (let i = words.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [words[i], words[j]] = [words[j], words[i]];
    }
    return words;
  });

  const checkAnswer = useCallback((blankId: string, value: string): boolean => {
    const blank = blanks.find((b) => b.id === blankId);
    if (!blank) return false;
    return blank.answers.some((answer) => answer.toLowerCase() === value.toLowerCase());
  }, [blanks]);

  const allCorrect = submitted && blanks.every((blank) => checkAnswer(blank.id, placements[blank.id] || ""));
  const score = blanks.filter((blank) => checkAnswer(blank.id, placements[blank.id] || "")).length;

  const usedWords = Object.values(placements);

  const handleDragStart = (word: string) => {
    setDraggedWord(word);
  };

  const handleDragEnd = () => {
    setDraggedWord(null);
  };

  const handleDrop = (blankId: string) => {
    if (draggedWord && !submitted) {
      // Remove word from previous placement if it was placed somewhere
      const newPlacements = { ...placements };
      Object.keys(newPlacements).forEach((key) => {
        if (newPlacements[key] === draggedWord) {
          delete newPlacements[key];
        }
      });
      newPlacements[blankId] = draggedWord;
      setPlacements(newPlacements);
      setDraggedWord(null);
    }
  };

  const handleClickWord = (word: string) => {
    if (submitted) return;
    
    // Find first empty blank
    const emptyBlank = blanks.find((blank) => !placements[blank.id]);
    if (emptyBlank) {
      // Remove word from previous placement
      const newPlacements = { ...placements };
      Object.keys(newPlacements).forEach((key) => {
        if (newPlacements[key] === word) {
          delete newPlacements[key];
        }
      });
      newPlacements[emptyBlank.id] = word;
      setPlacements(newPlacements);
    }
  };

  const handleClickBlank = (blankId: string) => {
    if (submitted) return;
    // Remove word from this blank
    const newPlacements = { ...placements };
    delete newPlacements[blankId];
    setPlacements(newPlacements);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setPlacements({});
    setSubmitted(false);
  };

  // Parse sentence and render with drop zones
  const renderSentence = () => {
    const parts = sentence.split(/(\{\{[^}]+\}\})/g);

    return parts.map((part, index) => {
      const match = part.match(/\{\{([^}]+)\}\}/);
      if (match) {
        const blankId = match[1];
        const blank = blanks.find((b) => b.id === blankId);
        const placedWord = placements[blankId];
        const isCorrect = submitted && checkAnswer(blankId, placedWord || "");
        const isWrong = submitted && !isCorrect;

        return (
          <span key={index} className="inline-flex items-center gap-1 mx-1 my-1">
            {blank?.emoji && <span className="text-lg">{blank.emoji}</span>}
            <span
              onClick={() => placedWord && handleClickBlank(blankId)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(blankId)}
              className={cn(
                "px-3 py-2 border-2 border-dashed rounded-xl min-w-[100px] text-center font-medium transition-all cursor-pointer",
                !placedWord && "bg-white dark:bg-card border-primary/50",
                placedWord && !submitted && "bg-primary/10 border-primary border-solid",
                isCorrect && "border-green-500 border-solid bg-green-50 dark:bg-green-950/30",
                isWrong && "border-red-400 border-solid bg-red-50 dark:bg-red-950/30",
                draggedWord && !placedWord && "border-primary bg-primary/5 scale-105"
              )}
            >
              {placedWord || "___"}
            </span>
            {submitted && isCorrect && <Check className="h-5 w-5 text-green-500" />}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="my-6 rounded-2xl border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-950/50 dark:to-pink-950/50 border-b border-purple-200 dark:border-purple-800">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <span className="font-semibold">{title}</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Sentence with blanks */}
        <div className="text-lg leading-loose p-4 bg-muted/30 rounded-xl flex flex-wrap items-center">
          {renderSentence()}
        </div>

        {/* Word bank */}
        <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
          <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-3">
            🎯 Drag or tap words to fill the blanks:
          </p>
          <div className="flex flex-wrap gap-2">
            {availableWords.map(({ word }, index) => {
              const isUsed = usedWords.includes(word);
              return (
                <button
                  key={`${word}-${index}`}
                  draggable={!submitted && !isUsed}
                  onDragStart={() => handleDragStart(word)}
                  onDragEnd={handleDragEnd}
                  onClick={() => !isUsed && handleClickWord(word)}
                  disabled={submitted || isUsed}
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-lg border-2 font-medium transition-all",
                    !isUsed && !submitted && "bg-white dark:bg-card border-purple-300 hover:border-purple-500 hover:shadow-md cursor-grab active:cursor-grabbing",
                    isUsed && "bg-muted/50 border-muted text-muted-foreground opacity-50 cursor-not-allowed",
                    submitted && "cursor-default"
                  )}
                >
                  {!submitted && !isUsed && <GripVertical className="h-4 w-4 text-muted-foreground" />}
                  {word}
                </button>
              );
            })}
          </div>
        </div>

        {/* Result */}
        {submitted && (
          <div
            className={cn(
              "p-4 rounded-xl text-center",
              allCorrect
                ? "bg-green-100 dark:bg-green-950/50 border border-green-300 dark:border-green-800"
                : "bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800"
            )}
          >
            {allCorrect ? (
              <>
                <p className="text-2xl mb-2">🎉</p>
                <p className="font-semibold text-lg m-0">{successMessage}</p>
              </>
            ) : (
              <>
                <p className="font-semibold m-0">
                  {score} of {blanks.length} correct!
                </p>
                <p className="text-sm text-muted-foreground m-0 mt-1">
                  Try different words!
                </p>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!submitted ? (
            <Button 
              onClick={handleSubmit} 
              className="rounded-full"
              disabled={Object.keys(placements).length < blanks.length}
            >
              <Check className="h-4 w-4 mr-1" />
              Check my words!
            </Button>
          ) : (
            <Button onClick={handleReset} variant="outline" className="rounded-full">
              <RefreshCw className="h-4 w-4 mr-1" />
              Try again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
