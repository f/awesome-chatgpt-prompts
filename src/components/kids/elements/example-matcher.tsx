"use client";

import { useState, useEffect, useId } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useLevelSlug, useSectionNavigation } from "@/components/kids/providers/level-context";
import { getComponentState, saveComponentState, markSectionCompleted } from "@/lib/kids/progress";

interface Example {
  input: string;
  output: string;
}

interface ExampleMatcherProps {
  title?: string;
  instruction?: string;
  examples: Example[];
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface SavedState {
  selectedAnswer: string | null;
  submitted: boolean;
}

export function ExampleMatcher({
  title,
  instruction,
  examples,
  question,
  options,
  correctAnswer,
  explanation,
}: ExampleMatcherProps) {
  const t = useTranslations("kids.exampleMatcher");
  const levelSlug = useLevelSlug();
  const { currentSection, markSectionComplete, registerSectionRequirement } = useSectionNavigation();
  const componentId = useId();
  
  // Register that this section has an interactive element requiring completion
  useEffect(() => {
    registerSectionRequirement(currentSection);
  }, [currentSection, registerSectionRequirement]);
  
  const displayTitle = title || t("title");
  const displayInstruction = instruction || t("instruction");

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved state
  useEffect(() => {
    if (!levelSlug) {
      setIsLoaded(true);
      return;
    }
    const saved = getComponentState<SavedState>(levelSlug, componentId);
    if (saved) {
      setSelectedAnswer(saved.selectedAnswer);
      setSubmitted(saved.submitted);
    }
    setIsLoaded(true);
  }, [levelSlug, componentId]);

  // Save state
  useEffect(() => {
    if (!levelSlug || !isLoaded) return;
    saveComponentState<SavedState>(levelSlug, componentId, {
      selectedAnswer,
      submitted,
    });
  }, [levelSlug, componentId, selectedAnswer, submitted, isLoaded]);

  if (!isLoaded) return null;

  const isCorrect = selectedAnswer === correctAnswer;

  const handleSelect = (option: string) => {
    if (submitted) return;
    setSelectedAnswer(option);
  };

  const handleSubmit = () => {
    if (!selectedAnswer) return;
    setSubmitted(true);
    // Mark section as complete if correct answer
    if (selectedAnswer === correctAnswer && levelSlug) {
      markSectionCompleted(levelSlug, currentSection);
      markSectionComplete(currentSection);
    }
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setSubmitted(false);
  };

  return (
    <div className="my-4 p-4 bg-gradient-to-br from-[#E0E7FF] to-[#C7D2FE] border-4 border-[#6366F1] rounded-xl">
      {/* Title */}
      <h3 className="text-xl font-bold text-[#4338CA] mb-2 flex items-center gap-2">
        🧩 {displayTitle}
      </h3>
      <p className="text-[#5D4037] mb-4 m-0">{displayInstruction}</p>

      {/* Examples Pattern */}
      <div className="bg-white/80 rounded-lg p-4 mb-4 border-2 border-[#6366F1]">
        <div className="text-sm font-medium text-[#4338CA] mb-2">{t("pattern")}</div>
        <div className="space-y-2">
          {examples.map((example, index) => (
            <div key={index} className="flex items-center gap-3 text-lg">
              <span className="px-3 py-1 bg-[#E0E7FF] rounded-lg font-medium">{example.input}</span>
              <span className="text-[#6366F1] font-bold">→</span>
              <span className="px-3 py-1 bg-[#C7D2FE] rounded-lg font-medium">{example.output}</span>
            </div>
          ))}
          {/* Question row */}
          <div className="flex items-center gap-3 text-lg pt-2 border-t-2 border-dashed border-[#6366F1]">
            <span className="px-3 py-1 bg-[#FEF3C7] border-2 border-[#F59E0B] rounded-lg font-medium">
              {question}
            </span>
            <span className="text-[#6366F1] font-bold">→</span>
            <span className="px-3 py-1 bg-gray-100 rounded-lg font-medium text-gray-400">
              {submitted ? (isCorrect ? selectedAnswer : `${selectedAnswer} ❌`) : "???"}
            </span>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {options.map((option) => {
          const isSelected = selectedAnswer === option;
          const showCorrect = submitted && option === correctAnswer;
          const showWrong = submitted && isSelected && !isCorrect;

          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={submitted}
              className={cn(
                "px-4 py-3 rounded-lg border-2 text-xl font-bold transition-all",
                !submitted && !isSelected && "bg-white border-gray-300 hover:border-[#6366F1] hover:bg-[#E0E7FF]",
                !submitted && isSelected && "bg-[#C7D2FE] border-[#6366F1] scale-105",
                showCorrect && "bg-green-100 border-green-500 text-green-700",
                showWrong && "bg-red-100 border-red-400 text-red-600",
                submitted && !showCorrect && !showWrong && "opacity-50"
              )}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Submit/Reset buttons */}
      <div className="flex gap-2">
        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={!selectedAnswer}
            className={cn(
              "px-6 py-2 rounded-lg font-bold text-white transition-all",
              selectedAnswer
                ? "bg-[#6366F1] hover:bg-[#4F46E5]"
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            {t("check")}
          </button>
        ) : !isCorrect ? (
          <button
            onClick={handleReset}
            className="px-6 py-2 rounded-lg font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white"
          >
            {t("retry")}
          </button>
        ) : null}
      </div>

      {/* Result feedback */}
      {submitted && (
        <div className={cn(
          "mt-4 p-4 rounded-lg border-2 animate-in fade-in zoom-in-95 duration-300",
          isCorrect
            ? "bg-green-100 border-green-500"
            : "bg-amber-100 border-amber-500"
        )}>
          <p className={cn(
            "font-bold text-lg m-0",
            isCorrect ? "text-green-700" : "text-amber-700"
          )}>
            {isCorrect ? t("correct") : t("tryAgain")}
          </p>
          {explanation && (
            <p className="text-[#5D4037] mt-2 m-0">{explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}
