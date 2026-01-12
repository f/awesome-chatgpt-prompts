"use client";

import { useState, useEffect, useId } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useLevelSlug } from "@/components/kids/providers/level-context";
import { getComponentState, saveComponentState } from "@/lib/kids/progress";

interface WordPredictorProps {
  title?: string;
  instruction?: string;
  sentence: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  aiThinking?: string;
  successMessage?: string;
}

interface SavedState {
  selectedAnswer: string | null;
  submitted: boolean;
}

export function WordPredictor({
  title,
  instruction,
  sentence,
  options,
  correctAnswer,
  explanation,
  aiThinking,
  successMessage,
}: WordPredictorProps) {
  const t = useTranslations("kids.wordPredictor");
  const levelSlug = useLevelSlug();
  const componentId = useId();

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
    if (saved && typeof saved.submitted === "boolean") {
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
  };

  const handleReset = () => {
    setSelectedAnswer(null);
    setSubmitted(false);
  };

  // Render sentence with blank
  const renderSentence = () => {
    const parts = sentence.split("___");
    return (
      <span>
        {parts[0]}
        <span className={cn(
          "inline-block min-w-[80px] px-3 py-1 mx-1 rounded-lg border-2 border-dashed text-center font-bold",
          !submitted && "bg-yellow-100 border-yellow-500 text-yellow-700",
          submitted && isCorrect && "bg-green-100 border-green-500 text-green-700 border-solid",
          submitted && !isCorrect && "bg-red-100 border-red-400 text-red-600 border-solid"
        )}>
          {selectedAnswer || "???"}
        </span>
        {parts[1]}
      </span>
    );
  };

  return (
    <div className="my-4 p-4 bg-gradient-to-br from-[#E0E7FF] to-[#C7D2FE] border-4 border-[#6366F1] rounded-xl">
      {/* Title */}
      <h3 className="text-xl font-bold text-[#4338CA] mb-2 flex items-center gap-2">
        🧠 {displayTitle}
      </h3>
      <p className="text-[#5D4037] mb-4 m-0">{displayInstruction}</p>

      {/* AI Brain visualization */}
      <div className="bg-white/80 rounded-lg p-4 mb-4 border-2 border-[#6366F1]">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🤖</span>
          <span className="font-medium text-[#4338CA]">{t("aiThinks")}</span>
        </div>
        <p className="text-lg text-[#2C1810] m-0">
          {renderSentence()}
        </p>
      </div>

      {/* Thinking bubble */}
      {!submitted && (
        <div className="bg-[#F0F9FF] rounded-lg p-3 mb-4 border-2 border-[#0EA5E9] italic text-[#0369A1]">
          💭 {aiThinking || t("thinkingDefault")}
        </div>
      )}

      {/* Options */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const showCorrect = submitted && option === correctAnswer;
          const showWrong = submitted && isSelected && !isCorrect;

          return (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              disabled={submitted}
              className={cn(
                "p-3 rounded-lg border-2 font-bold text-lg transition-all",
                !submitted && !isSelected && "bg-white border-[#6366F1] text-[#4338CA] hover:bg-indigo-50 cursor-pointer",
                !submitted && isSelected && "bg-indigo-100 border-[#4338CA] text-[#4338CA] ring-2 ring-[#4338CA] scale-105",
                showCorrect && "bg-green-100 border-green-500 text-green-700",
                showWrong && "bg-red-100 border-red-400 text-red-600"
              )}
            >
              {showCorrect && "✓ "}
              {showWrong && "✗ "}
              {option}
            </button>
          );
        })}
      </div>

      {/* Submit button */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!selectedAnswer}
          className={cn(
            "w-full py-3 rounded-lg font-bold text-lg transition-all",
            selectedAnswer
              ? "bg-[#6366F1] hover:bg-[#4F46E5] text-white cursor-pointer"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          )}
        >
          {t("check")}
        </button>
      )}

      {/* Result */}
      {submitted && (
        <div className={cn(
          "p-4 rounded-lg border-2 mb-4 animate-in fade-in zoom-in-95 duration-300",
          isCorrect ? "bg-green-100 border-green-500" : "bg-orange-100 border-orange-400"
        )}>
          <p className={cn(
            "font-bold text-lg mb-2 m-0",
            isCorrect ? "text-green-700" : "text-orange-700"
          )}>
            {isCorrect ? `🎉 ${successMessage || t("correct")}` : `🤔 ${t("tryAgain")}`}
          </p>
          <p className="text-[#5D4037] m-0">{explanation}</p>
        </div>
      )}

      {/* Reset button */}
      {submitted && (
        <button
          onClick={handleReset}
          className="px-6 py-2 rounded-lg font-bold bg-[#6366F1] hover:bg-[#4F46E5] text-white"
        >
          {t("retry")}
        </button>
      )}
    </div>
  );
}
