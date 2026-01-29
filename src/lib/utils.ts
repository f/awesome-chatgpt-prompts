import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Detect if the browser is Chrome-based (Chrome, Edge, Brave, Opera, etc.)
 * Must be called on client-side only
 */
export function isChromeBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent;
  const isChrome = /Chrome/.test(userAgent) && !/Edg/.test(userAgent);
  const isEdge = /Edg/.test(userAgent);
  const isOpera = /OPR/.test(userAgent);
  const isBrave = (navigator as Navigator & { brave?: { isBrave?: () => Promise<boolean> } }).brave !== undefined;
  
  return isChrome || isEdge || isOpera || isBrave;
}

/**
 * Detect if the browser is Firefox
 * Must be called on client-side only
 */
export function isFirefoxBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Firefox/.test(navigator.userAgent);
}
