"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "@/lib/date";
import { MoreHorizontal, Shield, User, Trash2, BadgeCheck } from "lucide-react";
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

interface User {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatar: string | null;
  role: "ADMIN" | "USER";
  verified: boolean;
  createdAt: Date;
  _count: {
    prompts: number;
  };
}

interface UsersTableProps {
  users: User[];
}

export function UsersTable({ users }: UsersTableProps) {
  const router = useRouter();
  const t = useTranslations("admin.users");
  const locale = useLocale();
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      router.refresh();
    } catch {
      toast.error(t("verifyFailed"));
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
      router.refresh();
    } catch {
      toast.error(t("deleteFailed"));
    } finally {
      setLoading(false);
      setDeleteUserId(null);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">{t("title")}</h3>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      <div className="rounded-md border">
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
                  {formatDistanceToNow(user.createdAt, locale)}
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
    </>
  );
}
