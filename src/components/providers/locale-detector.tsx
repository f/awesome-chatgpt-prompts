"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { LOCALE_COOKIE } from "@/lib/i18n/config";

/**
 * Client component that saves the auto-detected locale to a cookie on first visit.
 * This ensures the detected language is remembered without requiring user interaction.
 */
export function LocaleDetector() {
  const locale = useLocale();

  useEffect(() => {
    // Check if locale cookie already exists
    const hasLocaleCookie = document.cookie
      .split(";")
      .some((c) => c.trim().startsWith(`${LOCALE_COOKIE}=`));

    // If no cookie exists, save the current (auto-detected) locale
    if (!hasLocaleCookie && locale) {
      document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    }
  }, [locale]);

  return null;
}
