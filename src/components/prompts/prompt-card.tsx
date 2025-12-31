"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "@/lib/date";
import { getPromptUrl } from "@/lib/urls";
import { ArrowBigUp, Lock, Copy, ImageIcon, Play, BadgeCheck, Volume2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CodeView } from "@/components/ui/code-view";
import { toast } from "sonner";
import { prettifyJson } from "@/lib/format";
import { PinButton } from "@/components/prompts/pin-button";
import { RunPromptButton } from "@/components/prompts/run-prompt-button";
import { VariableFillModal, hasVariables, renderContentWithVariables } from "@/components/prompts/variable-fill-modal";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AudioPlayer } from "@/components/prompts/audio-player";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface PromptCardProps {
  prompt: {
    id: string;
    slug?: string | null;
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
      verified?: boolean;
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
      parent?: {
        id: string;
        name: string;
        slug: string;
      } | null;
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

  const isStructuredInput = !!prompt.structuredFormat;
  const isAudio = prompt.type === "AUDIO";
  const isVideo = prompt.type === "VIDEO";
  const hasMediaBackground = prompt.type === "IMAGE" || isVideo || (isStructuredInput && !!prompt.mediaUrl && !isAudio);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Autoplay video when visible in viewport
  useEffect(() => {
    if (!isVideo || !videoRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
        } else {
          videoRef.current?.pause();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(videoRef.current);
    return () => observer.disconnect();
  }, [isVideo]);

  const handleMouseEnter = () => {
    // Video autoplay is now handled by IntersectionObserver
  };

  const handleMouseLeave = () => {
    // Video pause is now handled by IntersectionObserver
  };
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
      className={`group border rounded-[var(--radius)] overflow-hidden hover:border-foreground/20 transition-colors flex flex-col ${hasMediaBackground || isAudio ? "" : "p-4"}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image/Video Background for IMAGE/VIDEO type or STRUCTURED with media */}
      {hasMediaBackground && (
        <div className="relative bg-muted">
          {prompt.mediaUrl && !imageError ? (
            isVideo ? (
              <video
                ref={videoRef}
                src={prompt.mediaUrl}
                className="w-full object-cover"
                style={{ maxHeight: "400px" }}
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : (
              <img
                src={prompt.mediaUrl}
                alt={prompt.title}
                className="w-full object-cover object-top"
                style={{ maxHeight: "400px" }}
                onError={() => setImageError(true)}
              />
            )
          ) : (
            <div className="h-32 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent pointer-events-none" />
          {/* Badges overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm">
              {t(`types.${prompt.type.toLowerCase()}`)}
            </Badge>
          </div>
        </div>
      )}

      {/* Audio Player for AUDIO type */}
      {isAudio && (
        <div className="p-3 pb-0">
          {prompt.mediaUrl ? (
            <AudioPlayer src={prompt.mediaUrl} compact />
          ) : (
            <div className="h-12 flex items-center justify-center bg-muted rounded-lg">
              <Volume2 className="h-5 w-5 text-muted-foreground/30" />
            </div>
          )}
        </div>
      )}

      <div className={hasMediaBackground || isAudio ? "p-3 flex-1 flex flex-col" : "flex-1 flex flex-col"}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1 flex-1 min-w-0">
            {prompt.isPrivate && <Lock className="h-3 w-3 text-muted-foreground shrink-0" />}
            <Link href={getPromptUrl(prompt.id, prompt.slug)} prefetch={false} className="font-medium text-sm hover:underline line-clamp-1">
              {prompt.title}
            </Link>
          </div>
          {(!hasMediaBackground || isAudio) && (
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
          {isStructuredInput ? (
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
                prefetch={false}
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
            <Link href={`/@${prompt.author.username}`} prefetch={false} className="hover:text-foreground flex items-center gap-1.5">
              <Avatar className="h-4 w-4">
                <AvatarImage src={prompt.author.avatar || undefined} alt={prompt.author.username} />
                <AvatarFallback className="text-[8px]">{prompt.author.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              @{prompt.author.username}
              {prompt.author.verified && <BadgeCheck className="h-3 w-3 mt-0.5 text-primary shrink-0" />}
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
                        prefetch={false}
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
                title={prompt.title}
                description={prompt.description || undefined}
                size="icon" 
                variant="ghost" 
                className="h-6 w-6"
                categoryName={prompt.category?.name}
                parentCategoryName={prompt.category?.parent?.name}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
