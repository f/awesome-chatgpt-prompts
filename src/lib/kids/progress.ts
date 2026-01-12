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

// Component state persistence for within-level progress
const COMPONENT_STATE_KEY = "kids-component-state";

interface ComponentState {
  [levelSlug: string]: {
    [componentId: string]: unknown;
  };
}

export function getComponentState<T>(levelSlug: string, componentId: string): T | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(COMPONENT_STATE_KEY);
    if (!stored) return null;
    const state = JSON.parse(stored) as ComponentState;
    return (state[levelSlug]?.[componentId] as T) || null;
  } catch {
    return null;
  }
}

export function saveComponentState<T>(levelSlug: string, componentId: string, data: T): void {
  if (typeof window === "undefined") return;
  
  try {
    const stored = localStorage.getItem(COMPONENT_STATE_KEY);
    const state: ComponentState = stored ? JSON.parse(stored) : {};
    
    if (!state[levelSlug]) {
      state[levelSlug] = {};
    }
    state[levelSlug][componentId] = data;
    
    localStorage.setItem(COMPONENT_STATE_KEY, JSON.stringify(state));
  } catch {
    console.error("Failed to save component state");
  }
}

export function clearComponentState(levelSlug: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const stored = localStorage.getItem(COMPONENT_STATE_KEY);
    if (!stored) return;
    
    const state: ComponentState = JSON.parse(stored);
    delete state[levelSlug];
    localStorage.setItem(COMPONENT_STATE_KEY, JSON.stringify(state));
  } catch {
    console.error("Failed to clear component state");
  }
}

export function clearAllProgress(): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(COMPONENT_STATE_KEY);
  } catch {
    console.error("Failed to clear all progress");
  }
}
