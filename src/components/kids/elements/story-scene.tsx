"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { PixelRobot } from "./pixel-art";

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
    <div className={cn("my-6 pixel-panel overflow-hidden", className)}>
      {/* Story panel */}
      <div className="p-4 min-h-[180px] flex items-center">
        <div className="flex items-start gap-4 w-full">
          {panel.character === "promi" && (
            <div className="shrink-0">
              <PixelRobot className="w-12 h-16" mood={panel.mood} />
            </div>
          )}
          <div 
            className={cn(
              "flex-1 p-4 bg-white/80 border-2 border-[#D97706]",
              panel.highlight && "bg-[#FEF3C7]"
            )}
            style={{ clipPath: "polygon(4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px), 0 4px)" }}
          >
            <p className="text-xl leading-relaxed m-0 text-[#2C1810]">{panel.text}</p>
          </div>
        </div>
      </div>

      {/* Navigation - pixel style */}
      {panels.length > 1 && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#4A3728] border-t-2 border-[#8B4513]">
          <button
            onClick={() => setCurrentPanel((p) => p - 1)}
            disabled={isFirst}
            className={cn("pixel-btn px-3 py-1 text-xs", isFirst && "opacity-40")}
          >
            Back
          </button>

          {/* Progress dots - pixel style */}
          <div className="flex items-center gap-1.5">
            {panels.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPanel(i)}
                className={cn(
                  "w-3 h-3 border-2",
                  i === currentPanel 
                    ? "bg-[#22C55E] border-[#16A34A]" 
                    : "bg-[#4A3728] border-[#8B4513] hover:bg-[#5D4037]"
                )}
                style={{ clipPath: "polygon(2px 0, calc(100% - 2px) 0, 100% 2px, 100% calc(100% - 2px), calc(100% - 2px) 100%, 2px 100%, 0 calc(100% - 2px), 0 2px)" }}
              />
            ))}
          </div>

          <button
            onClick={() => setCurrentPanel((p) => p + 1)}
            disabled={isLast}
            className={cn("pixel-btn pixel-btn-green px-3 py-1 text-xs", isLast && "opacity-40")}
          >
            Next
          </button>
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
    <div className="my-6 pixel-panel">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {character === "promi" && (
            <div className="shrink-0">
              <PixelRobot className="w-12 h-16" mood={mood} />
            </div>
          )}
          <div 
            className={cn(
              "flex-1 p-4 bg-white/80 border-2 border-[#D97706]",
              highlight && "bg-[#FEF3C7]"
            )}
            style={{ clipPath: "polygon(4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px), 0 4px)" }}
          >
            <div className="text-xl leading-relaxed text-[#2C1810]">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
