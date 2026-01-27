"use client";

import React from "react";
import { 
  Globe, 
  Github, 
  Linkedin, 
  Instagram, 
  Youtube, 
  Twitch,
  Heart,
  type LucideIcon
} from "lucide-react";

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
import { cn } from "@/lib/utils";

// Custom icons for platforms not in Lucide
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

function MastodonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"/>
    </svg>
  );
}

function BlueskyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
    </svg>
  );
}

export type CustomLinkType = 
  | "website" 
  | "github" 
  | "twitter" 
  | "linkedin" 
  | "instagram" 
  | "youtube" 
  | "twitch" 
  | "discord" 
  | "mastodon" 
  | "bluesky" 
  | "sponsor";

export interface CustomLink {
  type: CustomLinkType;
  url: string;
  label?: string;
}

interface LinkIconConfig {
  icon: LucideIcon | (({ className }: { className?: string }) => React.ReactElement);
  color: string;
  hoverColor: string;
}

const linkIcons: Record<CustomLinkType, LinkIconConfig> = {
  website: { icon: Globe, color: "text-muted-foreground", hoverColor: "hover:text-foreground" },
  github: { icon: Github, color: "text-muted-foreground", hoverColor: "hover:text-foreground" },
  twitter: { icon: XIcon, color: "text-muted-foreground", hoverColor: "hover:text-foreground" },
  linkedin: { icon: Linkedin, color: "text-muted-foreground", hoverColor: "hover:text-blue-600" },
  instagram: { icon: Instagram, color: "text-muted-foreground", hoverColor: "hover:text-pink-500" },
  youtube: { icon: Youtube, color: "text-muted-foreground", hoverColor: "hover:text-red-500" },
  twitch: { icon: Twitch, color: "text-muted-foreground", hoverColor: "hover:text-purple-500" },
  discord: { icon: DiscordIcon, color: "text-muted-foreground", hoverColor: "hover:text-indigo-500" },
  mastodon: { icon: MastodonIcon, color: "text-muted-foreground", hoverColor: "hover:text-purple-600" },
  bluesky: { icon: BlueskyIcon, color: "text-muted-foreground", hoverColor: "hover:text-sky-400" },
  sponsor: { icon: Heart, color: "text-muted-foreground", hoverColor: "hover:text-pink-500" },
};

interface ProfileLinksProps {
  bio?: string | null;
  customLinks?: CustomLink[] | null;
  className?: string;
}

function parseBioText(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let key = 0;
  
  // Regex to match URLs and **bold** text
  const regex = /(https?:\/\/[^\s]+)|(\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // URL match
      const url = match[1];
      parts.push(
        <a
          key={key++}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          {url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
        </a>
      );
    } else if (match[2]) {
      // Bold match - remove ** markers
      const boldText = match[2].slice(2, -2);
      parts.push(<strong key={key++} className="font-medium text-foreground">{boldText}</strong>);
    }

    lastIndex = regex.lastIndex;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

export function ProfileLinks({ bio, customLinks, className }: ProfileLinksProps) {
  const hasContent = bio || (customLinks && customLinks.length > 0);
  
  if (!hasContent) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {bio && (
        <p className="text-sm text-muted-foreground">
          {parseBioText(bio)}
        </p>
      )}
      {customLinks && customLinks.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          {customLinks.map((link, index) => {
            const config = linkIcons[link.type] || linkIcons.website;
            const Icon = config.icon;
            return (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  "inline-flex items-center gap-1.5 text-sm transition-colors",
                  config.color,
                  config.hoverColor
                )}
                title={link.label || link.type}
              >
                <Icon className="h-4 w-4" />
                {link.label && <span>{link.label}</span>}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
