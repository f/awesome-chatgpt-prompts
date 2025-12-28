"use client";

import { useState, useEffect } from "react";
import { Lock, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "private-prompts-note-dismissed";

interface PrivatePromptsNoteProps {
  count: number;
}

export function PrivatePromptsNote({ count }: PrivatePromptsNoteProps) {
  const t = useTranslations("user");
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to prevent flash

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY) === "true";
    // Read from localStorage on mount - use queueMicrotask to avoid sync setState
    queueMicrotask(() => setIsDismissed(dismissed));
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
  };

  if (isDismissed || count === 0) {
    return null;
  }

  return (
    <div className="mb-4 p-3 rounded-lg border border-primary/20 bg-primary/5 flex items-start gap-3">
      <Lock className="h-4 w-4 text-primary mt-0.5 shrink-0" />
      <p className="flex-1 text-sm text-foreground">
        {t("privatePromptsNote", { count })}
      </p>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 shrink-0 -mt-0.5 -mr-1 text-muted-foreground hover:text-foreground"
        onClick={handleDismiss}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Dismiss</span>
      </Button>
    </div>
  );
}
