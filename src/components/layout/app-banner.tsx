"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";

function AppStoreIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="93 90 313 300"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M255.9 120.9l9.1-15.7c5.6-9.8 18.1-13.1 27.9-7.5 9.8 5.6 13.1 18.1 7.5 27.9l-87.5 151.5h63.3c20.5 0 32 24.1 23.1 40.8H113.8c-11.3 0-20.4-9.1-20.4-20.4 0-11.3 9.1-20.4 20.4-20.4h52l66.6-115.4-20.8-36.1c-5.6-9.8-2.3-22.2 7.5-27.9 9.8-5.6 22.2-2.3 27.9 7.5l8.9 15.7zm-78.7 218l-19.6 34c-5.6 9.8-18.1 13.1-27.9 7.5-9.8-5.6-13.1-18.1-7.5-27.9l14.6-25.2c16.4-5.1 29.8-1.2 40.4 11.6zm168.9-61.7h53.1c11.3 0 20.4 9.1 20.4 20.4 0 11.3-9.1 20.4-20.4 20.4h-29.5l19.9 34.5c5.6 9.8 2.3 22.2-7.5 27.9-9.8 5.6-22.2 2.3-27.9-7.5-33.5-58.1-58.7-101.6-75.4-130.6-17.1-29.5-4.9-59.1 7.2-69.1 13.4 23 33.4 57.7 60.1 104z" />
    </svg>
  );
}
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/components/providers/branding-provider";

const STORAGE_KEY = "app-banner-dismissed";

function isAppleDevice(): boolean {
  if (typeof window === "undefined") return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform?.toLowerCase() || navigator.platform?.toLowerCase() || "";
  
  // Check for iOS devices
  const isIOS = /iphone|ipad|ipod/.test(userAgent);
  
  // Check for macOS
  const isMac = platform.includes("mac") || /macintosh|macintel/.test(userAgent);
  
  return isIOS || isMac;
}

export function AppBanner() {
  const t = useTranslations("appBanner");
  const branding = useBranding();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [isApple, setIsApple] = useState(false);
  
  const hideViaQuery = searchParams?.has("no-app-banner");

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    const isAppleUser = isAppleDevice();
    setIsApple(isAppleUser);
    
    if (isAppleUser && !dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsVisible(false);
  };

  if (!isVisible || !isApple || branding.useCloneBranding || hideViaQuery) return null;

  return (
    <div className="bg-gradient-to-r from-primary/90 to-primary text-primary-foreground">
      <div className="container flex items-center justify-between gap-4 py-2 text-sm">
        <div className="flex items-center gap-3">
          <AppStoreIcon className="h-4 w-4 shrink-0" />
          <p className="text-xs sm:text-sm">
            <span className="hidden sm:inline">{t("message")}</span>
            <span className="sm:hidden">{t("messageShort")}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="h-7 text-xs font-medium"
          >
            <Link href={branding.appStoreUrl || "#"} target="_blank" rel="noopener noreferrer">
              {t("download")}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-primary-foreground hover:bg-primary-foreground/20"
            onClick={handleDismiss}
          >
            <X className="h-3.5 w-3.5" />
            <span className="sr-only">{t("dismiss")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
