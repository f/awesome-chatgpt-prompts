"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { MessageSquare, Loader2 } from "lucide-react";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";
import { toast } from "sonner";

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

interface CommentSectionProps {
  promptId: string;
  currentUserId?: string;
  isAdmin: boolean;
  isLoggedIn: boolean;
  locale: string;
}

export function CommentSection({
  promptId,
  currentUserId,
  isAdmin,
  isLoggedIn,
  locale,
}: CommentSectionProps) {
  const t = useTranslations("comments");
  const tCommon = useTranslations("common");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [promptId]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/prompts/${promptId}/comments`);
      if (!response.ok) {
        throw new Error("Failed to fetch comments");
      }
      const data = await response.json();
      setComments(data.comments);
    } catch {
      toast.error(tCommon("error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommentAdded = (comment: Comment) => {
    setComments((prev) => [...prev, comment]);
  };

  const handleCommentDeleted = (commentId: string) => {
    // Remove the comment and all its replies recursively
    const getDescendantIds = (id: string): string[] => {
      const directReplies = comments.filter((c) => c.parentId === id);
      return [
        id,
        ...directReplies.flatMap((reply) => getDescendantIds(reply.id)),
      ];
    };
    const idsToRemove = getDescendantIds(commentId);
    setComments((prev) => prev.filter((c) => !idsToRemove.includes(c.id)));
  };

  const handleCommentUpdated = (updatedComment: Comment) => {
    setComments((prev) =>
      prev.map((c) => (c.id === updatedComment.id ? updatedComment : c))
    );
  };

  // Get root comments (no parent)
  const rootComments = comments.filter((c) => !c.parentId);

  // Sort comments: by score (descending), then by date (ascending for older first)
  const sortedRootComments = [...rootComments].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div className="mt-8 border-t pt-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-lg font-semibold">
          {t("comments")} ({comments.length})
        </h2>
      </div>

      {/* New comment form */}
      <div className="mb-6">
        <CommentForm
          promptId={promptId}
          isLoggedIn={isLoggedIn}
          onCommentAdded={handleCommentAdded}
        />
      </div>

      {/* Comments list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          {t("noComments")}
        </p>
      ) : (
        <div className="divide-y">
          {sortedRootComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              promptId={promptId}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              isLoggedIn={isLoggedIn}
              locale={locale}
              replies={comments.filter((c) => c.parentId === comment.id)}
              allComments={comments}
              onCommentAdded={handleCommentAdded}
              onCommentDeleted={handleCommentDeleted}
              onCommentUpdated={handleCommentUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
}
