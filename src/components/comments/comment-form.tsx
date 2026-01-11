"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { analyticsComment } from "@/lib/analytics";

interface CommentFormProps {
  promptId: string;
  parentId?: string;
  isLoggedIn: boolean;
  onCommentAdded: (comment: Comment) => void;
  onCancel?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId: string | null;
  flagged: boolean;
  author: {
    id: string;
    name: string | null;
    username: string;
    avatar: string | null;
    role: string;
  };
  score: number;
  userVote: number;
  replyCount: number;
}

export function CommentForm({
  promptId,
  parentId,
  isLoggedIn,
  onCommentAdded,
  onCancel,
  placeholder,
  autoFocus = false,
}: CommentFormProps) {
  const t = useTranslations("comments");
  const tCommon = useTranslations("common");
  const tVote = useTranslations("vote");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (!content.trim()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/prompts/${promptId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), parentId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to post comment");
      }

      const data = await response.json();
      onCommentAdded(data.comment);
      setContent("");
      analyticsComment.post(promptId, !!parentId);
      toast.success(t("commentPosted"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : tCommon("error"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholder || t("writeComment")}
          className="min-h-[80px] resize-none"
          autoFocus={autoFocus}
          disabled={isLoading}
        />
        <div className="flex items-center gap-2 justify-end">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={isLoading}
            >
              {tCommon("cancel")}
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={isLoading || !content.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("posting")}
              </>
            ) : (
              parentId ? t("reply") : t("postComment")
            )}
          </Button>
        </div>
      </form>

      <Dialog open={showLoginModal} onOpenChange={setShowLoginModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{tVote("loginRequired")}</DialogTitle>
            <DialogDescription>
              {t("loginToComment")}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowLoginModal(false)}>
              {tCommon("cancel")}
            </Button>
            <Button asChild>
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-2" />
                {tVote("goToLogin")}
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
