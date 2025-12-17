"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DelistReason = "TOO_SHORT" | "NOT_ENGLISH" | "LOW_QUALITY" | "NOT_LLM_INSTRUCTION" | "MANUAL";

interface DelistBannerProps {
  promptId: string;
  delistReason: DelistReason | null;
  isOwner: boolean;
}

export function DelistBanner({ promptId, delistReason, isOwner }: DelistBannerProps) {
  const t = useTranslations("prompts");
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getReasonText = (reason: DelistReason | null): string => {
    switch (reason) {
      case "TOO_SHORT":
        return t("delistReasonTooShort");
      case "NOT_ENGLISH":
        return t("delistReasonNotEnglish");
      case "LOW_QUALITY":
        return t("delistReasonLowQuality");
      case "NOT_LLM_INSTRUCTION":
        return t("delistReasonNotInstruction");
      case "MANUAL":
        return t("delistReasonManual");
      default:
        return t("delistReasonUnknown");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/");
        router.refresh();
      } else {
        const data = await response.json();
        setError(data.message || t("deleteError"));
      }
    } catch {
      setError(t("deleteError"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mb-6 p-4 rounded-lg border border-amber-500/30 bg-amber-500/5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1">
          <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-400">
              {t("promptDelisted")}
            </h3>
            <p className="text-sm text-amber-600 dark:text-amber-500">
              {getReasonText(delistReason)}
            </p>
            {isOwner && delistReason && delistReason !== "MANUAL" && (
              <p className="text-xs text-muted-foreground mt-2">
                {t("delistOwnerNote")}
              </p>
            )}
          </div>
        </div>
        
        {isOwner && delistReason && delistReason !== "MANUAL" && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="sm"
                disabled={isDeleting}
                className="shrink-0"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                {t("deletePrompt")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t("deletePromptTitle")}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t("deletePromptDescription")}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {t("deletePrompt")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
