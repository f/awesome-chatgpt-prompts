"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Home, Map, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getTotalStars, getCompletedLevelsCount } from "@/lib/kids/progress";
import { getTotalLevels } from "@/lib/kids/levels";

export function KidsHeader() {
  const t = useTranslations("kids");
  const [stars, setStars] = useState(0);
  const [completed, setCompleted] = useState(0);
  const total = getTotalLevels();

  useEffect(() => {
    setStars(getTotalStars());
    setCompleted(getCompletedLevelsCount());
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 dark:bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/kids" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-2xl">🤖</span>
          <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            {t("header.title")}
          </span>
        </Link>

        {/* Stats & Nav */}
        <div className="flex items-center gap-4">
          {/* Stars counter */}
          <div className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-700 dark:text-amber-300">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-semibold text-sm">{stars}</span>
          </div>

          {/* Progress */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-full text-emerald-700 dark:text-emerald-300 text-sm">
            <span className="font-semibold">{completed}/{total}</span>
            <span className="text-emerald-600 dark:text-emerald-400">{t("header.levels")}</span>
          </div>

          {/* Nav buttons */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link href="/kids">
                <Home className="h-5 w-5" />
                <span className="sr-only">{t("header.home")}</span>
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild className="rounded-full">
              <Link href="/kids/map">
                <Map className="h-5 w-5" />
                <span className="sr-only">{t("header.map")}</span>
              </Link>
            </Button>
          </div>

          {/* Back to main site */}
          <Button variant="outline" size="sm" asChild className="hidden md:flex rounded-full">
            <Link href="/">
              {t("header.mainSite")}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
