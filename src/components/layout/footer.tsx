"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import DeepWikiIcon from "@/../public/deepwiki.svg";
import { useBranding } from "@/components/providers/branding-provider";
import { analyticsExternal } from "@/lib/analytics";

export function Footer() {
  const branding = useBranding();
  const t = useTranslations("footer");

  return (
    <footer className="border-t shrink-0">
      <div className="container flex flex-col items-center gap-3 py-4 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:h-10 sm:py-0 sm:gap-4">
        <span className="flex items-center gap-1.5">
          <Image src="/logo.svg" alt="" width={14} height={14} className="dark:invert" />
          <Link href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">CC0</Link>
          {" "}{new Date().getFullYear()} {branding.name}
        </span>
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
          {!branding.useCloneBranding && (
            <>
              <Link href="https://deepwiki.com/f/prompts.chat" target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-1" onClick={() => analyticsExternal.clickFooterLink("deepwiki")}>
                <Image src={DeepWikiIcon} alt="" width={14} height={14} />
                DeepWiki
              </Link>
              <Link href="/how_to_write_effective_prompts" className="hover:text-foreground">{t("howTo")}</Link>
              <Link href="/docs/self-hosting" className="hover:text-foreground">{t("docs")}</Link>
              <Link href="/docs/api" className="hover:text-foreground">{t("api")}</Link>
              <Link href="/privacy" className="hover:text-foreground">{t("privacy")}</Link>
              <Link href="/terms" className="hover:text-foreground">{t("terms")}</Link>
              <Link href="/support" className="hover:text-foreground">{t("support")}</Link>
              <Link href="/about" className="hover:text-foreground">{t("about")}</Link>
            </>
          )}
          <Link href="https://github.com/f/prompts.chat" target="_blank" rel="noopener noreferrer" className="hover:text-foreground flex items-center gap-1" onClick={() => analyticsExternal.clickFooterLink("github")}>
            <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            GitHub
          </Link>
        </nav>
      </div>
    </footer>
  );
}
