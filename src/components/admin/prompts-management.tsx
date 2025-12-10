"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Upload, Trash2, Loader2, CheckCircle, AlertCircle, Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  total: number;
  errors: string[];
}

interface PromptsManagementProps {
  aiSearchEnabled: boolean;
  promptsWithoutEmbeddings: number;
}

export function PromptsManagement({ aiSearchEnabled, promptsWithoutEmbeddings }: PromptsManagementProps) {
  const router = useRouter();
  const t = useTranslations("admin");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [embeddingResult, setEmbeddingResult] = useState<{ success: number; failed: number } | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setShowConfirm(false);
    setImportResult(null);

    try {
      const res = await fetch("/api/admin/import-prompts", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setImportResult(data);
      
      if (data.imported > 0) {
        toast.success(t("prompts.importSuccess", { count: data.imported }));
        router.refresh();
      } else if (data.skipped === data.total) {
        toast.info(t("prompts.allSkipped"));
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Import failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setShowDeleteConfirm(false);
    setImportResult(null);

    try {
      const res = await fetch("/api/admin/import-prompts", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Delete failed");
      }

      toast.success(t("prompts.deleteSuccess", { count: data.deleted }));
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const handleGenerateEmbeddings = async () => {
    setGenerating(true);
    setEmbeddingResult(null);

    try {
      const res = await fetch("/api/admin/embeddings", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate embeddings");
      }

      setEmbeddingResult({ success: data.success, failed: data.failed });
      toast.success(t("prompts.embeddingsSuccess", { count: data.success }));
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate embeddings");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{t("prompts.title")}</h3>
          <p className="text-sm text-muted-foreground">{t("prompts.description")}</p>
        </div>
      </div>

      <div className="rounded-md border p-4 space-y-3">
        {/* Import Row */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground flex-1">{t("import.fileInfo")}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowConfirm(true)}
            disabled={loading || deleting || generating}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Upload className="h-4 w-4 mr-2" />{t("prompts.import")}</>}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading || deleting || generating}
            className="text-destructive hover:text-destructive"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
          </Button>
        </div>

        {importResult && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {importResult.imported > 0 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
            <span>{t("prompts.importResult", { imported: importResult.imported, skipped: importResult.skipped })}</span>
          </div>
        )}

        {/* AI Embeddings Row */}
        {aiSearchEnabled && (
          <>
            <div className="flex items-center gap-2 pt-3 border-t">
              <span className="text-sm text-muted-foreground flex-1">
                {t("aiSearch.title")} <span className="tabular-nums">({promptsWithoutEmbeddings} {t("prompts.pending")})</span>
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateEmbeddings}
                disabled={loading || deleting || generating || promptsWithoutEmbeddings === 0}
              >
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Sparkles className="h-4 w-4 mr-2" />{t("prompts.generateEmbeddings")}</>}
              </Button>
            </div>

            {embeddingResult && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {embeddingResult.failed === 0 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                <span>{t("prompts.embeddingsResult", { success: embeddingResult.success, failed: embeddingResult.failed })}</span>
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("prompts.importConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("prompts.importConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("prompts.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>{t("prompts.confirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("prompts.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("prompts.deleteConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("prompts.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">
              {t("prompts.delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
