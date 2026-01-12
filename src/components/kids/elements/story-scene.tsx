"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PromiCharacter } from "./character-guide";

type PromiMood = "happy" | "thinking" | "excited" | "confused" | "celebrating";

interface StoryPanel {
  character?: "promi" | "none";
  mood?: PromiMood;
  text: string;
  highlight?: boolean;
}

interface StorySceneProps {
  panels: StoryPanel[];
  className?: string;
}

export function StoryScene({ panels, className }: StorySceneProps) {
  const [currentPanel, setCurrentPanel] = useState(0);
  const panel = panels[currentPanel];
  const isFirst = currentPanel === 0;
  const isLast = currentPanel === panels.length - 1;

  return (
    <div className={cn("my-6 rounded-2xl border-2 border-primary/20 overflow-hidden", className)}>
      {/* Story panel */}
      <div className="p-6 bg-gradient-to-br from-primary/5 to-purple-500/5 min-h-[200px] flex items-center">
        <div className="flex items-start gap-4 w-full">
          {panel.character === "promi" && (
            <div className="shrink-0">
              <PromiCharacter mood={panel.mood || "happy"} size="md" />
            </div>
          )}
          <div 
            className={cn(
              "flex-1 p-4 bg-white dark:bg-card rounded-xl shadow-md",
              panel.highlight && "ring-2 ring-primary ring-offset-2"
            )}
          >
            <p className="text-lg leading-relaxed m-0">{panel.text}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      {panels.length > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPanel((p) => p - 1)}
            disabled={isFirst}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>

          {/* Progress dots */}
          <div className="flex items-center gap-1.5">
            {panels.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPanel(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  i === currentPanel 
                    ? "bg-primary" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPanel((p) => p + 1)}
            disabled={isLast}
            className="gap-1"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

interface SinglePanelProps {
  character?: "promi" | "none";
  mood?: PromiMood;
  children: React.ReactNode;
  highlight?: boolean;
}

export function Panel({ character = "promi", mood = "happy", children, highlight }: SinglePanelProps) {
  return (
    <div className="my-6 rounded-2xl border-2 border-primary/20 overflow-hidden">
      <div className="p-6 bg-gradient-to-br from-primary/5 to-purple-500/5">
        <div className="flex items-start gap-4">
          {character === "promi" && (
            <div className="shrink-0">
              <PromiCharacter mood={mood} size="md" />
            </div>
          )}
          <div 
            className={cn(
              "flex-1 p-4 bg-white dark:bg-card rounded-xl shadow-md",
              highlight && "ring-2 ring-primary ring-offset-2"
            )}
          >
            <div className="text-lg leading-relaxed">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
