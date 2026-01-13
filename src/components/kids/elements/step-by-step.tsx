"use client";

import { useState, useEffect, useId } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useLevelSlug, useSectionNavigation } from "@/components/kids/providers/level-context";
import { getComponentState, saveComponentState, markSectionCompleted } from "@/lib/kids/progress";

interface StepByStepProps {
  title?: string;
  problem: string;
  wrongAnswer: string;
  steps: string[];
  rightAnswer: string;
  magicWords?: string;
  successMessage?: string;
}

interface SavedState {
  magicWordsAdded: boolean;
  revealedSteps: number;
  completed: boolean;
}

export function StepByStep({
  title,
  problem,
  wrongAnswer,
  steps,
  rightAnswer,
  magicWords = "Let's think step by step",
  successMessage,
}: StepByStepProps) {
  const t = useTranslations("kids.stepByStep");
  const levelSlug = useLevelSlug();
  const { currentSection, markSectionComplete, registerSectionRequirement } = useSectionNavigation();
  const componentId = useId();
  
  // Register that this section has an interactive element requiring completion
  useEffect(() => {
    registerSectionRequirement(currentSection);
  }, [currentSection, registerSectionRequirement]);
  
  const displayTitle = title || t("title");

  const [magicWordsAdded, setMagicWordsAdded] = useState(false);
  const [revealedSteps, setRevealedSteps] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved state
  useEffect(() => {
    if (!levelSlug) {
      setIsLoaded(true);
      return;
    }
    const saved = getComponentState<SavedState>(levelSlug, componentId);
    if (saved && typeof saved.magicWordsAdded === 'boolean') {
      setMagicWordsAdded(saved.magicWordsAdded);
      setRevealedSteps(saved.revealedSteps || 0);
      setCompleted(saved.completed || false);
    }
    setIsLoaded(true);
  }, [levelSlug, componentId]);

  // Save state
  useEffect(() => {
    if (!levelSlug || !isLoaded) return;
    saveComponentState<SavedState>(levelSlug, componentId, {
      magicWordsAdded,
      revealedSteps,
      completed,
    });
  }, [levelSlug, componentId, magicWordsAdded, revealedSteps, completed, isLoaded]);

  if (!isLoaded) return null;

  const handleAddMagicWords = () => {
    setMagicWordsAdded(true);
  };

  const handleRevealNextStep = () => {
    if (revealedSteps < steps.length) {
      const newRevealed = revealedSteps + 1;
      setRevealedSteps(newRevealed);
      if (newRevealed === steps.length) {
        setCompleted(true);
        // Mark section as complete
        if (levelSlug) {
          markSectionCompleted(levelSlug, currentSection);
          markSectionComplete(currentSection);
        }
      }
    }
  };

  const handleReset = () => {
    setMagicWordsAdded(false);
    setRevealedSteps(0);
    setCompleted(false);
  };

  return (
    <div className="my-4 p-4 bg-gradient-to-br from-[#DBEAFE] to-[#BFDBFE] border-4 border-[#3B82F6] rounded-xl">
      {/* Title */}
      <h3 className="text-xl font-bold text-[#1D4ED8] mb-4 flex items-center gap-2">
        🧠 {displayTitle}
      </h3>

      {/* Problem */}
      <div className="bg-white/80 rounded-lg p-4 mb-4 border-2 border-[#3B82F6]">
        <div className="text-sm font-medium text-[#3B82F6] mb-2">{t("problem")}</div>
        <p className="text-lg font-medium text-[#2C1810] m-0">{problem}</p>
      </div>

      {/* Wrong answer (before magic words) */}
      {!magicWordsAdded && (
        <div className="bg-red-50 rounded-lg p-4 mb-4 border-2 border-red-300">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">😕</span>
            <span className="font-bold text-red-600">{t("withoutMagic")}</span>
          </div>
          <p className="text-[#5D4037] m-0">{wrongAnswer}</p>
        </div>
      )}

      {/* Magic words button */}
      {!magicWordsAdded && (
        <button
          onClick={handleAddMagicWords}
          className="w-full p-4 mb-4 rounded-lg border-4 border-dashed border-[#8B5CF6] bg-purple-50 hover:bg-purple-100 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl group-hover:animate-bounce">✨</span>
            <span className="text-lg font-bold text-[#7C3AED]">{t("addMagicWords")}</span>
            <span className="text-2xl group-hover:animate-bounce">✨</span>
          </div>
          <div className="text-[#8B5CF6] font-medium mt-1">"{magicWords}"</div>
        </button>
      )}

      {/* Steps revealed after magic words */}
      {magicWordsAdded && (
        <>
          <div className="bg-purple-50 rounded-lg p-3 mb-4 border-2 border-[#8B5CF6]">
            <div className="flex items-center gap-2">
              <span className="text-xl">✨</span>
              <span className="font-bold text-[#7C3AED]">{t("magicWordsActive")}</span>
            </div>
            <p className="text-[#8B5CF6] m-0">"{magicWords}"</p>
          </div>

          {/* Steps */}
          <div className="space-y-2 mb-4">
            {steps.map((step, index) => {
              const isRevealed = index < revealedSteps;
              return (
                <div
                  key={index}
                  className={cn(
                    "p-3 rounded-lg border-2 transition-all duration-300",
                    isRevealed
                      ? "bg-green-50 border-green-400 animate-in fade-in slide-in-from-left-4"
                      : "bg-gray-100 border-gray-300"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold",
                      isRevealed ? "bg-green-500 text-white" : "bg-gray-300 text-gray-500"
                    )}>
                      {isRevealed ? "✓" : index + 1}
                    </span>
                    <span className={cn(
                      "font-medium",
                      isRevealed ? "text-green-700" : "text-gray-400"
                    )}>
                      {isRevealed ? step : "???"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reveal next step button */}
          {!completed && (
            <button
              onClick={handleRevealNextStep}
              className="w-full p-3 rounded-lg font-bold bg-[#3B82F6] hover:bg-[#2563EB] text-white transition-all"
            >
              {t("nextStep")} ({revealedSteps + 1}/{steps.length})
            </button>
          )}

          {/* Correct answer revealed */}
          {completed && (
            <div className="bg-green-100 rounded-lg p-4 border-2 border-green-500 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">🎉</span>
                <span className="font-bold text-green-700">{t("withMagic")}</span>
              </div>
              <p className="text-green-700 font-medium m-0">{rightAnswer}</p>
              {successMessage && (
                <p className="text-[#5D4037] mt-2 m-0">{successMessage}</p>
              )}
            </div>
          )}
        </>
      )}

      {/* Reset button */}
      {(magicWordsAdded || completed) && (
        <button
          onClick={handleReset}
          className="mt-4 px-6 py-2 rounded-lg font-bold bg-gray-500 hover:bg-gray-600 text-white"
        >
          {t("retry")}
        </button>
      )}
    </div>
  );
}
