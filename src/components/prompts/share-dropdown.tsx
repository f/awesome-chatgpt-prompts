"use client";

import { Share2 } from "lucide-react";
import { analyticsPrompt } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Simple X/Twitter icon
function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

// Hacker News icon
function HackerNewsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M0 0v24h24V0H0zm12.3 13.27V18.5h-.8v-5.23L7.7 6.5h.9l3.1 5.37 3.1-5.37h.9l-3.4 6.77z" />
    </svg>
  );
}

interface ShareDropdownProps {
  title: string;
  url?: string;
  promptId?: string;
}

export function ShareDropdown({ title, url, promptId }: ShareDropdownProps) {
  const handleShare = (platform: "twitter" | "hackernews") => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    const encodedUrl = encodeURIComponent(shareUrl);
    let encodedTitle = encodeURIComponent(title);
    encodedTitle = `${encodedTitle} Prompt`;

    let targetUrl = "";

    if (platform === "twitter") {
      targetUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    } else if (platform === "hackernews") {
      targetUrl = `https://news.ycombinator.com/submitlink?u=${encodedUrl}&t=${encodedTitle}`;
    }

    window.open(targetUrl, "_blank", "noopener,noreferrer");
    analyticsPrompt.share(promptId, platform);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleShare("twitter")}>
          <XIcon className="h-4 w-4 mr-2" />
          X / Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleShare("hackernews")}>
          <HackerNewsIcon className="h-4 w-4 mr-2" />
          Hacker News
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
