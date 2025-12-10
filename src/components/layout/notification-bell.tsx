"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Notifications {
  pendingChangeRequests: number;
}

export function NotificationBell() {
  const { data: session } = useSession();
  const t = useTranslations("notifications");
  const [notifications, setNotifications] = useState<Notifications>({ pendingChangeRequests: 0 });
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
    
    // Refresh every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [session?.user]);

  if (!session?.user || isLoading) {
    return null;
  }

  const totalCount = notifications.pendingChangeRequests;

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
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel>{t("title")}</DropdownMenuLabel>
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
