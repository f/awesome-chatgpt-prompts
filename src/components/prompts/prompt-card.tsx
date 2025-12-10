"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow } from "@/lib/date";
import { ArrowBigUp, Lock, Copy, ImageIcon, Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CodeView } from "@/components/ui/code-view";
import { toast } from "sonner";
import { RunPromptButton } from "@/components/prompts/run-prompt-button";
import { PinButton } from "@/components/prompts/pin-button";

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

  const hasMediaBackground = prompt.type === "IMAGE" || (prompt.type === "STRUCTURED" && !!prompt.mediaUrl);

  const copyToClipboard = async (content: string) => {
    await navigator.clipboard.writeText(content);
    toast.success(tCommon("copiedToClipboard"));
  };

  return (
    <div 
      className={`group border rounded-[var(--radius)] overflow-hidden hover:border-foreground/20 transition-colors flex flex-col ${hasMediaBackground ? "" : "p-4"}`}
    >
      {/* Image Background for IMAGE type or STRUCTURED with media */}
      {hasMediaBackground && (
        <div className="relative h-32 bg-muted">
          {prompt.mediaUrl ? (
            <Image
              src={prompt.mediaUrl}
              alt={prompt.title}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <ImageIcon className="h-8 w-8 text-muted-foreground/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          {/* Badges overlay */}
          <div className="absolute top-2 right-2 flex items-center gap-1.5">
            {prompt.isPrivate && <Lock className="h-3 w-3 text-white drop-shadow" />}
            <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm">
              {t(`types.${prompt.type.toLowerCase()}`)}
            </Badge>
          </div>
        </div>
      )}

      <div className={hasMediaBackground ? "p-3 flex-1 flex flex-col" : "flex-1 flex flex-col"}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <Link href={`/prompts/${prompt.id}`} className="font-medium text-sm hover:underline line-clamp-1 flex-1">
            {prompt.title}
          </Link>
          {!hasMediaBackground && (
            <div className="flex items-center gap-1.5 shrink-0">
              {prompt.isPrivate && <Lock className="h-3 w-3 text-muted-foreground" />}
              <Badge variant="outline" className="text-[10px]">
                {t(`types.${prompt.type.toLowerCase()}`)}
              </Badge>
            </div>
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
              content={prompt.content} 
              language={(prompt.structuredFormat?.toLowerCase() as "json" | "yaml") || "json"}
              maxLines={hasMediaBackground ? 3 : 10}
              fontSize="xs"
            />
          ) : (
            <pre className={`text-xs text-muted-foreground bg-muted p-2 rounded overflow-hidden font-mono h-full whitespace-pre-wrap break-words ${hasMediaBackground ? "line-clamp-2" : "line-clamp-4"}`}>
              {prompt.content}
            </pre>
          )}
          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
            {showPinButton && (
              <PinButton promptId={prompt.id} initialPinned={isPinned} iconOnly />
            )}
            <button
              onClick={() => copyToClipboard(prompt.content)}
              className="p-1 rounded bg-background/80 border hover:bg-accent"
            >
              <Copy className="h-3 w-3" />
            </button>
            <RunPromptButton 
              content={prompt.content} 
              size="icon" 
              variant="outline" 
              className="h-6 w-6 bg-background/80 [&_svg]:h-3 [&_svg]:w-3" 
            />
          </div>
        </div>

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
          <Link href={`/@${prompt.author.username}`} className="hover:text-foreground">
            @{prompt.author.username}{prompt.contributorCount ? ` +${prompt.contributorCount}` : ""}
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              <ArrowBigUp className="h-3.5 w-3.5" />
              {prompt.voteCount}
            </span>
            <span>{formatDistanceToNow(prompt.createdAt, locale)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
