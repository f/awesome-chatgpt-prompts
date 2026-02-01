"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface UserExample {
  id: string;
  mediaUrl: string;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
  };
}

interface UserExamplesGalleryProps {
  promptId: string;
  promptType: string;
  currentUserId?: string;
  isAdmin?: boolean;
  onSelectExample?: (example: UserExample | null) => void;
  refreshTrigger?: number;
  renderAddButton?: (asThumbnail: boolean) => React.ReactNode;
}

export function UserExamplesGallery({
  promptId,
  promptType,
  currentUserId,
  isAdmin,
  onSelectExample,
  refreshTrigger = 0,
  renderAddButton,
}: UserExamplesGalleryProps) {
  const t = useTranslations("userExamples");
  const [examples, setExamples] = useState<UserExample[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchExamples = async () => {
    try {
      const res = await fetch(`/api/prompts/${promptId}/examples`);
      if (res.ok) {
        const data = await res.json();
        setExamples(data.examples);
      }
    } catch (error) {
      console.error("Failed to fetch examples:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExamples();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promptId, refreshTrigger]);

  const handleSelect = (example: UserExample) => {
    if (selectedId === example.id) {
      setSelectedId(null);
      onSelectExample?.(null);
    } else {
      setSelectedId(example.id);
      onSelectExample?.(example);
    }
  };

  const handleDelete = async (exampleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(exampleId);

    try {
      const res = await fetch(`/api/prompts/${promptId}/examples?exampleId=${exampleId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setExamples((prev) => prev.filter((ex) => ex.id !== exampleId));
        if (selectedId === exampleId) {
          setSelectedId(null);
          onSelectExample?.(null);
        }
      }
    } catch (error) {
      console.error("Failed to delete example:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (examples.length === 0) {
    return renderAddButton ? <>{renderAddButton(false)}</> : null;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{t("communityExamples")}</p>
      <div className="flex flex-wrap gap-2">
        {examples.map((example) => {
          const canDelete = currentUserId === example.user.id || isAdmin;
          const isSelected = selectedId === example.id;

          return (
            <Tooltip key={example.id}>
              <TooltipTrigger asChild>
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelect(example)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleSelect(example);
                    }
                  }}
                  className={cn(
                    "relative group rounded-lg overflow-hidden border-2 transition-all cursor-pointer",
                    "w-16 h-16 sm:w-20 sm:h-20",
                    isSelected
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-transparent hover:border-muted-foreground/30"
                  )}
                >
                  {promptType === "VIDEO" ? (
                    <video
                      src={example.mediaUrl}
                      className="w-full h-full object-cover"
                      muted
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={example.mediaUrl}
                      alt={example.comment || t("userExample")}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                    <div className="flex items-center gap-1">
                      <Avatar className="h-4 w-4 border border-white/50 shrink-0">
                        <AvatarImage src={example.user.avatar || undefined} />
                        <AvatarFallback className="text-[6px] bg-primary text-primary-foreground">
                          {example.user.name?.charAt(0) || example.user.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[8px] text-white/90 truncate font-medium">
                        @{example.user.username}
                      </span>
                    </div>
                  </div>
                  {canDelete && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDelete(example.id, e)}
                      disabled={deletingId === example.id}
                    >
                      {deletingId === example.id ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Trash2 className="h-3 w-3" />
                      )}
                    </Button>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs">
                <div className="space-y-1">
                  <p className="text-xs font-medium">@{example.user.username}</p>
                  {example.comment && (
                    <p className="text-xs text-muted-foreground">{example.comment}</p>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
        {renderAddButton && renderAddButton(true)}
      </div>
    </div>
  );
}
