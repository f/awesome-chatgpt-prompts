"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "@/lib/date";
import { ArrowBigUp, Lock, Copy, ImageIcon, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CodeView } from "@/components/ui/code-view";
import { toast } from "sonner";
import { prettifyJson } from "@/lib/format";
import { PinButton } from "@/components/prompts/pin-button";
import { RunPromptButton } from "@/components/prompts/run-prompt-button";
import { VariableFillModal, hasVariables, renderContentWithVariables } from "@/components/prompts/variable-fill-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface PromptCardProps {
  prompt: {
    id: string;
    title: string;
    description: string | null;
    content: string;
    type: string;
    structuredFormat?: string | null;
    mediaUrl: string | null;
    isPrivate: boolean;
    voteCount: number;
    createdAt: Date;
    author: {
      id: string;
      name: string | null;
      username: string;
      avatar: string | null;
    };
    contributorCount?: number;
    contributors?: Array<{
      id: string;
      username: string;
      name: string | null;
      avatar: string | null;
    }>;
    category: {
      id: string;
      name: string;
      slug: string;
    } | null;
    tags: Array<{
      tag: {
        id: string;
        name: string;
        slug: string;
        color: string;
      };
    }>;
  };
  showPinButton?: boolean;
  isPinned?: boolean;
}

export function PromptCard({ prompt, showPinButton = false, isPinned = false }: PromptCardProps) {
  const t = useTranslations("prompts");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"copy" | "run">("copy");
  const [imageError, setImageError] = useState(false);

  const hasMediaBackground = prompt.type === "IMAGE" || (prompt.type === "STRUCTURED" && !!prompt.mediaUrl);
  const contentHasVariables = hasVariables(prompt.content);

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success(tCommon("copiedToClipboard"));
  };

  const handleCopyClick = () => {
    if (contentHasVariables) {
      setModalMode("copy");
      setModalOpen(true);
    } else {
      copyToClipboard(prompt.content);
    }
  };

  const handleRunClick = () => {
    setModalMode("run");
    setModalOpen(true);
  };

  return (
    <div 
      className={`group border rounded-[var(--radius)] overflow-hidden hover:border-foreground/20 transition-colors flex flex-col ${hasMediaBackground ? "" : "p-4"}`}
    >
      {/* Image Background for IMAGE type or STRUCTURED with media */}
      {hasMediaBackground && (
        <div className="relative h-32 bg-muted">
          {prompt.mediaUrl && !imageError ? (
            <Image
              src={prompt.mediaUrl}
              alt={prompt.title}
              fill
              className="object-cover"
              unoptimized
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          {/* Badges overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm">
              {t(`types.${prompt.type.toLowerCase()}`)}
            </Badge>
          </div>
        </div>
      )}

      <div className={hasMediaBackground ? "p-3 flex-1 flex flex-col" : "flex-1 flex flex-col"}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {prompt.isPrivate && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
            <Link href={`/prompts/${prompt.id}`} className="font-medium text-sm hover:underline line-clamp-1">
              {prompt.title}
            </Link>
          </div>
          {!hasMediaBackground && (
            <Badge variant="outline" className="text-[10px] shrink-0">
              {t(`types.${prompt.type.toLowerCase()}`)}
            </Badge>
          )}
        </div>

        {/* Description */}
        {prompt.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{prompt.description}</p>
        )}

        {/* Content Preview - smaller for image prompts */}
        <div className="relative flex-1 mb-3 min-h-0">
          {prompt.type === "STRUCTURED" ? (
            <CodeView 
              content={prompt.structuredFormat?.toLowerCase() === "json" ? prettifyJson(prompt.content) : prompt.content} 
              language={(prompt.structuredFormat?.toLowerCase() as "json" | "yaml") || "json"}
              maxLines={hasMediaBackground ? 3 : 10}
              fontSize="xs"
            />
          ) : (
            <pre className={`text-xs text-muted-foreground bg-muted p-2 rounded overflow-hidden font-mono h-full whitespace-pre-wrap break-words ${hasMediaBackground ? "line-clamp-2" : "line-clamp-4"}`}>
              {contentHasVariables ? renderContentWithVariables(prompt.content) : prompt.content}
            </pre>
          )}
          {showPinButton && (
            <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              <PinButton promptId={prompt.id} initialPinned={isPinned} iconOnly />
            </div>
          )}
        </div>

        {/* Variable fill modal */}
        {contentHasVariables && (
          <VariableFillModal
            content={prompt.content}
            open={modalOpen}
            onOpenChange={setModalOpen}
            mode={modalMode}
          />
        )}

        {/* Tags */}
        {prompt.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {prompt.tags.slice(0, 3).map(({ tag }) => (
              <Link 
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="px-1.5 py-0.5 rounded text-[10px] hover:opacity-80 transition-opacity" 
                style={{ backgroundColor: tag.color + "15", color: tag.color }}
              >
                {tag.name}
              </Link>
            ))}
            {prompt.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{prompt.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t mt-auto">
          <div className="flex items-center gap-1.5">
            <Link href={`/@${prompt.author.username}`} className="hover:text-foreground flex items-center gap-1.5">
              <Avatar className="h-4 w-4">
                <AvatarImage src={prompt.author.avatar || undefined} alt={prompt.author.username} />
                <AvatarFallback className="text-[8px]">{prompt.author.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              @{prompt.author.username}
            </Link>
            {prompt.contributors && prompt.contributors.length > 0 ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-default hover:text-foreground">+{prompt.contributors.length}</span>
                </TooltipTrigger>
                <TooltipContent side="top" className="p-2">
                  <div className="space-y-1">
                    <div className="text-xs font-medium mb-1.5">{t("promptContributors")}</div>
                    {prompt.contributors.map((contributor) => (
                      <Link
                        key={contributor.id}
                        href={`/@${contributor.username}`}
                        className="flex items-center gap-2 hover:underline rounded px-1 py-0.5 -mx-1"
                      >
                        <Avatar className="h-4 w-4">
                          <AvatarImage src={contributor.avatar || undefined} />
                          <AvatarFallback className="text-[8px]">
                            {contributor.name?.charAt(0) || contributor.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs">@{contributor.username}</span>
                      </Link>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            ) : prompt.contributorCount ? (
              <span>+{prompt.contributorCount}</span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              <ArrowBigUp className="h-3.5 w-3.5" />
              {prompt.voteCount}
            </span>
            <button
              onClick={handleCopyClick}
              className="p-1 rounded hover:bg-accent"
            >
              <Copy className="h-3 w-3" />
            </button>
            {contentHasVariables ? (
              <button
                onClick={handleRunClick}
                className="h-6 w-6 rounded hover:bg-accent flex items-center justify-center"
              >
                <Play className="h-4 w-4" />
              </button>
            ) : (
              <RunPromptButton 
                content={prompt.content} 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6" 
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
