"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Star, Lock, Check, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { worlds, type Level } from "@/lib/kids/levels";
import { getProgress, isLevelUnlocked, type KidsProgress } from "@/lib/kids/progress";

export function ProgressMap() {
  const t = useTranslations("kids");
  const [progress, setProgress] = useState<KidsProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  return (
    <div className="space-y-8">
      {worlds.map((world) => (
        <WorldSection key={world.number} world={world} progress={progress} t={t} />
      ))}
    </div>
  );
}

interface WorldSectionProps {
  world: typeof worlds[0];
  progress: KidsProgress | null;
  t: ReturnType<typeof useTranslations>;
}

function WorldSection({ world, progress, t }: WorldSectionProps) {
  const colorClasses = {
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
      border: "border-emerald-200 dark:border-emerald-800",
      text: "text-emerald-700 dark:text-emerald-300",
      badge: "bg-emerald-100 dark:bg-emerald-900/50",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950/30",
      border: "border-blue-200 dark:border-blue-800",
      text: "text-blue-700 dark:text-blue-300",
      badge: "bg-blue-100 dark:bg-blue-900/50",
    },
  }[world.color] || {
    bg: "bg-gray-50 dark:bg-gray-950/30",
    border: "border-gray-200 dark:border-gray-800",
    text: "text-gray-700 dark:text-gray-300",
    badge: "bg-gray-100 dark:bg-gray-900/50",
  };

  return (
    <div className={cn("rounded-2xl border-2 p-6", colorClasses.bg, colorClasses.border)}>
      {/* World Header */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{world.emoji}</span>
        <div>
          <h2 className="text-xl font-bold">{t(`worlds.${world.number}.title`)}</h2>
          <p className="text-sm text-muted-foreground">
            {t("map.worldLevels", { count: world.levels.length })}
          </p>
        </div>
      </div>

      {/* Levels */}
      <div className="grid sm:grid-cols-3 gap-4">
        {world.levels.map((level) => (
          <LevelCard 
            key={level.slug} 
            level={level} 
            progress={progress}
            colorClasses={colorClasses}
            t={t}
          />
        ))}
      </div>
    </div>
  );
}

interface LevelCardProps {
  level: Level;
  progress: KidsProgress | null;
  colorClasses: {
    bg: string;
    border: string;
    text: string;
    badge: string;
  };
  t: ReturnType<typeof useTranslations>;
}

function LevelCard({ level, progress, colorClasses, t }: LevelCardProps) {
  const [unlocked, setUnlocked] = useState(false);
  const levelProgress = progress?.levels[level.slug];
  const isCompleted = levelProgress?.completed;
  const stars = levelProgress?.stars || 0;

  useEffect(() => {
    setUnlocked(isLevelUnlocked(level.slug));
  }, [level.slug, progress]);

  if (!unlocked) {
    return (
      <div className="relative p-4 rounded-xl bg-muted/50 border-2 border-dashed border-muted-foreground/20 opacity-60">
        <div className="absolute top-2 right-2">
          <Lock className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="text-center py-4">
          <p className="font-medium text-muted-foreground">{t(`levels.${level.slug.replace(/-/g, "_")}.title`)}</p>
          <p className="text-xs text-muted-foreground mt-1">{t("map.locked")}</p>
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/kids/level/${level.slug}`}
      className={cn(
        "relative block p-4 rounded-xl bg-white dark:bg-card border-2 transition-all hover:scale-105 hover:shadow-lg",
        isCompleted ? "border-green-400 dark:border-green-600" : "border-primary/30 hover:border-primary"
      )}
    >
      {/* Status badge */}
      <div className="absolute top-2 right-2">
        {isCompleted ? (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500 text-white">
            <Check className="h-4 w-4" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground">
            <Play className="h-3 w-3" />
          </div>
        )}
      </div>

      {/* Level info */}
      <div className="mb-3">
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", colorClasses.badge, colorClasses.text)}>
          {t("map.levelNumber", { number: `${level.world}-${level.levelNumber}` })}
        </span>
      </div>

      <h3 className="font-semibold mb-1">{level.title}</h3>
      <p className="text-xs text-muted-foreground line-clamp-2">{level.description}</p>

      {/* Stars */}
      <div className="flex items-center gap-1 mt-3">
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= stars 
                ? "fill-amber-400 text-amber-400" 
                : "text-muted-foreground/30"
            )}
          />
        ))}
      </div>
    </Link>
  );
}
