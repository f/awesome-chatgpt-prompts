"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Chromium } from "lucide-react";
import { useTranslations } from "next-intl";
import { isChromeBrowser } from "@/lib/utils";

interface ExtensionLinkProps {
  url: string;
}

export function ExtensionLink({ url }: ExtensionLinkProps) {
  const t = useTranslations("homepage");
  const [isChromeBased, setIsChromeBased] = useState(false);

  useEffect(() => {
    setIsChromeBased(isChromeBrowser());
  }, []);

  if (!isChromeBased) return null;

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg transition-colors border border-zinc-700 dark:border-zinc-600"
    >
      <Chromium className="h-4 w-4 text-zinc-100" />
      <span className="text-sm font-medium text-zinc-100">{t("extension")}</span>
    </Link>
  );
}
