"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Star, ArrowRight, Map, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { completeLevel, getLevelProgress } from "@/lib/kids/progress";
import { getAdjacentLevels } from "@/lib/kids/levels";
import { PromiCharacter } from "./character-guide";

interface LevelCompleteProps {
  levelSlug: string;
  stars?: number; // 1-3, calculated based on performance
  message?: string;
}

export function LevelComplete({ 
  levelSlug, 
  stars = 3,
  message = "You did it!"
}: LevelCompleteProps) {
  const t = useTranslations("kids");
  const [showConfetti, setShowConfetti] = useState(false);
  const [savedStars, setSavedStars] = useState(0);
  const { next } = getAdjacentLevels(levelSlug);

  useEffect(() => {
    // Check if already completed with higher stars
    const existingProgress = getLevelProgress(levelSlug);
    const existingStars = existingProgress?.stars || 0;
    
    if (stars > existingStars) {
      // Save progress
      completeLevel(levelSlug, stars);
      setShowConfetti(true);
    }
    
    setSavedStars(Math.max(stars, existingStars));
    
    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, [levelSlug, stars]);

  return (
    <div className="my-8 relative">
      {/* Confetti effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 50}%`,
                animationDelay: `${Math.random() * 0.5}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`,
              }}
            >
              {["🎉", "⭐", "🌟", "✨", "🎊"][Math.floor(Math.random() * 5)]}
            </div>
          ))}
        </div>
      )}

      <div className="rounded-2xl border-4 border-green-400 dark:border-green-600 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 overflow-hidden">
        {/* Header */}
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <PromiCharacter mood="celebrating" size="lg" />
          </div>
          
          <h2 className="text-3xl font-bold mb-2">🎉 {t("levelComplete.title")}</h2>
          <p className="text-lg text-muted-foreground">{message}</p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2 pb-6">
          {[1, 2, 3].map((star) => (
            <div
              key={star}
              className={cn(
                "transition-all duration-500",
                star <= savedStars ? "scale-100" : "scale-75 opacity-30"
              )}
              style={{
                animationDelay: `${star * 0.2}s`,
              }}
            >
              <Star
                className={cn(
                  "h-12 w-12",
                  star <= savedStars 
                    ? "fill-amber-400 text-amber-400 drop-shadow-lg" 
                    : "text-muted-foreground/30"
                )}
              />
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center p-6 bg-white/50 dark:bg-card/50 border-t">
          {next ? (
            <Button asChild size="lg" className="rounded-full gap-2">
              <Link href={`/kids/level/${next.slug}`}>
                {t("levelComplete.nextLevel")}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg" className="rounded-full gap-2">
              <Link href="/kids/map">
                {t("levelComplete.allDone")}
                <Map className="h-5 w-5" />
              </Link>
            </Button>
          )}
          
          <Button variant="outline" asChild size="lg" className="rounded-full gap-2">
            <Link href="/kids/map">
              <Map className="h-5 w-5" />
              {t("levelComplete.backToMap")}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
