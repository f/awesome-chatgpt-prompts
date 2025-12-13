"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ImageIcon, AlertTriangle } from "lucide-react";

interface MediaPreviewProps {
  mediaUrl: string;
  title: string;
  type: string;
}

export function MediaPreview({ mediaUrl, title, type }: MediaPreviewProps) {
  const t = useTranslations("prompts");
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{t("mediaLoadError")}</span>
        </div>
        <div className="rounded-lg overflow-hidden border bg-muted/30 h-48 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">{t("mediaUnavailable")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden border bg-muted/30 relative">
      {type === "VIDEO" ? (
        <video
          src={mediaUrl}
          controls
          className="w-full max-h-[500px] object-contain block"
          onError={() => setHasError(true)}
        />
      ) : (
        <a 
          href={mediaUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="block relative"
        >
          {/* Blurred background for vertical images */}
          <div 
            className="absolute inset-0 bg-cover bg-center blur-2xl opacity-50 scale-110"
            style={{ backgroundImage: `url(${mediaUrl})` }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaUrl}
            alt={title}
            className="relative w-full max-h-[500px] object-contain block"
            onError={() => setHasError(true)}
          />
        </a>
      )}
    </div>
  );
}
