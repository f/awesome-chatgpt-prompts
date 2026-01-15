"use client";

import { useState, useEffect, useId, useRef, useCallback } from "react";
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
  const [dragOffset, setDragOffset] = useState(0); // Y offset for dragged item
  const [targetIndex, setTargetIndex] = useState<number | null>(null); // Where item will drop
  const dragStateRef = useRef<{ startY: number; draggedIndex: number } | null>(null);
  const targetIndexRef = useRef<number | null>(null); // Ref to access current target in event handlers
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const itemHeight = useRef(0);

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

  // Shared drag move handler for both touch and mouse
  const handleDragMove = useCallback((currentY: number) => {
    const state = dragStateRef.current;
    if (!state) return;
    
    const deltaY = currentY - state.startY;
    
    // Update drag offset for visual feedback
    setDragOffset(deltaY);
    
    // Calculate target position based on how far we've dragged
    const positionShift = Math.round(deltaY / itemHeight.current);
    const newTargetIndex = Math.max(0, Math.min(pieces.length - 1, state.draggedIndex + positionShift));
    setTargetIndex(newTargetIndex);
    targetIndexRef.current = newTargetIndex; // Keep ref in sync
  }, [pieces.length]);

  // Event listeners for drag movement (touch and mouse)
  useEffect(() => {
    const container = containerRef.current;
    if (!container || submitted || !isLoaded) return;

    const onTouchMove = (e: TouchEvent) => {
      if (!dragStateRef.current) return;
      e.preventDefault();
      handleDragMove(e.touches[0].clientY);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragStateRef.current) return;
      e.preventDefault();
      handleDragMove(e.clientY);
    };

    container.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('mousemove', onMouseMove);
    
    return () => {
      container.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('mousemove', onMouseMove);
    };
  }, [submitted, isLoaded, handleDragMove]);

  // Unified drag start handler for both touch and mouse
  const handlePointerStart = useCallback((position: number, clientY: number, element: HTMLDivElement | null) => {
    if (submitted || !element) return;
    const rect = element.getBoundingClientRect();
    itemHeight.current = rect.height + 8; // height + gap
    setDraggedIndex(position);
    setTargetIndex(position);
    setDragOffset(0);
    dragStateRef.current = { startY: clientY, draggedIndex: position };
    targetIndexRef.current = position; // Initialize target ref
  }, [submitted]);

  // Listen for mouseup anywhere to end drag
  useEffect(() => {
    const onMouseUp = () => {
      const state = dragStateRef.current;
      const target = targetIndexRef.current;
      if (!state) return;
      
      // Apply the reorder if target changed
      if (target !== null && state.draggedIndex !== target) {
        setCurrentOrder(prev => {
          const newOrder = [...prev];
          const [draggedItem] = newOrder.splice(state.draggedIndex, 1);
          newOrder.splice(target, 0, draggedItem);
          return newOrder;
        });
      }
      
      setDraggedIndex(null);
      setTargetIndex(null);
      setDragOffset(0);
      dragStateRef.current = null;
      targetIndexRef.current = null;
    };
    
    document.addEventListener('mouseup', onMouseUp);
    return () => document.removeEventListener('mouseup', onMouseUp);
  }, []);

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

  // Unified drag end handler (for touch)
  const handlePointerEnd = () => {
    // Apply the reorder if target changed
    if (draggedIndex !== null && targetIndex !== null && draggedIndex !== targetIndex) {
      setCurrentOrder(prev => {
        const newOrder = [...prev];
        const [draggedItem] = newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedItem);
        return newOrder;
      });
    }
    setDraggedIndex(null);
    setTargetIndex(null);
    setDragOffset(0);
    dragStateRef.current = null;
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
      <div ref={containerRef} className="space-y-2 mb-4">
        {currentOrder.map((pieceIndex, position) => {
          const isCorrectPiece = submitted && pieceIndex === correctOrder[position];
          const isWrongPiece = submitted && pieceIndex !== correctOrder[position];
          const isDragging = draggedIndex === position;
          
          // Calculate transform for visual drag feedback
          let transform = '';
          if (draggedIndex !== null && targetIndex !== null) {
            if (isDragging) {
              // Dragged item follows the finger
              transform = `translateY(${dragOffset}px) scale(1.02)`;
            } else if (draggedIndex < targetIndex) {
              // Items between original and target shift up
              if (position > draggedIndex && position <= targetIndex) {
                transform = `translateY(-${itemHeight.current}px)`;
              }
            } else if (draggedIndex > targetIndex) {
              // Items between target and original shift down
              if (position >= targetIndex && position < draggedIndex) {
                transform = `translateY(${itemHeight.current}px)`;
              }
            }
          }
          
          return (
            <div
              key={`${pieceIndex}-${position}`}
              onMouseDown={(e) => {
                e.preventDefault();
                handlePointerStart(position, e.clientY, e.currentTarget as HTMLDivElement);
              }}
              onTouchStart={(e) => handlePointerStart(position, e.touches[0].clientY, e.currentTarget as HTMLDivElement)}
              onTouchEnd={handlePointerEnd}
              className={cn(
                "flex items-center gap-2 p-2 border-2 select-none",
                !submitted && "bg-white border-[#D97706] hover:bg-[#FEF3C7] cursor-grab active:cursor-grabbing touch-none",
                isDragging && "z-10 shadow-lg border-[#3B82F6] bg-[#EFF6FF]",
                !isDragging && draggedIndex !== null && "transition-transform duration-150",
                isCorrectPiece && "bg-[#DCFCE7] border-[#16A34A]",
                isWrongPiece && "bg-[#FEE2E2] border-[#DC2626]"
              )}
              style={{ 
                clipPath: "polygon(4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px), 0 4px)",
                transform: transform || undefined,
              }}
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
        ) : !correct ? (
          <button 
            onClick={handleReset} 
            className="px-6 py-3 bg-[#8B4513] hover:bg-[#A0522D] text-white font-bold text-xl transition-colors"
            style={{ clipPath: "polygon(4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px), 0 4px)" }}
          >
            {t("retry")}
          </button>
        ) : null}
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
