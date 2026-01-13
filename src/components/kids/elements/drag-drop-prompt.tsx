"use client";

import { useState, useEffect, useId } from "react";
import { useTranslations } from "next-intl";
import { ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLevelSlug, useSectionNavigation } from "@/components/kids/providers/level-context";
import { getComponentState, saveComponentState, markSectionCompleted } from "@/lib/kids/progress";

interface DragDropPromptProps {
  title?: string;
  instruction?: string;
  pieces: string[];
  correctOrder: number[];
  successMessage?: string;
}

interface SavedState {
  currentOrder: number[];
  submitted: boolean;
  shuffledPieces: number[];
}

export function DragDropPrompt({
  title,
  instruction,
  pieces,
  correctOrder,
  successMessage,
}: DragDropPromptProps) {
  const t = useTranslations("kids.dragDrop");
  const levelSlug = useLevelSlug();
  const { currentSection, markSectionComplete, registerSectionRequirement } = useSectionNavigation();
  const componentId = useId();
  const displayTitle = title || t("title");
  const displayInstruction = instruction || t("instruction");
  
  // Register that this section has an interactive element requiring completion
  useEffect(() => {
    registerSectionRequirement(currentSection);
  }, [currentSection, registerSectionRequirement]);

  const [shuffledPieces, setShuffledPieces] = useState<number[]>([]);
  const [currentOrder, setCurrentOrder] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Load saved state on mount
  useEffect(() => {
    const shuffle = () => {
      const indices = pieces.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      return indices;
    };

    if (!levelSlug) {
      const shuffled = shuffle();
      setShuffledPieces(shuffled);
      setCurrentOrder(shuffled);
      setIsLoaded(true);
      return;
    }
    
    const saved = getComponentState<SavedState>(levelSlug, componentId);
    if (saved && saved.shuffledPieces && saved.shuffledPieces.length > 0 && saved.currentOrder) {
      setShuffledPieces(saved.shuffledPieces);
      setCurrentOrder(saved.currentOrder);
      setSubmitted(saved.submitted || false);
    } else {
      const shuffled = shuffle();
      setShuffledPieces(shuffled);
      setCurrentOrder(shuffled);
    }
    setIsLoaded(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelSlug, componentId]);

  // Save state when it changes
  useEffect(() => {
    if (!levelSlug || !isLoaded || currentOrder.length === 0) return;
    
    saveComponentState<SavedState>(levelSlug, componentId, {
      currentOrder,
      submitted,
      shuffledPieces,
    });
  }, [levelSlug, componentId, currentOrder, submitted, shuffledPieces, isLoaded]);

  // Don't render until loaded to prevent hydration mismatch
  if (!isLoaded) return null;

  const isCorrect = () => {
    return currentOrder.every((pieceIndex, position) => pieceIndex === correctOrder[position]);
  };

  // Move piece up (swap with previous)
  const moveUp = (position: number) => {
    if (submitted || position === 0) return;
    const newOrder = [...currentOrder];
    [newOrder[position - 1], newOrder[position]] = [newOrder[position], newOrder[position - 1]];
    setCurrentOrder(newOrder);
  };

  // Move piece down (swap with next)
  const moveDown = (position: number) => {
    if (submitted || position === currentOrder.length - 1) return;
    const newOrder = [...currentOrder];
    [newOrder[position], newOrder[position + 1]] = [newOrder[position + 1], newOrder[position]];
    setCurrentOrder(newOrder);
  };

  // Drag handlers
  const handleDragStart = (position: number) => {
    if (submitted) return;
    setDraggedIndex(position);
  };

  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    if (submitted || draggedIndex === null) return;
    setDragOverIndex(position);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (position: number) => {
    if (submitted || draggedIndex === null || draggedIndex === position) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }
    
    const newOrder = [...currentOrder];
    const [draggedItem] = newOrder.splice(draggedIndex, 1);
    newOrder.splice(position, 0, draggedItem);
    setCurrentOrder(newOrder);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSubmit = () => {
    setSubmitted(true);
    // Mark section as complete if answer is correct
    if (isCorrect() && levelSlug) {
      markSectionCompleted(levelSlug, currentSection);
      markSectionComplete(currentSection);
    }
  };

  const handleReset = () => {
    setCurrentOrder(shuffledPieces);
    setSubmitted(false);
  };

  const correct = isCorrect();

  return (
    <div className="my-4 p-4 pixel-panel">
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <PixelPuzzleIcon />
        <span className="font-bold text-2xl text-[#2C1810]">{displayTitle}</span>
      </div>
      <p className="text-lg text-[#8B7355] mb-4 m-0">{displayInstruction}</p>

      {/* Pieces with up/down arrow controls */}
      <div className="space-y-2 mb-4">
        {currentOrder.map((pieceIndex, position) => {
          const isCorrectPiece = submitted && pieceIndex === correctOrder[position];
          const isWrongPiece = submitted && pieceIndex !== correctOrder[position];
          const isDragging = draggedIndex === position;
          const isDragOver = dragOverIndex === position && draggedIndex !== position;
          
          return (
            <div
              key={`${pieceIndex}-${position}`}
              draggable={!submitted}
              onDragStart={() => handleDragStart(position)}
              onDragOver={(e) => handleDragOver(e, position)}
              onDragLeave={handleDragLeave}
              onDrop={() => handleDrop(position)}
              onDragEnd={handleDragEnd}
              className={cn(
                "flex items-center gap-2 p-2 border-2 transition-all",
                !submitted && "bg-white border-[#D97706] hover:bg-[#FEF3C7] cursor-grab active:cursor-grabbing",
                isDragging && "opacity-50 scale-95",
                isDragOver && "border-[#3B82F6] border-dashed bg-[#DBEAFE]",
                isCorrectPiece && "bg-[#DCFCE7] border-[#16A34A]",
                isWrongPiece && "bg-[#FEE2E2] border-[#DC2626]"
              )}
              style={{ clipPath: "polygon(4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px), 0 4px)" }}
            >
              {/* Position number */}
              <span className="w-8 h-8 flex items-center justify-center bg-[#D97706] text-white font-bold rounded-md text-lg shrink-0">
                {position + 1}
              </span>
              
              {/* Piece content */}
              <div className="flex-1 px-4 py-3 text-xl font-medium text-left">
                <span className="text-[#2C1810]">{pieces[pieceIndex]}</span>
              </div>
              
              {/* Up/Down arrows */}
              <div className="flex flex-col gap-1 shrink-0">
                {/* Up arrow */}
                <button
                  onClick={() => moveUp(position)}
                  disabled={submitted || position === 0}
                  className={cn(
                    "w-10 h-8 flex items-center justify-center border-2 transition-all",
                    position === 0 || submitted
                      ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                      : "bg-[#FEF3C7] border-[#D97706] text-[#D97706] hover:bg-[#D97706] hover:text-white active:scale-95"
                  )}
                  style={{ clipPath: "polygon(2px 0, calc(100% - 2px) 0, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 0 calc(100% - 2px), 0 2px)" }}
                >
                  <ChevronUp className="w-5 h-5" />
                </button>
                
                {/* Down arrow */}
                <button
                  onClick={() => moveDown(position)}
                  disabled={submitted || position === currentOrder.length - 1}
                  className={cn(
                    "w-10 h-8 flex items-center justify-center border-2 transition-all",
                    position === currentOrder.length - 1 || submitted
                      ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                      : "bg-[#FEF3C7] border-[#D97706] text-[#D97706] hover:bg-[#D97706] hover:text-white active:scale-95"
                  )}
                  style={{ clipPath: "polygon(2px 0, calc(100% - 2px) 0, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 0 calc(100% - 2px), 0 2px)" }}
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
              
              {/* Status indicator */}
              {submitted && (
                <span className="w-8 h-8 flex items-center justify-center text-xl shrink-0">
                  {isCorrectPiece ? "✓" : "✗"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview */}
      <div className="bg-[#FEF3C7]/50 p-4 mb-4 border-2 border-[#D97706]/30" style={{ clipPath: "polygon(4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px), 0 4px)" }}>
        <span className="text-lg text-[#8B7355]">{t("result")}: </span>
        <span className="text-xl text-[#2C1810]">
          {currentOrder.map((i) => pieces[i]).join(" ")}
        </span>
      </div>

      {/* Result feedback */}
      {submitted && (
        <div 
          className={cn(
            "p-4 mt-4 mb-4 text-center",
            correct ? "bg-[#DCFCE7] border-2 border-[#16A34A]" : "bg-[#FEF3C7] border-2 border-[#D97706]"
          )}
          style={{ clipPath: "polygon(4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px), 0 4px)" }}
        >
          {correct ? (
            <p className="font-bold text-xl m-0 text-[#16A34A]">🎉 {successMessage || t("success")}</p>
          ) : (
            <p className="font-bold text-lg m-0 text-[#D97706]">{t("almost")}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!submitted ? (
          <button 
            onClick={handleSubmit} 
            className="px-6 py-3 bg-[#22C55E] hover:bg-[#16A34A] text-white font-bold text-xl transition-colors"
            style={{ clipPath: "polygon(4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px), 0 4px)" }}
          >
            {t("check")}
          </button>
        ) : (
          <button 
            onClick={handleReset} 
            className="px-6 py-3 bg-[#8B4513] hover:bg-[#A0522D] text-white font-bold text-xl transition-colors"
            style={{ clipPath: "polygon(4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px), 0 4px)" }}
          >
            {t("retry")}
          </button>
        )}
      </div>
    </div>
  );
}

function PixelPuzzleIcon() {
  return (
    <svg viewBox="0 0 16 16" className="w-5 h-5 inline-block text-[#3B82F6]" style={{ imageRendering: "pixelated" }}>
      <rect x="2" y="2" width="5" height="5" fill="currentColor" />
      <rect x="9" y="2" width="5" height="5" fill="currentColor" />
      <rect x="2" y="9" width="5" height="5" fill="currentColor" />
      <rect x="9" y="9" width="5" height="5" fill="currentColor" />
      <rect x="7" y="4" width="2" height="2" fill="currentColor" />
      <rect x="4" y="7" width="2" height="2" fill="currentColor" />
    </svg>
  );
}
