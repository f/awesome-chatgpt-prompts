"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { RotateCcw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RestorePromptButtonProps {
  promptId: string;
}

export function RestorePromptButton({ promptId }: RestorePromptButtonProps) {
  const router = useRouter();
  const t = useTranslations("prompts");
  const [isRestoring, setIsRestoring] = useState(false);

  const handleRestore = async () => {
    setIsRestoring(true);

    try {
      const response = await fetch(`/api/prompts/${promptId}/restore`, {
        method: "POST",
      });

      if (response.ok) {
        toast.success(t("promptRestored"));
        router.refresh();
      } else {
        const data = await response.json();
        toast.error(data.error || t("restoreError"));
      }
    } catch {
      toast.error(t("restoreError"));
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRestore}
      disabled={isRestoring}
    >
      {isRestoring ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <RotateCcw className="h-4 w-4 mr-2" />
      )}
      {t("restorePrompt")}
    </Button>
  );
}
