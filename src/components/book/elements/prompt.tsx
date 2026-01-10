"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// PromptBreakdown Component
interface PromptPart {
  label: string;
  text: string;
  color?: string;
}

interface PromptBreakdownProps {
  parts: PromptPart[];
}

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  blue: { bg: "bg-blue-100 dark:bg-blue-950/50", border: "border-blue-300 dark:border-blue-700", text: "text-blue-700 dark:text-blue-300" },
  green: { bg: "bg-green-100 dark:bg-green-950/50", border: "border-green-300 dark:border-green-700", text: "text-green-700 dark:text-green-300" },
  purple: { bg: "bg-purple-100 dark:bg-purple-950/50", border: "border-purple-300 dark:border-purple-700", text: "text-purple-700 dark:text-purple-300" },
  amber: { bg: "bg-amber-100 dark:bg-amber-950/50", border: "border-amber-300 dark:border-amber-700", text: "text-amber-700 dark:text-amber-300" },
  pink: { bg: "bg-pink-100 dark:bg-pink-950/50", border: "border-pink-300 dark:border-pink-700", text: "text-pink-700 dark:text-pink-300" },
  cyan: { bg: "bg-cyan-100 dark:bg-cyan-950/50", border: "border-cyan-300 dark:border-cyan-700", text: "text-cyan-700 dark:text-cyan-300" },
};

const defaultColors = ["blue", "green", "purple", "amber", "pink", "cyan"];

export function PromptBreakdown({ parts }: PromptBreakdownProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="my-6 p-4 pt-8 border">
      <div className="flex flex-wrap gap-x-1 gap-y-8 text-sm font-mono leading-relaxed">
        {parts.map((part, index) => {
          const colorKey = part.color || defaultColors[index % defaultColors.length];
          const colors = colorMap[colorKey] || colorMap.blue;
          const isHovered = hoveredIndex === index;
          const isDimmed = hoveredIndex !== null && hoveredIndex !== index;
          
          return (
            <span 
              key={index}
              className={cn(
                "relative inline-block cursor-default transition-opacity",
                isDimmed && "opacity-30"
              )}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <span className={cn(
                "absolute -top-6 left-0 text-[10px] font-sans font-semibold px-1.5 py-0.5 whitespace-nowrap transition-colors rounded",
                colors.text,
                isHovered && colors.bg
              )}>
                {part.label}
              </span>
              <span className={cn(
                "inline-block border-b-2",
                colors.border
              )}>
                {part.text}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// SpecificitySpectrum Component
interface SpectrumLevel {
  level: string;
  text: string;
}

interface SpecificitySpectrumProps {
  levels: SpectrumLevel[];
}

export function SpecificitySpectrum({ levels }: SpecificitySpectrumProps) {
  const [activeLevel, setActiveLevel] = useState(levels.length - 1);
  
  const levelColors = [
    "bg-red-500",
    "bg-orange-500", 
    "bg-amber-500",
    "bg-green-500",
  ];

  return (
    <div className="my-6 p-4 border rounded-lg">
      <div className="flex gap-1 mb-4">
        {levels.map((level, index) => (
          <button
            key={index}
            onClick={() => setActiveLevel(index)}
            className={cn(
              "flex-1 py-2 px-3 text-xs font-semibold transition-all rounded",
              activeLevel === index
                ? `${levelColors[index]} text-white`
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {level.level}
          </button>
        ))}
      </div>
      <div className="relative">
        <div className="h-2 bg-muted rounded-full overflow-hidden mb-4">
          <div 
            className={cn("h-full transition-all", levelColors[activeLevel])}
            style={{ width: `${((activeLevel + 1) / levels.length) * 100}%` }}
          />
        </div>
        <div className="p-3 bg-muted/50 rounded font-mono text-sm">
          {levels[activeLevel].text}
        </div>
      </div>
    </div>
  );
}
