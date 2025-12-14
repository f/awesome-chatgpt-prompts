"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface MiniPromptCardProps {
  prompt: {
    id: string;
    title: string;
    description?: string | null;
    contentPreview: string;
    type: string;
    tags: string[];
  };
}

export function MiniPromptCard({ prompt }: MiniPromptCardProps) {
  return (
    <Link
      href={`/prompts/${prompt.id}`}
      target="_blank"
      className="block p-2 border rounded-md hover:bg-accent/50 transition-colors text-xs"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="font-medium line-clamp-1 flex-1">{prompt.title}</span>
        <Badge variant="outline" className="text-[9px] shrink-0 py-0 px-1">
          {prompt.type}
        </Badge>
      </div>
      <p className="text-muted-foreground line-clamp-2 mb-1.5">
        {prompt.contentPreview}
      </p>
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {prompt.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-1 py-0.5 rounded text-[9px] bg-muted text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
