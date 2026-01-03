"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { PromptIde } from "@/components/ide/prompt-ide";
import { Monitor } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function IdePage() {
  const t = useTranslations("ide");
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (!mounted) {
    return null;
  }

  if (isMobile) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
        <Monitor className="h-16 w-16 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">{t("desktopOnly")}</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          {t("desktopOnlyDescription")}
        </p>
        <Button asChild>
          <Link href="/prompts">{t("browsePrompts")}</Link>
        </Button>
      </div>
    );
  }

  return <PromptIde />;
}
