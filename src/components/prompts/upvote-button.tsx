"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowBigUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UpvoteButtonProps {
  promptId: string;
  initialVoted: boolean;
  initialCount: number;
  isLoggedIn: boolean;
  size?: "sm" | "default";
  showLabel?: boolean;
}

export function UpvoteButton({ 
  promptId, 
  initialVoted, 
  initialCount, 
  isLoggedIn,
  size = "default",
  showLabel = false
}: UpvoteButtonProps) {
  const t = useTranslations("vote");
  const tCommon = useTranslations("common");
  const [isVoted, setIsVoted] = useState(initialVoted);
  const [voteCount, setVoteCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleVote = async () => {
    if (!isLoggedIn) {
      toast.error(t("loginToVote"));
      return;
    }

    setIsLoading(true);

    try {
      const method = isVoted ? "DELETE" : "POST";
      const response = await fetch(`/api/prompts/${promptId}/vote`, {
        method,
      });

      if (!response.ok) {
        throw new Error("Failed to vote");
      }

      const data = await response.json();
      setIsVoted(data.voted);
      setVoteCount(data.voteCount);
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setIsLoading(false);
    }
  };

  if (size === "sm") {
    return (
      <button
        onClick={handleVote}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-0.5 text-xs transition-colors",
          isVoted ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <ArrowBigUp className={cn("h-4 w-4", isVoted && "fill-current")} />
        )}
        <span>{voteCount}</span>
      </button>
    );
  }

  return (
    <Button
      variant={isVoted ? "default" : "outline"}
      size="sm"
      onClick={handleVote}
      disabled={isLoading}
      className="gap-1.5"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <ArrowBigUp className={cn("h-4 w-4", isVoted && "fill-current")} />
      )}
      <span>{voteCount}{showLabel && ` ${voteCount === 1 ? t("upvote") : t("upvotes")}`}</span>
    </Button>
  );
}
