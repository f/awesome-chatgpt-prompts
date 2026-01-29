"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Chromium } from "lucide-react";
import { useTranslations } from "next-intl";
import { isChromeBrowser, isFirefoxBrowser } from "@/lib/utils";

const FIREFOX_ADDON_URL = "https://addons.mozilla.org/en-US/firefox/addon/prompts-chat/";

interface ExtensionLinkProps {
  url: string;
}

export function ExtensionLink({ url }: ExtensionLinkProps) {
  const t = useTranslations("homepage");
  const [browserType, setBrowserType] = useState<"chrome" | "firefox" | null>(null);

  useEffect(() => {
    if (isFirefoxBrowser()) {
      setBrowserType("firefox");
    } else if (isChromeBrowser()) {
      setBrowserType("chrome");
    }
  }, []);

  if (!browserType) return null;

  const isFirefox = browserType === "firefox";
  const extensionUrl = isFirefox ? FIREFOX_ADDON_URL : url;

  return (
    <Link
      href={extensionUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center gap-2 h-10 px-2.5 2xl:px-4 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700 dark:border-zinc-600"
    >
      {isFirefox ? (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#FF7139">
          <path d="M20.452 3.445a11.002 11.002 0 00-2.482-1.908C16.944.997 15.098.093 12.477.032c-.734-.017-1.457.03-2.174.144-.72.114-1.398.292-2.118.56-1.017.377-1.996.975-2.574 1.554.583-.349 1.476-.733 2.55-.992a10.083 10.083 0 013.729-.167c2.341.34 4.178 1.381 5.48 2.625a8.066 8.066 0 011.298 1.587c1.468 2.382 1.33 5.376.184 7.142-.85 1.312-2.67 2.544-4.37 2.53-.583-.023-1.438-.152-2.25-.566-2.629-1.343-3.021-4.688-1.118-6.306-.632-.136-1.82.13-2.646 1.363-.742 1.107-.7 2.816-.242 4.028a6.473 6.473 0 01-.59-1.895 7.695 7.695 0 01.416-3.845A8.212 8.212 0 019.45 5.399c.896-1.069 1.908-1.72 2.75-2.005-.54-.471-1.411-.738-2.421-.767C8.31 2.583 6.327 3.061 4.7 4.41a8.148 8.148 0 00-1.976 2.414c-.455.836-.691 1.659-.697 1.678.122-1.445.704-2.994 1.248-4.055-.79.413-1.827 1.668-2.41 3.042C.095 9.37-.2 11.608.14 13.989c.966 5.668 5.9 9.982 11.843 9.982C18.62 23.971 24 18.591 24 11.956a11.93 11.93 0 00-3.548-8.511z"/>
        </svg>
      ) : (
        <Chromium className="h-4 w-4 text-zinc-100" />
      )}
      <span className="hidden 2xl:inline text-sm font-medium text-zinc-100 whitespace-nowrap">{t("extension")}</span>
    </Link>
  );
}
