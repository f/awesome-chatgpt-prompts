"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";
import { Bell, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "@/lib/date";

interface CommentNotification {
  id: string;
  type: "COMMENT" | "REPLY";
  createdAt: string;
  actor: {
    id: string;
    name: string | null;
    username: string;
    avatar: string | null;
  } | null;
  promptId: string | null;
  promptTitle: string | null;
}

interface Notifications {
  pendingChangeRequests: number;
  unreadComments: number;
  commentNotifications: CommentNotification[];
}

export function NotificationBell() {
  const { data: session } = useSession();
  const t = useTranslations("notifications");
  const locale = useLocale();
  const [notifications, setNotifications] = useState<Notifications>({ 
    pendingChangeRequests: 0,
    unreadComments: 0,
    commentNotifications: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!session?.user) {
      setIsLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/user/notifications");
        if (response.ok) {
          const data = await response.json();
          setNotifications(data);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [session?.user]);

  if (!session?.user || isLoading) {
    return null;
  }

  const totalCount = notifications.pendingChangeRequests + notifications.unreadComments;

  const handleMarkAsRead = async (notificationIds?: string[]) => {
    try {
      await fetch("/api/user/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds }),
      });
      // Refresh notifications
      const response = await fetch("/api/user/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  if (totalCount === 0) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8 relative" asChild>
        <Link href={`/@${session.user.username}`}>
          <Bell className="h-4 w-4" />
        </Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 relative">
          <Bell className="h-4 w-4" />
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-medium flex items-center justify-center">
            {totalCount > 9 ? "9+" : totalCount}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>{t("title")}</span>
          {totalCount > 0 && (
            <button
              onClick={() => handleMarkAsRead()}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {t("markAllRead")}
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.pendingChangeRequests > 0 && (
          <DropdownMenuItem asChild>
            <Link href={`/@${session.user.username}?tab=changes`} className="flex items-center justify-between">
              <span>{t("pendingChangeRequests")}</span>
              <span className="ml-2 h-5 min-w-5 px-1 rounded-full bg-red-500 text-white text-xs font-medium flex items-center justify-center">
                {notifications.pendingChangeRequests}
              </span>
            </Link>
          </DropdownMenuItem>
        )}
        {notifications.commentNotifications.length > 0 && (
          <>
            {notifications.pendingChangeRequests > 0 && <DropdownMenuSeparator />}
            {notifications.commentNotifications.map((notification) => (
              <DropdownMenuItem key={notification.id} asChild>
                <Link 
                  href={`/prompts/${notification.promptId}`}
                  onClick={() => handleMarkAsRead([notification.id])}
                  className="flex items-start gap-3 py-2"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={notification.actor?.avatar || undefined} />
                    <AvatarFallback className="text-xs">
                      {notification.actor?.name?.charAt(0) || notification.actor?.username?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-tight">
                      <span className="font-medium">@{notification.actor?.username}</span>
                      {" "}
                      {notification.type === "COMMENT" 
                        ? t("commentedOnPrompt")
                        : t("repliedToComment")}
                    </p>
                    {notification.promptTitle && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {notification.promptTitle}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(notification.createdAt), locale)}
                    </p>
                  </div>
                  <MessageSquare className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              </DropdownMenuItem>
            ))}
          </>
        )}
        {totalCount === 0 && (
          <div className="py-4 text-center text-sm text-muted-foreground">
            {t("noNotifications")}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
