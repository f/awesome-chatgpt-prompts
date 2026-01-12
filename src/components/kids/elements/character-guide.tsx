"use client";

import { cn } from "@/lib/utils";

type PromiMood = "happy" | "thinking" | "excited" | "confused" | "celebrating";

interface PromiCharacterProps {
  mood?: PromiMood;
  size?: "sm" | "md" | "lg";
  className?: string;
  animate?: boolean;
}

const moodEmojis: Record<PromiMood, string> = {
  happy: "😊",
  thinking: "🤔",
  excited: "🤩",
  confused: "😵‍💫",
  celebrating: "🎉",
};

const sizeClasses = {
  sm: "w-12 h-12 text-2xl",
  md: "w-20 h-20 text-4xl",
  lg: "w-28 h-28 text-5xl",
};

export function PromiCharacter({ 
  mood = "happy", 
  size = "md",
  className,
  animate = true 
}: PromiCharacterProps) {
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 border-4 border-primary/30",
        sizeClasses[size],
        animate && "animate-float",
        className
      )}
    >
      {/* Robot face */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="relative">
          🤖
          {/* Mood indicator */}
          <span className="absolute -bottom-1 -right-1 text-lg">
            {moodEmojis[mood]}
          </span>
        </span>
      </div>
    </div>
  );
}

interface SpeechBubbleProps {
  children: React.ReactNode;
  direction?: "left" | "right" | "bottom";
  className?: string;
}

export function SpeechBubble({ 
  children, 
  direction = "right",
  className 
}: SpeechBubbleProps) {
  return (
    <div 
      className={cn(
        "relative p-4 bg-white dark:bg-card rounded-2xl shadow-lg border-2 border-primary/20",
        className
      )}
    >
      {children}
      {/* Speech bubble tail */}
      <div 
        className={cn(
          "absolute w-4 h-4 bg-white dark:bg-card border-2 border-primary/20 rotate-45",
          direction === "left" && "-left-2 top-1/2 -translate-y-1/2 border-r-0 border-t-0",
          direction === "right" && "-right-2 top-1/2 -translate-y-1/2 border-l-0 border-b-0",
          direction === "bottom" && "left-1/2 -bottom-2 -translate-x-1/2 border-l-0 border-t-0"
        )}
      />
    </div>
  );
}

interface PromiWithMessageProps {
  message: string;
  mood?: PromiMood;
  promiPosition?: "left" | "right";
}

export function PromiWithMessage({ 
  message, 
  mood = "happy",
  promiPosition = "left" 
}: PromiWithMessageProps) {
  return (
    <div className={cn(
      "flex items-start gap-4 my-6",
      promiPosition === "right" && "flex-row-reverse"
    )}>
      <PromiCharacter mood={mood} size="md" />
      <SpeechBubble 
        direction={promiPosition === "left" ? "left" : "right"}
        className="flex-1"
      >
        <p className="text-base leading-relaxed m-0">{message}</p>
      </SpeechBubble>
    </div>
  );
}
