"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();
  const t = useTranslations("notFound");

  return (
    <div className="container flex flex-col items-center justify-center min-h-[60vh] py-12">
      <div className="text-center space-y-6 max-w-md">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <FileQuestion className="h-10 w-10 text-muted-foreground" />
        </div>

        {/* Error Code */}
        <div className="space-y-2">
          <h1 className="text-7xl font-bold text-primary">404</h1>
          <h2 className="text-xl font-semibold">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">
            {t("description")}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              {t("goHome")}
            </Link>
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("goBack")}
          </Button>
        </div>

        {/* Helpful Links */}
        <div className="pt-8 border-t">
          <p className="text-xs text-muted-foreground mb-3">
            {t("helpfulLinks")}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link href="/prompts" className="text-primary hover:underline">
              {t("browsePrompts")}
            </Link>
            <Link href="/categories" className="text-primary hover:underline">
              {t("categories")}
            </Link>
            <Link href="/prompts/new" className="text-primary hover:underline">
              {t("createPrompt")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
