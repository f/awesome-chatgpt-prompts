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

// Section completion tracking
const SECTION_COMPLETION_KEY = "kids-section-completion";

interface SectionCompletionState {
  [levelSlug: string]: {
    [sectionIndex: number]: boolean;
  };
}

export function isSectionCompleted(levelSlug: string, sectionIndex: number): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const stored = localStorage.getItem(SECTION_COMPLETION_KEY);
    if (!stored) return false;
    const state = JSON.parse(stored) as SectionCompletionState;
    return state[levelSlug]?.[sectionIndex] || false;
  } catch {
    return false;
  }
}

export function markSectionCompleted(levelSlug: string, sectionIndex: number): void {
  if (typeof window === "undefined") return;
  
  try {
    const stored = localStorage.getItem(SECTION_COMPLETION_KEY);
    const state: SectionCompletionState = stored ? JSON.parse(stored) : {};
    
    if (!state[levelSlug]) {
      state[levelSlug] = {};
    }
    state[levelSlug][sectionIndex] = true;
    
    localStorage.setItem(SECTION_COMPLETION_KEY, JSON.stringify(state));
  } catch {
    console.error("Failed to mark section completed");
  }
}

export function clearSectionCompletion(levelSlug: string): void {
  if (typeof window === "undefined") return;
  
  try {
    const stored = localStorage.getItem(SECTION_COMPLETION_KEY);
    if (!stored) return;
    
    const state: SectionCompletionState = JSON.parse(stored);
    delete state[levelSlug];
    localStorage.setItem(SECTION_COMPLETION_KEY, JSON.stringify(state));
  } catch {
    console.error("Failed to clear section completion");
  }
}

// Check if any interactive component in a level+section is completed
export function hasCompletedInteraction(levelSlug: string, componentIdPrefix?: string): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    const stored = localStorage.getItem(COMPONENT_STATE_KEY);
    if (!stored) return false;
    
    const state = JSON.parse(stored) as ComponentState;
    const levelState = state[levelSlug];
    if (!levelState) return false;
    
    // Check if any component has completed state
    for (const [componentId, data] of Object.entries(levelState)) {
      if (componentIdPrefix && !componentId.includes(componentIdPrefix)) continue;
      if (data && typeof data === 'object' && 'completed' in data && (data as { completed: boolean }).completed) {
        return true;
      }
    }
    return false;
  } catch {
    return false;
  }
}
