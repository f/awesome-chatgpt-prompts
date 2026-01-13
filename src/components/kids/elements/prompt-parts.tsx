"use client";

import { useState, useEffect, useId } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useLevelSlug, useSectionNavigation } from "@/components/kids/providers/level-context";
import { getComponentState, saveComponentState, markSectionCompleted } from "@/lib/kids/progress";

type PartType = "role" | "task" | "context" | "constraint";

interface PromptPart {
  text: string;
  type: PartType;
}

interface PromptPartsProps {
  title?: string;
  instruction?: string;
  parts: PromptPart[];
  successMessage?: string;
}

interface SavedState {
  assignments: Record<number, PartType | null>;
  completed: boolean;
}

const partColors: Record<PartType, { bg: string; border: string; text: string; emoji: string }> = {
  role: { bg: "bg-purple-100", border: "border-purple-400", text: "text-purple-700", emoji: "🎭" },
  task: { bg: "bg-blue-100", border: "border-blue-400", text: "text-blue-700", emoji: "✏️" },
  context: { bg: "bg-green-100", border: "border-green-400", text: "text-green-700", emoji: "📖" },
  constraint: { bg: "bg-orange-100", border: "border-orange-400", text: "text-orange-700", emoji: "📏" },
};

export function PromptParts({ title, instruction, parts, successMessage }: PromptPartsProps) {
  const t = useTranslations("kids.promptParts");
  const levelSlug = useLevelSlug();
  const { currentSection, markSectionComplete, registerSectionRequirement } = useSectionNavigation();
  const componentId = useId();
  
  // Register that this section has an interactive element requiring completion
  useEffect(() => {
    registerSectionRequirement(currentSection);
  }, [currentSection, registerSectionRequirement]);
  
  const displayTitle = title || t("title");
  const displayInstruction = instruction || t("instruction");

  const [assignments, setAssignments] = useState<Record<number, PartType | null>>({});
  const [selectedPart, setSelectedPart] = useState<number | null>(null);
  const [completed, setCompleted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved state
  useEffect(() => {
    if (!levelSlug) {
      setIsLoaded(true);
      return;
    }
    const saved = getComponentState<SavedState>(levelSlug, componentId);
    if (saved) {
      setAssignments(saved.assignments || {});
      setCompleted(saved.completed || false);
    }
    setIsLoaded(true);
  }, [levelSlug, componentId]);

  // Save state
  useEffect(() => {
    if (!levelSlug || !isLoaded) return;
    saveComponentState<SavedState>(levelSlug, componentId, {
      assignments,
      completed,
    });
  }, [levelSlug, componentId, assignments, completed, isLoaded]);

  if (!isLoaded) return null;

  // Check if all parts are correctly assigned
  const checkCompletion = (newAssignments: Record<number, PartType | null>) => {
    const allAssigned = parts.every((_, index) => newAssignments[index] !== undefined && newAssignments[index] !== null);
    const allCorrect = parts.every((part, index) => newAssignments[index] === part.type);
    if (allAssigned && allCorrect) {
      setCompleted(true);
      // Mark section as complete
      if (levelSlug) {
        markSectionCompleted(levelSlug, currentSection);
        markSectionComplete(currentSection);
      }
    }
  };

  const handlePartClick = (index: number) => {
    if (completed) return;
    setSelectedPart(selectedPart === index ? null : index);
  };

  const handleCategoryClick = (category: PartType) => {
    if (completed || selectedPart === null) return;
    
    const newAssignments = { ...assignments, [selectedPart]: category };
    setAssignments(newAssignments);
    setSelectedPart(null);
    checkCompletion(newAssignments);
  };

  const handleReset = () => {
    setAssignments({});
    setCompleted(false);
    setSelectedPart(null);
  };

  const getAssignmentStatus = (index: number): "correct" | "wrong" | "pending" | null => {
    const assigned = assignments[index];
    if (assigned === undefined || assigned === null) return null;
    return assigned === parts[index].type ? "correct" : "wrong";
  };

  const score = parts.filter((part, index) => assignments[index] === part.type).length;

  return (
    <div className="my-4 p-4 bg-gradient-to-br from-[#FEF3C7] to-[#FDE68A] border-4 border-[#D97706] rounded-xl">
      {/* Title */}
      <h3 className="text-xl font-bold text-[#92400E] mb-2 flex items-center gap-2">
        🧩 {displayTitle}
      </h3>
      <p className="text-[#92400E] mb-4 m-0">{displayInstruction}</p>

      {/* Score */}
      <div className="mb-4 text-sm font-medium text-[#92400E]">
        {t("score")}: {score}/{parts.length}
      </div>

      {/* Prompt pieces to categorize */}
      <div className="bg-white/80 rounded-lg p-4 mb-4 border-2 border-[#D97706]">
        <div className="flex flex-wrap gap-2">
          {parts.map((part, index) => {
            const status = getAssignmentStatus(index);
            const isSelected = selectedPart === index;
            const assigned = assignments[index];
            const colors = assigned ? partColors[assigned] : null;

            return (
              <button
                key={index}
                onClick={() => handlePartClick(index)}
                disabled={completed}
                className={cn(
                  "px-3 py-2 rounded-lg border-2 transition-all text-base font-medium",
                  !assigned && !isSelected && "bg-gray-100 border-gray-300 text-gray-700 hover:border-[#D97706]",
                  !assigned && isSelected && "bg-yellow-100 border-[#D97706] text-[#92400E] ring-2 ring-[#D97706] scale-105",
                  assigned && colors && `${colors.bg} ${colors.border} ${colors.text}`,
                  status === "correct" && "ring-2 ring-green-500",
                  status === "wrong" && "ring-2 ring-red-400",
                  !completed && "cursor-pointer"
                )}
              >
                {status === "correct" && <span className="mr-1">✓</span>}
                {status === "wrong" && <span className="mr-1">✗</span>}
                {part.text}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category buttons */}
      {selectedPart !== null && !completed && (
        <div className="mb-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="text-sm font-medium text-[#92400E] mb-2">{t("pickCategory")}</div>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(partColors) as PartType[]).map((type) => {
              const colors = partColors[type];
              return (
                <button
                  key={type}
                  onClick={() => handleCategoryClick(type)}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-bold transition-all",
                    colors.bg,
                    colors.border,
                    colors.text,
                    "hover:scale-105 cursor-pointer"
                  )}
                >
                  <span className="text-xl">{colors.emoji}</span>
                  <span>{t(`types.${type}`)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Success message */}
      {completed && (
        <div className="p-4 bg-green-100 border-2 border-green-500 rounded-lg mb-4 animate-in fade-in zoom-in-95 duration-300">
          <p className="font-bold text-green-700 text-lg m-0">
            🎉 {successMessage || t("success")}
          </p>
        </div>
      )}

      {/* Reset button */}
      {(Object.keys(assignments).length > 0 || completed) && (
        <button
          onClick={handleReset}
          className="px-6 py-2 rounded-lg font-bold bg-[#D97706] hover:bg-[#B45309] text-white"
        >
          {t("retry")}
        </button>
      )}
    </div>
  );
}
