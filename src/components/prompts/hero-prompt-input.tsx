"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Bot, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const TYPING_SPEED = 50; // ms per character
const PAUSE_BETWEEN_PROMPTS = 2000; // ms to pause after completing a prompt
const DELETE_SPEED = 30; // ms per character when deleting

export function HeroPromptInput() {
  const t = useTranslations("heroPromptInput");
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const examplePrompts = useMemo(() => [
    t("examples.codeReview"),
    t("examples.emailWriter"),
    t("examples.studyPlanner"),
    t("examples.recipeGenerator"),
    t("examples.interviewCoach"),
  ], [t]);
  
  const [displayText, setDisplayText] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  const clearAnimation = useCallback(() => {
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Typing animation effect
  useEffect(() => {
    if (!isAnimating || isFocused) {
      clearAnimation();
      return;
    }

    const currentPrompt = examplePrompts[currentPromptIndex];

    if (isDeleting) {
      if (displayText.length > 0) {
        animationRef.current = setTimeout(() => {
          setDisplayText((prev) => prev.slice(0, -1));
        }, DELETE_SPEED);
      } else {
        setIsDeleting(false);
        setCurrentPromptIndex((prev) => (prev + 1) % examplePrompts.length);
      }
    } else {
      if (displayText.length < currentPrompt.length) {
        animationRef.current = setTimeout(() => {
          setDisplayText(currentPrompt.slice(0, displayText.length + 1));
        }, TYPING_SPEED);
      } else {
        // Finished typing, wait then start deleting
        animationRef.current = setTimeout(() => {
          setIsDeleting(true);
        }, PAUSE_BETWEEN_PROMPTS);
      }
    }

    return clearAnimation;
  }, [displayText, isAnimating, isFocused, currentPromptIndex, isDeleting, clearAnimation, examplePrompts]);

  const handleFocus = () => {
    setIsFocused(true);
    setIsAnimating(false);
    clearAnimation();
    // Transfer the animated text to the actual input value
    setInputValue(displayText);
    setDisplayText("");
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Only restart animation if input is empty
    if (!inputValue.trim()) {
      setIsAnimating(true);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const value = inputValue.trim();
    if (value) {
      router.push(`/prompts/new?prompt=${encodeURIComponent(value)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleAnimatedTextClick = () => {
    // Stop animation, clear input, and focus for user to type
    setIsFocused(true);
    setIsAnimating(false);
    clearAnimation();
    setInputValue("");
    setDisplayText("");
    // Focus the textarea
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <div
        className={cn(
          "rounded-xl bg-muted/50 border px-4 py-3 backdrop-blur-sm transition-all duration-200 shadow-sm",
          isFocused && "border-foreground/30 ring-1 ring-ring"
        )}
      >
        {/* Textarea area with animated text overlay */}
        <div className="relative min-h-[44px]">
          {/* Animated placeholder text - clickable to redirect */}
          {!isFocused && isAnimating && (
            <button
              type="button"
              onClick={handleAnimatedTextClick}
              className="absolute inset-0 flex items-start text-left cursor-pointer hover:opacity-80 transition-opacity"
            >
              <span className="text-base text-muted-foreground">
                {displayText}
                <span className="inline-block w-0.5 h-5 bg-primary ml-0.5 animate-pulse align-middle" />
              </span>
            </button>
          )}
          
          {/* Actual textarea */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={isFocused ? t("placeholder") : ""}
            className={cn(
              "min-h-[44px] max-h-[100px] w-full resize-none text-base bg-transparent border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 outline-none placeholder:text-muted-foreground",
              !isFocused && isAnimating && "text-transparent caret-transparent pointer-events-none"
            )}
            aria-label={t("ariaLabel")}
          />
        </div>

        {/* Bottom row: Bot icon + model name + submit button */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Bot className="h-3 w-3" />
            <span>{t("modelName")}</span>
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={!inputValue.trim()}
            className="h-7 w-7 rounded-full"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground mt-3 text-center">
        {t("hint")}
      </p>
    </form>
  );
}
