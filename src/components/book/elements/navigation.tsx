"use client";

import { Compass, Settings, Zap, Target, Gem, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useLocale } from "next-intl";
import { getLocaleField, type BookPart } from "./locales";

const partIcons = [Compass, Settings, Zap, Target, Gem, null, Code];

const partColors: Record<string, { bg: string; border: string; text: string; hover: string }> = {
  blue: { bg: "bg-blue-50 dark:bg-blue-950/30", border: "border-blue-200 dark:border-blue-800", text: "text-blue-700 dark:text-blue-300", hover: "hover:bg-blue-100 dark:hover:bg-blue-950/50" },
  purple: { bg: "bg-purple-50 dark:bg-purple-950/30", border: "border-purple-200 dark:border-purple-800", text: "text-purple-700 dark:text-purple-300", hover: "hover:bg-purple-100 dark:hover:bg-purple-950/50" },
  amber: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800", text: "text-amber-700 dark:text-amber-300", hover: "hover:bg-amber-100 dark:hover:bg-amber-950/50" },
  green: { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800", text: "text-green-700 dark:text-green-300", hover: "hover:bg-green-100 dark:hover:bg-green-950/50" },
  rose: { bg: "bg-rose-50 dark:bg-rose-950/30", border: "border-rose-200 dark:border-rose-800", text: "text-rose-700 dark:text-rose-300", hover: "hover:bg-rose-100 dark:hover:bg-rose-950/50" },
  cyan: { bg: "bg-cyan-50 dark:bg-cyan-950/30", border: "border-cyan-200 dark:border-cyan-800", text: "text-cyan-700 dark:text-cyan-300", hover: "hover:bg-cyan-100 dark:hover:bg-cyan-950/50" },
  indigo: { bg: "bg-indigo-50 dark:bg-indigo-950/30", border: "border-indigo-200 dark:border-indigo-800", text: "text-indigo-700 dark:text-indigo-300", hover: "hover:bg-indigo-100 dark:hover:bg-indigo-950/50" },
};

export function BookPartsNav() {
  const t = useTranslations("book.interactive");
  const locale = useLocale();
  const bookPartsData = getLocaleField(locale, "bookParts");
  
  return (
    <div className="my-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {bookPartsData.map((part) => {
        const colors = partColors[part.color];
        const Icon = partIcons[part.number - 1];
        return (
          <a
            key={part.number}
            href={`/book/${part.slug}`}
            style={{ textDecoration: "none" }}
            className={cn(
              "p-4 rounded-lg border transition-all block",
              colors.bg,
              colors.border,
              colors.hover
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn("p-2 rounded-lg", colors.bg, colors.border, "border")}>
                {part.customIcon ? (
                  <div className="h-5 w-5 flex items-center justify-center">
                    <img src="/logo.svg" alt="" className="h-5 w-auto dark:hidden" />
                    <img src="/logo-dark.svg" alt="" className="h-5 w-auto hidden dark:block" />
                  </div>
                ) : (
                  Icon && <Icon className={cn("h-5 w-5", colors.text)} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn("font-semibold text-sm m-0!", colors.text)}>
                  {t("part")} {part.number}: {part.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5 m-0!">
                  {part.description}
                </p>
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
