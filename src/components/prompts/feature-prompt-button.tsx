"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { analyticsPrompt } from "@/lib/analytics";

interface FeaturePromptButtonProps {
  promptId: string;
  isFeatured: boolean;
  className?: string;
}

export function FeaturePromptButton({
  promptId,
  isFeatured: initialFeatured,
  className,
}: FeaturePromptButtonProps) {
  const t = useTranslations("prompts");
  const [isFeatured, setIsFeatured] = useState(initialFeatured);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}/feature`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setIsFeatured(data.isFeatured);
        if (data.isFeatured) {
          analyticsPrompt.feature(promptId);
        } else {
          analyticsPrompt.unfeature(promptId);
        }
      }
    } catch (error) {
      console.error("Error toggling featured status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isFeatured ? "default" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn("gap-1.5", className)}
    >
      <Star className={cn("h-4 w-4", isFeatured && "fill-current")} />
      {isFeatured ? t("featured") : t("feature")}
    </Button>
  );
}
