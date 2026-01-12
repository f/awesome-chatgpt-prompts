"use client";

import { useState, useCallback } from "react";
import { Check, RefreshCw, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DragDropPromptProps {
  title?: string;
  instruction?: string;
  pieces: string[];
  correctOrder: number[]; // Indices of pieces in correct order
  successMessage?: string;
}

export function DragDropPrompt({
  title = "Build the prompt! 🧩",
  instruction = "Drag the pieces into the right order to make a good prompt.",
  pieces,
  correctOrder,
  successMessage = "Perfect! You built a great prompt!",
}: DragDropPromptProps) {
  const [shuffledPieces] = useState(() => {
    // Create array of indices and shuffle
    const indices = pieces.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });

  const [currentOrder, setCurrentOrder] = useState<number[]>(shuffledPieces);
  const [submitted, setSubmitted] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const isCorrect = useCallback(() => {
    return currentOrder.every((pieceIndex, position) => pieceIndex === correctOrder[position]);
  }, [currentOrder, correctOrder]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrder = [...currentOrder];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);
    setCurrentOrder(newOrder);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveItem = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= currentOrder.length) return;

    const newOrder = [...currentOrder];
    [newOrder[fromIndex], newOrder[toIndex]] = [newOrder[toIndex], newOrder[fromIndex]];
    setCurrentOrder(newOrder);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setCurrentOrder(shuffledPieces);
    setSubmitted(false);
  };

  const correct = isCorrect();

  return (
    <div className="my-6 rounded-2xl border-2 border-blue-200 dark:border-blue-800 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-blue-100 to-cyan-100 dark:from-blue-950/50 dark:to-cyan-950/50 border-b border-blue-200 dark:border-blue-800">
        <p className="font-semibold m-0">{title}</p>
        <p className="text-sm text-muted-foreground m-0">{instruction}</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Draggable pieces */}
        <div className="space-y-2">
          {currentOrder.map((pieceIndex, position) => (
            <div
              key={`${pieceIndex}-${position}`}
              draggable={!submitted}
              onDragStart={() => handleDragStart(position)}
              onDragOver={(e) => handleDragOver(e, position)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl border-2 transition-all",
                !submitted && "cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-md",
                submitted && pieceIndex === correctOrder[position] && "border-green-500 bg-green-50 dark:bg-green-950/30",
                submitted && pieceIndex !== correctOrder[position] && "border-red-400 bg-red-50 dark:bg-red-950/30",
                !submitted && "border-muted-foreground/20 bg-white dark:bg-card",
                draggedIndex === position && "opacity-50 scale-95"
              )}
            >
              {!submitted && (
                <div className="flex flex-col gap-0.5">
                  <button
                    onClick={() => moveItem(position, "up")}
                    disabled={position === 0}
                    className="p-0.5 hover:text-primary disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveItem(position, "down")}
                    disabled={position === currentOrder.length - 1}
                    className="p-0.5 hover:text-primary disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
              )}
              
              <GripVertical className={cn("h-5 w-5 text-muted-foreground shrink-0", submitted && "opacity-0")} />
              
              <span className="flex-1 font-mono text-sm">{pieces[pieceIndex]}</span>
              
              <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                {position + 1}
              </span>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="p-3 bg-muted/30 rounded-xl">
          <p className="text-xs text-muted-foreground mb-2 m-0">Your prompt will look like:</p>
          <pre className="whitespace-pre-wrap text-sm font-mono m-0">
            {currentOrder.map((i) => pieces[i]).join(" ")}
          </pre>
        </div>

        {/* Result */}
        {submitted && (
          <div
            className={cn(
              "p-4 rounded-xl text-center",
              correct
                ? "bg-green-100 dark:bg-green-950/50 border border-green-300 dark:border-green-800"
                : "bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800"
            )}
          >
            {correct ? (
              <>
                <p className="text-2xl mb-2">🎉</p>
                <p className="font-semibold text-lg m-0">{successMessage}</p>
              </>
            ) : (
              <>
                <p className="font-semibold m-0">Almost there!</p>
                <p className="text-sm text-muted-foreground m-0 mt-1">
                  Try moving the pieces around to find the best order.
                </p>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!submitted ? (
            <Button onClick={handleSubmit} className="rounded-full">
              <Check className="h-4 w-4 mr-1" />
              Check my prompt!
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
