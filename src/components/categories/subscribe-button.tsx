"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { analyticsCategory } from "@/lib/analytics";

interface SubscribeButtonProps {
  categoryId: string;
  categoryName: string;
  initialSubscribed: boolean;
  iconOnly?: boolean;
  pill?: boolean;
}

export function SubscribeButton({ categoryId, categoryName, initialSubscribed, iconOnly = false, pill = false }: SubscribeButtonProps) {
  const t = useTranslations("subscription");
  const tCommon = useTranslations("common");
  const [isSubscribed, setIsSubscribed] = useState(initialSubscribed);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);

    try {
      const method = isSubscribed ? "DELETE" : "POST";
      const response = await fetch(`/api/categories/${categoryId}/subscribe`, {
        method,
      });

      if (!response.ok) {
        throw new Error("Failed to update subscription");
      }

      setIsSubscribed(!isSubscribed);
      
      if (isSubscribed) {
        analyticsCategory.unsubscribe(categoryId, categoryName);
      } else {
        analyticsCategory.subscribe(categoryId, categoryName);
      }
      
      toast.success(
        isSubscribed
          ? t("unsubscribedFrom", { name: categoryName })
          : t("subscribedTo", { name: categoryName })
      );
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setIsLoading(false);
    }
  };

  if (iconOnly) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`h-7 w-7 ${isSubscribed ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
        onClick={handleToggle}
        disabled={isLoading}
        title={isSubscribed ? t("unsubscribe") : t("subscribe")}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isSubscribed ? (
          <Bell className="h-3.5 w-3.5 fill-current" />
        ) : (
          <Bell className="h-3.5 w-3.5" />
        )}
      </Button>
    );
  }

  if (pill) {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
          isSubscribed
            ? "bg-primary/10 text-primary hover:bg-primary/20"
            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
        } disabled:opacity-50`}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Bell className={`h-3 w-3 ${isSubscribed ? "fill-current" : ""}`} />
        )}
        {isSubscribed ? t("subscribed") : t("subscribe")}
      </button>
    );
  }

  return (
    <Button
      variant={isSubscribed ? "secondary" : "outline"}
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSubscribed ? (
        <>
          <BellOff className="h-4 w-4 mr-1.5" />
          {t("unsubscribe")}
        </>
      ) : (
        <>
          <Bell className="h-4 w-4 mr-1.5" />
          {t("subscribe")}
        </>
      )}
    </Button>
  );
}
