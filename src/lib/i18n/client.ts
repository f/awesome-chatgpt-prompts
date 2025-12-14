"use client";

import { LOCALE_COOKIE } from "./config";

/**
 * Set the user's locale preference (client-side)
 * This updates the cookie and forces a hard navigation to apply the new locale
 */
export function setLocale(locale: string): void {
  // Set cookie with 1 year expiry
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  
  // Force a hard navigation to the same URL to ensure server re-renders with new locale
  // Using href assignment instead of reload() for more reliable behavior in Next.js
  window.location.href = window.location.href;
}

/**
 * Get the current locale from cookie (client-side)
 */
export function getLocaleClient(): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${LOCALE_COOKIE}=([^;]+)`));
  return match ? match[2] : null;
}
