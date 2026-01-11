"use client";

import { useState } from "react";
import { User, HelpCircle, FileText, Settings, Palette, FlaskConical, Target, Check, ListChecks, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { RunPromptButton } from "@/components/prompts/run-prompt-button";

// Framework Demo Component
interface FrameworkStep {
  letter: string;
  label: string;
  description: string;
  icon: LucideIcon;
  color: string;
  example?: string;
}

interface FrameworkDemoProps {
  name: string;
  steps: FrameworkStep[];
  example?: {
    prompt: string;
    description?: string;
  };
}

const frameworkColors: Record<string, { bg: string; border: string; text: string; iconBg: string }> = {
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-300", iconBg: "bg-blue-100 dark:bg-blue-900/50" },
  green: { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", text: "text-green-700 dark:text-green-300", iconBg: "bg-green-100 dark:bg-green-900/50" },
  purple: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", text: "text-purple-700 dark:text-purple-300", iconBg: "bg-purple-100 dark:bg-purple-900/50" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", iconBg: "bg-amber-100 dark:bg-amber-900/50" },
  pink: { bg: "bg-pink-50 dark:bg-pink-950/30", border: "border-pink-200 dark:border-pink-800", text: "text-pink-700 dark:text-pink-300", iconBg: "bg-pink-100 dark:bg-pink-900/50" },
  cyan: { bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200 dark:border-cyan-800", text: "text-cyan-700 dark:text-cyan-300", iconBg: "bg-cyan-100 dark:bg-cyan-900/50" },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-800", text: "text-indigo-700 dark:text-indigo-300", iconBg: "bg-indigo-100 dark:bg-indigo-900/50" },
  rose: { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-300", iconBg: "bg-rose-100 dark:bg-rose-900/50" },
};

export function FrameworkDemo({ name, steps, example }: FrameworkDemoProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const renderHighlightedPrompt = (prompt: string) => {
    if (hoveredStep === null) {
      return <span>{prompt}</span>;
    }
    
    const step = steps[hoveredStep];
    if (!step?.example) return <span>{prompt}</span>;
    
    const colors = frameworkColors[step.color] || frameworkColors.blue;
    const parts = prompt.split(new RegExp(`(${step.example.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\.\\.\\./, '.*?')})`, 'i'));
    
    return parts.map((part, i) => {
      const isMatch = i % 2 === 1;
      return isMatch ? (
        <mark key={i} className={cn("rounded", colors.bg)}>{part}</mark>
      ) : (
        <span key={i} className="opacity-40">{part}</span>
      );
    });
  };

  return (
    <div className="my-6 border rounded-lg overflow-hidden">
      <div className="px-4 py-3 bg-muted/50 border-b">
        <h4 className="font-semibold mt-2">{name}</h4>
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {steps.map((step, index) => {
            const colors = frameworkColors[step.color] || frameworkColors.blue;
            const Icon = step.icon;
            const isHovered = hoveredStep === index;
            
            return (
              <div
                key={index}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-lg border cursor-default transition-all",
                  isHovered ? colors.bg : "bg-muted/30",
                  isHovered ? colors.border : "border-transparent"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded flex items-center justify-center shrink-0",
                  colors.iconBg
                )}>
                  <Icon className={cn("h-3.5 w-3.5", colors.text)} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={cn("font-bold", colors.text)}>{step.letter}</span>
                  <span className="text-sm">{step.label}</span>
                </div>
              </div>
            );
          })}
        </div>
        {example && (
          <div className="relative">
            <pre className="p-3 bg-muted/30 rounded-lg text-sm whitespace-pre-wrap font-mono">
              {renderHighlightedPrompt(example.prompt)}
            </pre>
            <div className="absolute top-2 right-2">
              <RunPromptButton
                content={example.prompt}
                title={name}
                variant="ghost"
                size="icon"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Pre-defined framework configurations
export function CRISPEFramework() {
  return (
    <FrameworkDemo
      name="The CRISPE Framework"
      steps={[
        { letter: "C", label: "Capacity/Role", description: "What role should the AI take on?", icon: User, color: "blue", example: "You are a senior marketing consultant with 15 years of experience in beauty brands." },
        { letter: "R", label: "Request", description: "What do you want the AI to do?", icon: HelpCircle, color: "green", example: "Create a social media content calendar for next month." },
        { letter: "I", label: "Information", description: "What background info does the AI need?", icon: FileText, color: "purple", example: "Background: We sell organic skincare products to women aged 25-40. Our brand voice is friendly and educational." },
        { letter: "S", label: "Situation", description: "What circumstances apply?", icon: Settings, color: "amber", example: "Situation: We're launching a new vitamin C serum on the 15th." },
        { letter: "P", label: "Persona", description: "What style should responses have?", icon: Palette, color: "pink", example: "Style: Casual, emoji-friendly, with a focus on education over selling." },
        { letter: "E", label: "Experiment", description: "What examples clarify your intent?", icon: FlaskConical, color: "cyan", example: "Example post style: \"Did you know vitamin C is a skincare superhero? 🦸‍♀️ Here's why your skin will thank you...\"" },
      ]}
      example={{
        prompt: `You are a senior marketing consultant with 15 years of experience in beauty brands.

Create a social media content calendar for next month.

Background: We sell organic skincare products to women aged 25-40. Our brand voice is friendly and educational.

Situation: We're launching a new vitamin C serum on the 15th.

Style: Casual, emoji-friendly, with a focus on education over selling.

Example post style: "Did you know vitamin C is a skincare superhero? 🦸‍♀️ Here's why your skin will thank you..."

Create a week-by-week content plan with 3 posts per week.`,
        description: "Hover over each letter to see that part highlighted:"
      }}
    />
  );
}

export function BREAKFramework() {
  return (
    <FrameworkDemo
      name="The BREAK Framework"
      steps={[
        { letter: "B", label: "Begin", description: "Restate the problem in your own words", icon: FileText, color: "blue", example: "B - Begin by restating the problem" },
        { letter: "R", label: "Reason", description: "Think about what approach to use", icon: HelpCircle, color: "green", example: "R - Reason about what approach to use" },
        { letter: "E", label: "Execute", description: "Work through the solution step by step", icon: Settings, color: "purple", example: "E - Execute the solution step by step" },
        { letter: "A", label: "Answer", description: "State the final answer clearly", icon: Target, color: "amber", example: "A - Answer clearly" },
        { letter: "K", label: "Know", description: "Verify by checking your work", icon: Check, color: "cyan", example: "K - Know by verifying/checking" },
      ]}
      example={{
        prompt: `Solve this problem using BREAK:

B - Begin by restating the problem
R - Reason about what approach to use
E - Execute the solution step by step
A - Answer clearly
K - Know by verifying/checking

Problem: A rectangle's length is twice its width. If the perimeter is 36 cm, what is the area?`,
        description: "Hover over each letter to see that part highlighted:"
      }}
    />
  );
}

export function RTFFramework() {
  return (
    <FrameworkDemo
      name="The RTF Framework"
      steps={[
        { letter: "R", label: "Role", description: "Who should the AI be?", icon: User, color: "blue", example: "Role: You are a patient math tutor who specializes in making concepts easy for beginners." },
        { letter: "T", label: "Task", description: "What should the AI do?", icon: ListChecks, color: "green", example: "Task: Explain what fractions are and how to add them together." },
        { letter: "F", label: "Format", description: "How should the output look?", icon: FileText, color: "purple", example: "Format:" },
      ]}
      example={{
        prompt: `Role: You are a patient math tutor who specializes in making concepts easy for beginners.

Task: Explain what fractions are and how to add them together.

Format: 
- Start with a real-world example
- Use simple language (no jargon)
- Show 3 practice problems with answers
- Keep it under 300 words`,
        description: "Hover over each letter to see that part highlighted:"
      }}
    />
  );
}
