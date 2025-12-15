"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Pin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { analyticsPrompt } from "@/lib/analytics";

interface PinButtonProps {
  promptId: string;
  initialPinned: boolean;
  iconOnly?: boolean;
}

export function PinButton({ promptId, initialPinned, iconOnly = false }: PinButtonProps) {
  const t = useTranslations("prompts");
  const [isPinned, setIsPinned] = useState(initialPinned);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}/pin`, {
        method: isPinned ? "DELETE" : "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t("pinFailed"));
        return;
      }

      setIsPinned(data.pinned);
      if (data.pinned) {
        analyticsPrompt.pin(promptId);
      } else {
        analyticsPrompt.unpin(promptId);
      }
      toast.success(data.pinned ? t("pinned") : t("unpinned"));
    } catch {
      toast.error(t("pinFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (iconOnly) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 ${isPinned ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        onClick={handleToggle}
        disabled={isLoading}
        title={isPinned ? t("unpin") : t("pin")}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Pin className={`h-3.5 w-3.5 ${isPinned ? "fill-current" : ""}`} />
        )}
      </Button>
    );
  }

  return (
    <Button
      variant={isPinned ? "secondary" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Pin className={`h-4 w-4 mr-2 ${isPinned ? "fill-current" : ""}`} />
      )}
      {isPinned ? t("unpin") : t("pin")}
    </Button>
  );
}
