"use client";

import { getAllLevels } from "./levels";

const STORAGE_KEY = "kids-progress";

export interface LevelProgress {
  completed: boolean;
  stars: number; // 0-3
  completedAt?: string;
}

export interface KidsProgress {
  levels: Record<string, LevelProgress>;
  currentLevel?: string;
  totalStars: number;
}

const defaultProgress: KidsProgress = {
  levels: {},
  totalStars: 0,
};

export function getProgress(): KidsProgress {
  if (typeof window === "undefined") return defaultProgress;
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return defaultProgress;
    return JSON.parse(stored) as KidsProgress;
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: KidsProgress): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    console.error("Failed to save progress");
  }
}

export function completeLevel(slug: string, stars: number): KidsProgress {
  const progress = getProgress();
  const previousStars = progress.levels[slug]?.stars || 0;
  
  // Only update if new stars are higher
  const newStars = Math.max(previousStars, Math.min(3, Math.max(0, stars)));
  const starsDiff = newStars - previousStars;
  
  progress.levels[slug] = {
    completed: true,
    stars: newStars,
    completedAt: new Date().toISOString(),
  };
  
  progress.totalStars += starsDiff;
  
  // Set next level as current
  const levels = getAllLevels();
  const currentIndex = levels.findIndex((l) => l.slug === slug);
  if (currentIndex < levels.length - 1) {
    progress.currentLevel = levels[currentIndex + 1].slug;
  }
  
  saveProgress(progress);
  return progress;
}

export function isLevelUnlocked(slug: string): boolean {
  const progress = getProgress();
  const levels = getAllLevels();
  const levelIndex = levels.findIndex((l) => l.slug === slug);
  
  // First level is always unlocked
  if (levelIndex === 0) return true;
  
  // Level is unlocked if previous level is completed
  const prevLevel = levels[levelIndex - 1];
  return progress.levels[prevLevel.slug]?.completed || false;
}

export function getLevelProgress(slug: string): LevelProgress | undefined {
  const progress = getProgress();
  return progress.levels[slug];
}

export function resetProgress(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getCompletedLevelsCount(): number {
  const progress = getProgress();
  return Object.values(progress.levels).filter((l) => l.completed).length;
}

export function getTotalStars(): number {
  return getProgress().totalStars;
}
