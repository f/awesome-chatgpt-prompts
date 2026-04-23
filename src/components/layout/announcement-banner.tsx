"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { useBranding } from "@/components/providers/branding-provider";

export interface AnnouncementBannerConfig {
  // Unique id used for the localStorage dismissal key. Bump this to re-show
  // the banner after editing the message for a new announcement.
  id: string;
  // Optional href; if provided the banner becomes a link.
  href?: string;
  // Whether the link should open in a new tab. Defaults to true for external links.
  external?: boolean;
  // Main message; rendered on small+ screens.
  message: React.ReactNode;
  // Shorter message rendered on mobile (falls back to `message`).
  messageShort?: React.ReactNode;
  // Optional call-to-action label rendered after the message (e.g. "View session →").
  cta?: string;
}

// Edit this to change/disable the active announcement.
// Set to `null` to hide the banner entirely.
export const ACTIVE_ANNOUNCEMENT: AnnouncementBannerConfig | null = {
  id: "ms-build-2026",
  href: "https://build.microsoft.com/en-US/sessions/LTG468",
  external: true,
  message: (
    <>
      <span className="font-semibold">Fatih Kadir Akın</span> is speaking about
      prompts.chat at <span className="font-semibold">Microsoft Build 2026</span>
      {" · June 2–3, San Francisco"}
    </>
  ),
  messageShort: (
    <>
      <span className="font-semibold">prompts.chat</span> at Microsoft Build 2026
    </>
  ),
  cta: "View session →",
};

export function AnnouncementBanner({
  announcement = ACTIVE_ANNOUNCEMENT,
}: {
  announcement?: AnnouncementBannerConfig | null;
}) {
  const branding = useBranding();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);

  const storageKey = announcement
    ? `announcement-banner-dismissed:${announcement.id}`
    : null;
  const hideViaQuery = searchParams?.has("no-announcement");

  useEffect(() => {
    if (!storageKey) return;
    const dismissed = localStorage.getItem(storageKey);
    if (!dismissed) setIsVisible(true);
  }, [storageKey]);

  if (!announcement || !isVisible || branding.useCloneBranding || hideViaQuery) {
    return null;
  }

  const handleDismiss = () => {
    if (storageKey) localStorage.setItem(storageKey, "true");
    setIsVisible(false);
  };

  const content = (
    <>
      <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span className="truncate">
        <span className="hidden sm:inline">{announcement.message}</span>
        <span className="sm:hidden">
          {announcement.messageShort ?? announcement.message}
        </span>
        {announcement.cta && (
          <span className="ml-1 underline-offset-2 hover:underline">
            {announcement.cta}
          </span>
        )}
      </span>
    </>
  );

  return (
    <div className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground">
      <div className="container flex items-center justify-between gap-3 py-1.5 text-xs sm:text-sm">
        {announcement.href ? (
          <Link
            href={announcement.href}
            target={announcement.external ? "_blank" : undefined}
            rel={announcement.external ? "noopener noreferrer" : undefined}
            className="flex min-w-0 flex-1 items-center gap-2 hover:underline"
          >
            {content}
          </Link>
        ) : (
          <div className="flex min-w-0 flex-1 items-center gap-2">{content}</div>
        )}
        <button
          type="button"
          onClick={handleDismiss}
          className="-mr-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-primary-foreground/80 hover:bg-primary-foreground/20 hover:text-primary-foreground"
          aria-label="Dismiss announcement"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
