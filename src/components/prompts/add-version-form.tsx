"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface AddVersionFormProps {
  promptId: string;
  currentContent: string;
}

export function AddVersionForm({ promptId, currentContent }: AddVersionFormProps) {
  const router = useRouter();
  const t = useTranslations("version");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState(currentContent);
  const [changeNote, setChangeNote] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content === currentContent) {
      toast.error(t("contentMustDiffer"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/prompts/${promptId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, changeNote }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create version");
      }

      toast.success(t("versionCreated"));
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      // Reset form when opening
      setContent(currentContent);
      setChangeNote("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="px-2 sm:px-3">
          <Plus className="h-4 w-4 sm:mr-1.5" />
          <span className="hidden sm:inline">{t("newVersion")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t("createNewVersion")}</DialogTitle>
            <DialogDescription>
              {t("updateDescription")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="content">{t("promptContent")}</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={t("contentPlaceholder")}
                className="min-h-[200px] font-mono text-sm"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="changeNote">{t("changeNote")}</Label>
              <Input
                id="changeNote"
                value={changeNote}
                onChange={(e) => setChangeNote(e.target.value)}
                placeholder={t("changeNotePlaceholder")}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {tCommon("cancel")}
            </Button>
            <Button type="submit" disabled={isLoading || content === currentContent}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t("createVersion")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
