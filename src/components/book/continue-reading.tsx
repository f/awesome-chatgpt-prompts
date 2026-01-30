"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Bookmark, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmark } from "./sidebar";
import { getChapterBySlug } from "@/lib/book/chapters";

export function ContinueReadingButton() {
  const { bookmark } = useBookmark();
  const t = useTranslations("book");

  if (!bookmark) return null;

  const chapter = getChapterBySlug(bookmark);
  if (!chapter) return null;

  const getChapterTitle = () => {
    try {
      const translated = t(`chapters.${bookmark}`);
      return translated !== `chapters.${bookmark}` ? translated : chapter.title;
    } catch {
      return chapter.title;
    }
  };

  return (
    <div className="mb-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
          <Bookmark className="h-5 w-5 text-primary fill-current" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">{t("bookmark.continueReading")}</p>
          <p className="font-medium truncate">{getChapterTitle()}</p>
        </div>
        <Button asChild size="sm">
          <Link href={`/book/${bookmark}`}>
            {t("bookmark.continue")}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
