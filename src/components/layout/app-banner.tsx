"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { X, Apple } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { useBranding } from "@/components/providers/branding-provider";

const APP_STORE_URL = "https://apps.apple.com/tr/app/prompts-chat/id6756895736";
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
          <Apple className="h-4 w-4 shrink-0" />
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
            <Link href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
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
