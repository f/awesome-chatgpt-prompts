"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export function ImportPrompts() {
  const router = useRouter();
  const t = useTranslations("admin.import");
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setShowConfirm(false);
    setResult(null);

    try {
      const res = await fetch("/api/admin/import-prompts", {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }

      setResult(data);
      
      if (data.imported > 0) {
        toast.success(t("success", { count: data.imported }));
        router.refresh();
      } else if (data.skipped === data.total) {
        toast.info(t("allSkipped"));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Import failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setShowDeleteConfirm(false);
    setResult(null);

    try {
      const res = await fetch("/api/admin/import-prompts", {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Delete failed");
      }

      toast.success(t("deleteSuccess", { count: data.deleted }));
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Delete failed";
      toast.error(message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t("title")}
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-dashed p-6 text-center">
            <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-1">
              {t("fileInfo")}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("csvFormat")}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => setShowConfirm(true)}
              disabled={loading || deleting}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("importing")}
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {t("importButton")}
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              disabled={loading || deleting}
              variant="destructive"
            >
              {deleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          {result && (
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center gap-2">
                {result.imported > 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                )}
                <span className="font-medium">{t("resultTitle")}</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>{t("imported", { count: result.imported })}</p>
                <p>{t("skipped", { count: result.skipped })}</p>
                <p>{t("total", { count: result.total })}</p>
              </div>
              {result.errors.length > 0 && (
                <div className="mt-2 pt-2 border-t">
                  <p className="text-sm font-medium text-destructive mb-1">
                    {t("errors")}
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {result.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleImport}>
              {t("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-white">
              {t("deleteButton")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
