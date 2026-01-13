"use client";

import { useState, useCallback, useEffect, useId } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLevelSlug } from "@/components/kids/providers/level-context";
import { getComponentState, saveComponentState } from "@/lib/kids/progress";

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
  const componentId = useId();
  const displayTitle = title || t("title");
  const displayInstruction = instruction || t("instruction");

  const [shuffledPieces, setShuffledPieces] = useState<number[]>([]);
  const [currentOrder, setCurrentOrder] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

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

  // Move piece left (swap with previous)
  const moveLeft = (position: number) => {
    if (submitted || position === 0) return;
    const newOrder = [...currentOrder];
    [newOrder[position - 1], newOrder[position]] = [newOrder[position], newOrder[position - 1]];
    setCurrentOrder(newOrder);
  };

  // Move piece right (swap with next)
  const moveRight = (position: number) => {
    if (submitted || position === currentOrder.length - 1) return;
    const newOrder = [...currentOrder];
    [newOrder[position], newOrder[position + 1]] = [newOrder[position + 1], newOrder[position]];
    setCurrentOrder(newOrder);
  };

  // Tap to select, tap another to swap
  const handleTap = (position: number) => {
    if (submitted) return;
    
    if (selectedIndex === null) {
      // Select this piece
      setSelectedIndex(position);
    } else if (selectedIndex === position) {
      // Deselect
      setSelectedIndex(null);
    } else {
      // Swap with selected piece
      const newOrder = [...currentOrder];
      [newOrder[selectedIndex], newOrder[position]] = [newOrder[position], newOrder[selectedIndex]];
      setCurrentOrder(newOrder);
      setSelectedIndex(null);
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setSelectedIndex(null);
  };

  const handleReset = () => {
    setCurrentOrder(shuffledPieces);
    setSubmitted(false);
    setSelectedIndex(null);
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

      {/* Pieces with arrow controls */}
      <div className="space-y-2 mb-4">
        {currentOrder.map((pieceIndex, position) => {
          const isSelected = selectedIndex === position;
          const isCorrectPiece = submitted && pieceIndex === correctOrder[position];
          const isWrongPiece = submitted && pieceIndex !== correctOrder[position];
          
          return (
            <div
              key={`${pieceIndex}-${position}`}
              className={cn(
                "flex items-center gap-2 p-2 border-2 transition-all",
                !submitted && !isSelected && "bg-white border-[#D97706] hover:bg-[#FEF3C7]",
                !submitted && isSelected && "bg-[#DBEAFE] border-[#3B82F6] ring-2 ring-[#3B82F6] scale-[1.02]",
                isCorrectPiece && "bg-[#DCFCE7] border-[#16A34A]",
                isWrongPiece && "bg-[#FEE2E2] border-[#DC2626]"
              )}
              style={{ clipPath: "polygon(4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px), 0 4px)" }}
            >
              {/* Position number */}
              <span className="w-8 h-8 flex items-center justify-center bg-[#D97706] text-white font-bold rounded-md text-lg">
                {position + 1}
              </span>
              
              {/* Left arrow */}
              <button
                onClick={() => moveLeft(position)}
                disabled={submitted || position === 0}
                className={cn(
                  "w-10 h-10 flex items-center justify-center border-2 transition-all",
                  position === 0 || submitted
                    ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                    : "bg-[#FEF3C7] border-[#D97706] text-[#D97706] hover:bg-[#D97706] hover:text-white active:scale-95"
                )}
                style={{ clipPath: "polygon(2px 0, calc(100% - 2px) 0, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 0 calc(100% - 2px), 0 2px)" }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              {/* Piece content - tappable */}
              <button
                onClick={() => handleTap(position)}
                disabled={submitted}
                className={cn(
                  "flex-1 px-4 py-3 text-xl font-medium text-left transition-all",
                  !submitted && "hover:bg-[#FEF3C7] cursor-pointer",
                  submitted && "cursor-default"
                )}
              >
                <span className="text-[#2C1810]">{pieces[pieceIndex]}</span>
              </button>
              
              {/* Right arrow */}
              <button
                onClick={() => moveRight(position)}
                disabled={submitted || position === currentOrder.length - 1}
                className={cn(
                  "w-10 h-10 flex items-center justify-center border-2 transition-all",
                  position === currentOrder.length - 1 || submitted
                    ? "bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed"
                    : "bg-[#FEF3C7] border-[#D97706] text-[#D97706] hover:bg-[#D97706] hover:text-white active:scale-95"
                )}
                style={{ clipPath: "polygon(2px 0, calc(100% - 2px) 0, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 0 calc(100% - 2px), 0 2px)" }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              {/* Status indicator */}
              {submitted && (
                <span className="w-8 h-8 flex items-center justify-center text-xl">
                  {isCorrectPiece ? "✓" : "✗"}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Hint for tap-to-swap */}
      {selectedIndex !== null && (
        <div className="bg-[#DBEAFE] border-2 border-[#3B82F6] p-3 mb-4 text-center" style={{ clipPath: "polygon(4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px), 0 4px)" }}>
          <p className="text-lg text-[#1E40AF] font-medium m-0">
            👆 {t("tapToSwap")}
          </p>
        </div>
      )}

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
