"use client";

import { Gem, Target, Crown, Compass, RefreshCw, Sparkles, Ruler, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const principles = [
  { icon: Gem, title: "Clarity Over Cleverness", description: "Be explicit and unambiguous", color: "blue" },
  { icon: Target, title: "Specificity Yields Quality", description: "Details improve outputs", color: "green" },
  { icon: Crown, title: "Context Is King", description: "Include all relevant information", color: "purple" },
  { icon: Compass, title: "Guide, Don't Just Ask", description: "Structure the reasoning process", color: "amber" },
  { icon: RefreshCw, title: "Iterate and Refine", description: "Improve through successive attempts", color: "pink" },
  { icon: Sparkles, title: "Leverage Strengths", description: "Work with model training", color: "cyan" },
  { icon: Ruler, title: "Control Structure", description: "Request specific formats", color: "indigo" },
  { icon: CheckCircle, title: "Verify and Validate", description: "Check outputs for accuracy", color: "rose" },
] as const;

const principleColors: Record<string, { bg: string; border: string; icon: string }> = {
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", icon: "text-blue-600 dark:text-blue-400" },
  green: { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", icon: "text-green-600 dark:text-green-400" },
  purple: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", icon: "text-purple-600 dark:text-purple-400" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", icon: "text-amber-600 dark:text-amber-400" },
  pink: { bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-200 dark:border-pink-800", icon: "text-pink-600 dark:text-pink-400" },
  cyan: { bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200 dark:border-cyan-800", icon: "text-cyan-600 dark:text-cyan-400" },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-800", icon: "text-indigo-600 dark:text-indigo-400" },
  rose: { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800", icon: "text-rose-600 dark:text-rose-400" },
};

export function PrinciplesSummary() {
  return (
    <div className="my-6 grid gap-2">
      {principles.map((principle, index) => {
        const colors = principleColors[principle.color];
        const Icon = principle.icon;
        return (
          <div
            key={index}
            className={cn("flex items-center gap-3 p-3 rounded-lg border", colors.bg, colors.border)}
          >
            <Icon className={cn("h-5 w-5 shrink-0", colors.icon)} />
            <div>
              <span className="font-semibold">{principle.title}</span>
              <span className="text-muted-foreground"> — {principle.description}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
