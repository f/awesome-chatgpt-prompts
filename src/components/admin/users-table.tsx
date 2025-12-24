"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "@/lib/date";
import { MoreHorizontal, Shield, User, Trash2, BadgeCheck, Search, Loader2, ChevronLeft, ChevronRight, Filter, Flag, AlertTriangle, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface UserData {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatar: string | null;
  role: "ADMIN" | "USER";
  verified: boolean;
  flagged: boolean;
  flaggedAt: string | null;
  flaggedReason: string | null;
  dailyGenerationLimit: number;
  generationCreditsRemaining: number;
  createdAt: string;
  _count: {
    prompts: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function UsersTable() {
  const router = useRouter();
  const t = useTranslations("admin.users");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [editCreditsUser, setEditCreditsUser] = useState<UserData | null>(null);
  const [newCreditLimit, setNewCreditLimit] = useState("");
  const [loading, setLoading] = useState(false);

  // Pagination and search state
  const [users, setUsers] = useState<UserData[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userFilter, setUserFilter] = useState("all");

  const fetchUsers = useCallback(async (page: number, search: string, filter: string) => {
    setLoadingUsers(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
        ...(search && { search }),
        ...(filter !== "all" && { filter }),
      });
      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch users");
      }

      setUsers(data.users);
      setPagination(data.pagination);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to fetch users");
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(currentPage, searchQuery, userFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, userFilter, fetchUsers]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers(1, searchQuery, userFilter);
  };

  const handleFilterChange = (value: string) => {
    setUserFilter(value);
    setCurrentPage(1);
  };

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "USER") => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("Failed to update role");

      toast.success(t("roleUpdated"));
      router.refresh();
    } catch {
      toast.error(t("roleUpdateFailed"));
    }
  };

  const handleVerifyToggle = async (userId: string, verified: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified }),
      });

      if (!res.ok) throw new Error("Failed to update verification");

      toast.success(verified ? t("verified") : t("unverified"));
      fetchUsers(currentPage, searchQuery, userFilter);
      router.refresh();
    } catch {
      toast.error(t("verifyFailed"));
    }
  };

  const handleFlagToggle = async (userId: string, flagged: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flagged, flaggedReason: flagged ? "Unusual activity" : null }),
      });

      if (!res.ok) throw new Error("Failed to update flag status");

      toast.success(flagged ? t("flagged") : t("unflagged"));
      fetchUsers(currentPage, searchQuery, userFilter);
      router.refresh();
    } catch {
      toast.error(t("flagFailed"));
    }
  };

  const handleDelete = async () => {
    if (!deleteUserId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${deleteUserId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete user");

      toast.success(t("deleted"));
      fetchUsers(currentPage, searchQuery, userFilter);
      router.refresh();
    } catch {
      toast.error(t("deleteFailed"));
    } finally {
      setLoading(false);
      setDeleteUserId(null);
    }
  };

  const handleEditCredits = (user: UserData) => {
    setEditCreditsUser(user);
    setNewCreditLimit(user.dailyGenerationLimit.toString());
  };

  const handleSaveCredits = async () => {
    if (!editCreditsUser) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${editCreditsUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dailyGenerationLimit: newCreditLimit }),
      });

      if (!res.ok) throw new Error("Failed to update credits");

      toast.success(t("creditsUpdated"));
      fetchUsers(currentPage, searchQuery, userFilter);
      router.refresh();
    } catch {
      toast.error(t("creditsUpdateFailed"));
    } finally {
      setLoading(false);
      setEditCreditsUser(null);
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div>
          <h3 className="text-lg font-semibold">{t("title")}</h3>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={userFilter} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("filters.all")}</SelectItem>
              <SelectItem value="admin">{t("filters.admin")}</SelectItem>
              <SelectItem value="user">{t("filters.user")}</SelectItem>
              <SelectItem value="verified">{t("filters.verified")}</SelectItem>
              <SelectItem value="unverified">{t("filters.unverified")}</SelectItem>
              <SelectItem value="flagged">{t("filters.flagged")}</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 w-full sm:w-[200px]"
              />
            </div>
            <Button size="icon" variant="outline" onClick={handleSearch} disabled={loadingUsers}>
              {loadingUsers ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {loadingUsers && users.length === 0 ? (
        <div className="flex items-center justify-center py-12 border rounded-md">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 border rounded-md text-muted-foreground">
          {t("noUsers")}
        </div>
      ) : (
        <>
          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-3">
            {users.map((user) => (
              <div key={user.id} className="rounded-lg border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || user.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium flex items-center gap-1 truncate">
                        {user.name || user.username}
                        {user.verified && <BadgeCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                        {user.flagged && <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />}
                      </div>
                      <div className="text-xs text-muted-foreground">@{user.username}</div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.role === "USER" ? (
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, "ADMIN")}>
                          <Shield className="h-4 w-4 mr-2" />
                          {t("makeAdmin")}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, "USER")}>
                          <User className="h-4 w-4 mr-2" />
                          {t("removeAdmin")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleVerifyToggle(user.id, !user.verified)}>
                        <BadgeCheck className="h-4 w-4 mr-2" />
                        {user.verified ? t("unverify") : t("verify")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFlagToggle(user.id, !user.flagged)}>
                        <Flag className="h-4 w-4 mr-2" />
                        {user.flagged ? t("unflag") : t("flag")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditCredits(user)}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {t("editCredits")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteUserId(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate">{user.email}</span>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="flex-shrink-0">
                    {user.role === "ADMIN" ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                    {user.role}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{user._count.prompts} {t("prompts").toLowerCase()}</span>
                  <span>{formatDistanceToNow(new Date(user.createdAt), locale)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("user")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead className="text-center">{t("prompts")}</TableHead>
              <TableHead>{t("joined")}</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback>
                        {user.name?.charAt(0) || user.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center gap-1">
                        {user.name || user.username}
                        {user.verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                        {user.flagged && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                      </div>
                      <div className="text-xs text-muted-foreground">@{user.username}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                    {user.role === "ADMIN" ? <Shield className="h-3 w-3 mr-1" /> : <User className="h-3 w-3 mr-1" />}
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">{user._count.prompts}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(user.createdAt), locale)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {user.role === "USER" ? (
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, "ADMIN")}>
                          <Shield className="h-4 w-4 mr-2" />
                          {t("makeAdmin")}
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleRoleChange(user.id, "USER")}>
                          <User className="h-4 w-4 mr-2" />
                          {t("removeAdmin")}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => handleVerifyToggle(user.id, !user.verified)}>
                        <BadgeCheck className="h-4 w-4 mr-2" />
                        {user.verified ? t("unverify") : t("verify")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleFlagToggle(user.id, !user.flagged)}>
                        <Flag className="h-4 w-4 mr-2" />
                        {user.flagged ? t("unflag") : t("flag")}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditCredits(user)}>
                        <Sparkles className="h-4 w-4 mr-2" />
                        {t("editCredits")}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteUserId(user.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                {t("showing", {
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
                  disabled={currentPage === 1 || loadingUsers}
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
                  disabled={currentPage === pagination.totalPages || loadingUsers}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Credits Dialog */}
      <AlertDialog open={!!editCreditsUser} onOpenChange={() => setEditCreditsUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("editCreditsTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("editCreditsDescription", { username: editCreditsUser?.username || "" })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("dailyLimit")}</label>
              <Input
                type="number"
                min="0"
                value={newCreditLimit}
                onChange={(e) => setNewCreditLimit(e.target.value)}
                placeholder="10"
              />
              <p className="text-xs text-muted-foreground">
                {t("currentCredits", { 
                  remaining: editCreditsUser?.generationCreditsRemaining ?? 0,
                  limit: editCreditsUser?.dailyGenerationLimit ?? 0
                })}
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveCredits} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {t("save")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
