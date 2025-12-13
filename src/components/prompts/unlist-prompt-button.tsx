"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UnlistPromptButtonProps {
  promptId: string;
  isUnlisted: boolean;
  className?: string;
}

export function UnlistPromptButton({
  promptId,
  isUnlisted: initialUnlisted,
  className,
}: UnlistPromptButtonProps) {
  const t = useTranslations("prompts");
  const [isUnlisted, setIsUnlisted] = useState(initialUnlisted);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/prompts/${promptId}/unlist`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setIsUnlisted(data.isUnlisted);
      }
    } catch (error) {
      console.error("Error toggling unlist status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={isUnlisted ? "destructive" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
      className={cn("gap-1.5", className)}
    >
      {isUnlisted ? (
        <>
          <Eye className="h-4 w-4" />
          {t("relist")}
        </>
      ) : (
        <>
          <EyeOff className="h-4 w-4" />
          {t("unlist")}
        </>
      )}
    </Button>
  );
}
