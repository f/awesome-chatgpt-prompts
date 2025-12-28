"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/date";
import { getPromptUrl } from "@/lib/urls";
import { MoreHorizontal, Check, X, Eye, ExternalLink, RotateCcw, ListPlus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface Report {
  id: string;
  reason: "SPAM" | "INAPPROPRIATE" | "COPYRIGHT" | "MISLEADING" | "RELIST_REQUEST" | "OTHER";
  details: string | null;
  status: "PENDING" | "REVIEWED" | "DISMISSED";
  createdAt: Date;
  prompt: {
    id: string;
    slug?: string | null;
    title: string;
    isUnlisted?: boolean;
    deletedAt?: Date | null;
  };
  reporter: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
  };
}

interface ReportsTableProps {
  reports: Report[];
}

export function ReportsTable({ reports }: ReportsTableProps) {
  const router = useRouter();
  const t = useTranslations("admin.reports");
  const tReport = useTranslations("report");
  const locale = useLocale();
  const [loading, setLoading] = useState<string | null>(null);

  const handleStatusChange = async (reportId: string, status: "REVIEWED" | "DISMISSED") => {
    setLoading(reportId);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast.success(status === "REVIEWED" ? t("markedReviewed") : t("dismissed"));
      router.refresh();
    } catch {
      toast.error(t("updateFailed"));
    } finally {
      setLoading(null);
    }
  };

  const handleRelistPrompt = async (promptId: string) => {
    setLoading(promptId);
    try {
      const res = await fetch(`/api/prompts/${promptId}/unlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unlist: false }),
      });

      if (!res.ok) throw new Error("Failed to relist prompt");

      toast.success(t("promptRelisted"));
      router.refresh();
    } catch {
      toast.error(t("relistFailed"));
    } finally {
      setLoading(null);
    }
  };

  const handleRestorePrompt = async (promptId: string) => {
    setLoading(promptId);
    try {
      const res = await fetch(`/api/prompts/${promptId}/restore`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("Failed to restore prompt");

      toast.success(t("promptRestored"));
      router.refresh();
    } catch {
      toast.error(t("restoreFailed"));
    } finally {
      setLoading(null);
    }
  };

  const statusColors = {
    PENDING: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
    REVIEWED: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
    DISMISSED: "bg-muted text-muted-foreground",
  };

  const reasonLabels: Record<string, string> = {
    SPAM: tReport("reasons.spam"),
    INAPPROPRIATE: tReport("reasons.inappropriate"),
    COPYRIGHT: tReport("reasons.copyright"),
    MISLEADING: tReport("reasons.misleading"),
    RELIST_REQUEST: tReport("reasons.relistRequest"),
    OTHER: tReport("reasons.other"),
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{t("title")}</h3>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-md">
          {t("noReports")}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("prompt")}</TableHead>
                <TableHead>{t("reason")}</TableHead>
                <TableHead>{t("reportedBy")}</TableHead>
                <TableHead>{t("status")}</TableHead>
                <TableHead>{t("date")}</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Link 
                      href={getPromptUrl(report.prompt.id, report.prompt.slug)}
                      prefetch={false}
                      className="font-medium hover:underline flex items-center gap-1"
                    >
                      {report.prompt.title}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="outline">{reasonLabels[report.reason]}</Badge>
                      {report.details && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px] truncate">
                          {report.details}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={report.reporter.avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {report.reporter.name?.charAt(0) || report.reporter.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">@{report.reporter.username}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={statusColors[report.status]}>
                      {t(`statuses.${report.status.toLowerCase()}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDistanceToNow(report.createdAt, locale)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          disabled={loading === report.id}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={getPromptUrl(report.prompt.id, report.prompt.slug)} prefetch={false}>
                            <Eye className="h-4 w-4 mr-2" />
                            {t("viewPrompt")}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {report.status === "PENDING" && (
                          <>
                            <DropdownMenuItem onClick={() => handleStatusChange(report.id, "REVIEWED")}>
                              <Check className="h-4 w-4 mr-2" />
                              {t("markReviewed")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleStatusChange(report.id, "DISMISSED")}>
                              <X className="h-4 w-4 mr-2" />
                              {t("dismiss")}
                            </DropdownMenuItem>
                          </>
                        )}
                        {report.status !== "PENDING" && (
                          <DropdownMenuItem 
                            onClick={() => handleStatusChange(report.id, "REVIEWED")}
                            disabled={report.status === "REVIEWED"}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            {t("markReviewed")}
                          </DropdownMenuItem>
                        )}
                        {report.reason === "RELIST_REQUEST" && report.prompt.isUnlisted && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleRelistPrompt(report.prompt.id)}>
                              <ListPlus className="h-4 w-4 mr-2" />
                              {t("relistPrompt")}
                            </DropdownMenuItem>
                          </>
                        )}
                        {report.prompt.deletedAt && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleRestorePrompt(report.prompt.id)}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              {t("restorePrompt")}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
