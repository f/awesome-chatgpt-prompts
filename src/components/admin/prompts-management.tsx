"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Upload, Trash2, Loader2, CheckCircle, AlertCircle, Sparkles, Download, RefreshCw, Link2, Search, ExternalLink, Eye, EyeOff, Star, Flag, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useBranding } from "@/components/providers/branding-provider";

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  total: number;
  errors: string[];
}

interface ProgressState {
  current: number;
  total: number;
  success: number;
  failed: number;
}

interface PromptAuthor {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
}

interface PromptCategory {
  id: string;
  name: string;
  slug: string;
}

interface AdminPrompt {
  id: string;
  title: string;
  slug: string | null;
  type: string;
  isPrivate: boolean;
  isUnlisted: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  author: PromptAuthor;
  category: PromptCategory | null;
  _count: {
    votes: number;
    reports: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface PromptsManagementProps {
  aiSearchEnabled: boolean;
  promptsWithoutEmbeddings: number;
  totalPublicPrompts: number;
  promptsWithoutSlugs: number;
  totalPrompts: number;
}

export function PromptsManagement({ aiSearchEnabled, promptsWithoutEmbeddings, totalPublicPrompts, promptsWithoutSlugs, totalPrompts }: PromptsManagementProps) {
  const router = useRouter();
  const t = useTranslations("admin");
  const tCommon = useTranslations("common");
  const branding = useBranding();
  
  // Disable import/delete community prompts on main site (not clones)
  const canModifyCommunityPrompts = branding.useCloneBranding;
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generatingSlugs, setGeneratingSlugs] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [embeddingResult, setEmbeddingResult] = useState<{ success: number; failed: number } | null>(null);
  const [embeddingProgress, setEmbeddingProgress] = useState<ProgressState | null>(null);
  const [slugResult, setSlugResult] = useState<{ success: number; failed: number } | null>(null);
  const [slugProgress, setSlugProgress] = useState<ProgressState | null>(null);
  const [generatingRelated, setGeneratingRelated] = useState(false);
  const [relatedResult, setRelatedResult] = useState<{ success: number; failed: number } | null>(null);
  const [relatedProgress, setRelatedProgress] = useState<ProgressState | null>(null);

  // Prompts list state
  const [prompts, setPrompts] = useState<AdminPrompt[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<AdminPrompt | null>(null);
  const [deletingPrompt, setDeletingPrompt] = useState(false);
  const [promptFilter, setPromptFilter] = useState("all");

  const fetchPrompts = useCallback(async (page: number, search: string, filter: string) => {
    setLoadingPrompts(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        ...(search && { search }),
        ...(filter !== "all" && { filter }),
      });
      const res = await fetch(`/api/admin/prompts?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch prompts");
      }

      setPrompts(data.prompts);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch prompts");
    } finally {
      setLoadingPrompts(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts(currentPage, searchQuery, promptFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, promptFilter, fetchPrompts]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPrompts(1, searchQuery, promptFilter);
  };

  const handleFilterChange = (value: string) => {
    setPromptFilter(value);
    setCurrentPage(1);
  };

  const handleDeletePrompt = async () => {
    if (!promptToDelete) return;

    setDeletingPrompt(true);
    try {
      const res = await fetch(`/api/admin/prompts/${promptToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete prompt");
      }

      toast.success(t("promptsList.deleted"));
      setPromptToDelete(null);
      fetchPrompts(currentPage, searchQuery, promptFilter);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete prompt");
    } finally {
      setDeletingPrompt(false);
    }
  };

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

  const handleGenerateEmbeddings = async (regenerate: boolean = false) => {
    setGenerating(true);
    setEmbeddingResult(null);
    setEmbeddingProgress(null);

    try {
      const url = regenerate ? "/api/admin/embeddings?regenerate=true" : "/api/admin/embeddings";
      const res = await fetch(url, { method: "POST" });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate embeddings");
      }

      // Read the stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split("\n\n").filter(line => line.startsWith("data: "));
        
        for (const line of lines) {
          const jsonStr = line.replace("data: ", "");
          try {
            const data = JSON.parse(jsonStr);
            
            if (data.done) {
              setEmbeddingResult({ success: data.success, failed: data.failed });
              toast.success(t("prompts.embeddingsSuccess", { count: data.success }));
              router.refresh();
            } else {
              setEmbeddingProgress({
                current: data.current,
                total: data.total,
                success: data.success,
                failed: data.failed,
              });
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate embeddings");
    } finally {
      setGenerating(false);
      setEmbeddingProgress(null);
    }
  };

  const handleExport = () => {
    // Direct link to public prompts.csv endpoint
    window.open("/prompts.csv", "_blank");
    toast.success(t("prompts.exportSuccess"));
  };

  const handleGenerateRelatedPrompts = async () => {
    setGeneratingRelated(true);
    setRelatedResult(null);
    setRelatedProgress(null);

    try {
      const res = await fetch("/api/admin/related-prompts", { method: "POST" });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate related prompts");
      }

      // Read the stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split("\n\n").filter(line => line.startsWith("data: "));
        
        for (const line of lines) {
          const jsonStr = line.replace("data: ", "");
          try {
            const data = JSON.parse(jsonStr);
            
            if (data.done) {
              setRelatedResult({ success: data.success, failed: data.failed });
              toast.success(t("prompts.relatedSuccess", { count: data.success }));
              router.refresh();
            } else {
              setRelatedProgress({
                current: data.current,
                total: data.total,
                success: data.success,
                failed: data.failed,
              });
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate related prompts");
    } finally {
      setGeneratingRelated(false);
      setRelatedProgress(null);
    }
  };

  const handleGenerateSlugs = async (regenerate: boolean = false) => {
    setGeneratingSlugs(true);
    setSlugResult(null);
    setSlugProgress(null);

    try {
      const url = regenerate ? "/api/admin/slugs?regenerate=true" : "/api/admin/slugs";
      const res = await fetch(url, { method: "POST" });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate slugs");
      }

      // Read the stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const text = decoder.decode(value);
        const lines = text.split("\n\n").filter(line => line.startsWith("data: "));
        
        for (const line of lines) {
          const jsonStr = line.replace("data: ", "");
          try {
            const data = JSON.parse(jsonStr);
            
            if (data.done) {
              setSlugResult({ success: data.success, failed: data.failed });
              toast.success(t("prompts.slugsSuccess", { count: data.success }));
              router.refresh();
            } else {
              setSlugProgress({
                current: data.current,
                total: data.total,
                success: data.success,
                failed: data.failed,
              });
            }
          } catch {
            // Ignore parse errors
          }
        }
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to generate slugs");
    } finally {
      setGeneratingSlugs(false);
      setSlugProgress(null);
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

      <div className="rounded-md border p-3 sm:p-4 space-y-3">
        {/* Import Row */}
        {canModifyCommunityPrompts && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <span className="text-sm text-muted-foreground flex-1">{t("import.fileInfo")}</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowConfirm(true)}
                disabled={loading || deleting || generating}
                className="flex-1 sm:flex-none"
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
          </div>
        )}

        {/* Export Row */}
        <div className={`flex flex-col sm:flex-row sm:items-center gap-2 ${canModifyCommunityPrompts ? "pt-3 border-t" : ""}`}>
          <span className="text-sm text-muted-foreground flex-1">{t("prompts.exportInfo")}</span>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExport}
            disabled={loading || deleting || generating}
            className="w-full sm:w-auto"
          >
            <Download className="h-4 w-4 mr-2" />{t("prompts.export")}
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t">
              <span className="text-sm text-muted-foreground flex-1">
                {t("aiSearch.title")} <span className="tabular-nums">({promptsWithoutEmbeddings} {t("prompts.pending")})</span>
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateEmbeddings(false)}
                  disabled={loading || deleting || generating || promptsWithoutEmbeddings === 0}
                  className="flex-1 sm:flex-none"
                >
                  {generating && !embeddingProgress ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : generating && embeddingProgress ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" />{embeddingProgress.current}/{embeddingProgress.total}</>
                  ) : (
                    <><Sparkles className="h-4 w-4 mr-2" /><span className="hidden xs:inline">{t("prompts.generateEmbeddings")}</span><span className="xs:hidden">Generate</span></>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleGenerateEmbeddings(true)}
                  disabled={loading || deleting || generating || totalPublicPrompts === 0}
                  title={t("prompts.regenerateEmbeddings")}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            {embeddingProgress && (
              <div className="space-y-2">
                <Progress value={Math.round((embeddingProgress.current / embeddingProgress.total) * 100)} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{embeddingProgress.current} / {embeddingProgress.total}</span>
                  <span>{Math.round((embeddingProgress.current / embeddingProgress.total) * 100)}%</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-green-600">✓ {embeddingProgress.success}</span>
                  {embeddingProgress.failed > 0 && <span className="text-red-600">✗ {embeddingProgress.failed}</span>}
                </div>
              </div>
            )}

            {embeddingResult && !embeddingProgress && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {embeddingResult.failed === 0 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                <span>{t("prompts.embeddingsResult", { success: embeddingResult.success, failed: embeddingResult.failed })}</span>
              </div>
            )}
          </>
        )}

        {/* URL Slugs Row */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t">
          <span className="text-sm text-muted-foreground flex-1">
            {t("prompts.slugsTitle")} <span className="tabular-nums">({promptsWithoutSlugs} {t("prompts.pending")})</span>
          </span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleGenerateSlugs(false)}
              disabled={loading || deleting || generating || generatingSlugs || promptsWithoutSlugs === 0}
              className="flex-1 sm:flex-none"
            >
              {generatingSlugs && !slugProgress ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : generatingSlugs && slugProgress ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" />{slugProgress.current}/{slugProgress.total}</>
              ) : (
                <><Link2 className="h-4 w-4 mr-2" />{t("prompts.generateSlugs")}</>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleGenerateSlugs(true)}
              disabled={loading || deleting || generating || generatingSlugs || totalPrompts === 0}
              title={t("prompts.regenerateSlugs")}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Slug Progress bar */}
        {slugProgress && (
          <div className="space-y-2">
            <Progress value={Math.round((slugProgress.current / slugProgress.total) * 100)} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{slugProgress.current} / {slugProgress.total}</span>
              <span>{Math.round((slugProgress.current / slugProgress.total) * 100)}%</span>
            </div>
            <div className="flex gap-4 text-xs">
              <span className="text-green-600">✓ {slugProgress.success}</span>
              {slugProgress.failed > 0 && <span className="text-red-600">✗ {slugProgress.failed}</span>}
            </div>
          </div>
        )}

        {slugResult && !slugProgress && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {slugResult.failed === 0 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
            <span>{t("prompts.slugsResult", { success: slugResult.success, failed: slugResult.failed })}</span>
          </div>
        )}

        {/* Related Prompts Row */}
        {aiSearchEnabled && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-3 border-t">
              <span className="text-sm text-muted-foreground flex-1">
                {t("prompts.relatedTitle")}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerateRelatedPrompts}
                disabled={loading || deleting || generating || generatingSlugs || generatingRelated}
                className="w-full sm:w-auto"
              >
                {generatingRelated && !relatedProgress ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : generatingRelated && relatedProgress ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />{relatedProgress.current}/{relatedProgress.total}</>
                ) : (
                  <><Sparkles className="h-4 w-4 mr-2" />{t("prompts.regenerateRelated")}</>
                )}
              </Button>
            </div>

            {/* Related Progress bar */}
            {relatedProgress && (
              <div className="space-y-2">
                <Progress value={Math.round((relatedProgress.current / relatedProgress.total) * 100)} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{relatedProgress.current} / {relatedProgress.total}</span>
                  <span>{Math.round((relatedProgress.current / relatedProgress.total) * 100)}%</span>
                </div>
                <div className="flex gap-4 text-xs">
                  <span className="text-green-600">✓ {relatedProgress.success}</span>
                  {relatedProgress.failed > 0 && <span className="text-red-600">✗ {relatedProgress.failed}</span>}
                </div>
              </div>
            )}

            {relatedResult && !relatedProgress && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {relatedResult.failed === 0 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                <span>{t("prompts.relatedResult", { success: relatedResult.success, failed: relatedResult.failed })}</span>
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

      {/* Prompts List Section */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold">{t("promptsList.title")}</h3>
            <p className="text-sm text-muted-foreground">{t("promptsList.description")}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={promptFilter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("promptsList.filters.all")}</SelectItem>
                <SelectItem value="public">{t("promptsList.filters.public")}</SelectItem>
                <SelectItem value="private">{t("promptsList.filters.private")}</SelectItem>
                <SelectItem value="unlisted">{t("promptsList.filters.unlisted")}</SelectItem>
                <SelectItem value="featured">{t("promptsList.filters.featured")}</SelectItem>
                <SelectItem value="reported">{t("promptsList.filters.reported")}</SelectItem>
                <SelectItem value="deleted">{t("promptsList.filters.deleted")}</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={tCommon("search")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 w-full sm:w-[200px]"
                />
              </div>
              <Button size="icon" variant="outline" onClick={handleSearch} disabled={loadingPrompts}>
                {loadingPrompts ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile-friendly Prompts Cards */}
        <div className="space-y-3">
          {loadingPrompts && prompts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {t("promptsList.noPrompts")}
            </div>
          ) : (
            prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="rounded-lg border bg-card p-4 space-y-3"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium truncate">{prompt.title}</h4>
                      {prompt.isFeatured && (
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />
                      )}
                      {prompt.isPrivate && (
                        <Badge variant="secondary" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          {t("promptsList.private")}
                        </Badge>
                      )}
                      {prompt.isUnlisted && (
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          {t("promptsList.unlisted")}
                        </Badge>
                      )}
                      {prompt._count.reports > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          <Flag className="h-3 w-3 mr-1" />
                          {prompt._count.reports}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {prompt.type} • {prompt.viewCount} {t("promptsList.views")} • {prompt._count.votes} {t("promptsList.votes")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {prompt.id && (
                      <Link href={`/prompts/${prompt.id}`} target="_blank" prefetch={false}>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setPromptToDelete(prompt)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Author & Category Row */}
                <div className="flex items-center justify-between gap-3 text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={prompt.author.avatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {prompt.author.name?.[0] || prompt.author.username[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-muted-foreground truncate">
                      @{prompt.author.username}
                    </span>
                  </div>
                  {prompt.category && (
                    <Badge variant="secondary" className="text-xs truncate max-w-[150px]">
                      {prompt.category.name}
                    </Badge>
                  )}
                </div>

                {/* Date Row */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t("promptsList.created")}: {new Date(prompt.createdAt).toLocaleDateString()}</span>
                  <span className="font-mono text-[10px] opacity-50">{prompt.id.slice(0, 8)}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {t("promptsList.showing", {
                from: (pagination.page - 1) * pagination.limit + 1,
                to: Math.min(pagination.page * pagination.limit, pagination.total),
                total: pagination.total,
              })}
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                disabled={currentPage === 1 || loadingPrompts}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm tabular-nums px-2">
                {currentPage} / {pagination.totalPages}
              </span>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                disabled={currentPage === pagination.totalPages || loadingPrompts}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Single Prompt Confirmation Dialog */}
      <AlertDialog open={!!promptToDelete} onOpenChange={(open) => !open && setPromptToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("promptsList.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("promptsList.deleteConfirmDescription", { title: promptToDelete?.title || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel disabled={deletingPrompt}>{tCommon("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePrompt}
              disabled={deletingPrompt}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {deletingPrompt ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              {tCommon("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
