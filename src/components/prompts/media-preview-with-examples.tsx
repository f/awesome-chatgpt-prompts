"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ImageIcon, AlertTriangle } from "lucide-react";
import { AudioPlayer } from "./audio-player";
import { UserExamplesGallery } from "./user-examples-gallery";

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

interface MediaPreviewWithExamplesProps {
  mediaUrl: string;
  title: string;
  type: string;
  promptId: string;
  currentUserId?: string;
  isAdmin?: boolean;
  refreshTrigger?: number;
  renderAddButton?: (asThumbnail: boolean) => React.ReactNode;
}

export function MediaPreviewWithExamples({
  mediaUrl,
  title,
  type,
  promptId,
  currentUserId,
  isAdmin,
  refreshTrigger = 0,
  renderAddButton,
}: MediaPreviewWithExamplesProps) {
  const t = useTranslations("prompts");
  const [hasError, setHasError] = useState(false);
  const [selectedExample, setSelectedExample] = useState<UserExample | null>(null);

  const handleSelectExample = (example: UserExample | null) => {
    setSelectedExample(example);
    setHasError(false);
  };

  const displayUrl = selectedExample?.mediaUrl || mediaUrl;
  const displayTitle = selectedExample?.comment || title;
  const isShowingExample = !!selectedExample;

  const supportsExamples = type === "IMAGE" || type === "VIDEO";

  if (hasError && !isShowingExample) {
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
        {supportsExamples && (
          <UserExamplesGallery
            promptId={promptId}
            promptType={type}
            currentUserId={currentUserId}
            isAdmin={isAdmin}
            onSelectExample={handleSelectExample}
            refreshTrigger={refreshTrigger}
            renderAddButton={renderAddButton}
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg overflow-hidden border bg-muted/30 relative">
        {type === "VIDEO" ? (
          <video
            src={displayUrl}
            controls
            className="w-full max-h-[500px] object-contain block"
            onError={() => setHasError(true)}
          />
        ) : type === "AUDIO" ? (
          <AudioPlayer
            src={displayUrl}
            onError={() => setHasError(true)}
          />
        ) : (
          <a
            href={displayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block relative"
          >
            {/* Blurred background for vertical images */}
            <div
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-50 scale-110"
              style={{ backgroundImage: `url(${displayUrl})` }}
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={displayUrl}
              alt={displayTitle}
              className="relative w-full max-h-[500px] object-contain block"
              onError={() => setHasError(true)}
            />
          </a>
        )}
        {isShowingExample && selectedExample && (
          <div className="absolute bottom-2 left-2 right-2 px-3 py-2 rounded-lg bg-black/70 backdrop-blur-sm">
            <p className="text-xs text-white/90">
              <span className="font-medium">@{selectedExample.user.username}</span>
              {selectedExample.comment && (
                <span className="ml-2 text-white/70">{selectedExample.comment}</span>
              )}
            </p>
          </div>
        )}
      </div>

      {supportsExamples && (
        <UserExamplesGallery
          promptId={promptId}
          promptType={type}
          currentUserId={currentUserId}
          isAdmin={isAdmin}
          onSelectExample={handleSelectExample}
          refreshTrigger={refreshTrigger}
          renderAddButton={renderAddButton}
        />
      )}
    </div>
  );
}
