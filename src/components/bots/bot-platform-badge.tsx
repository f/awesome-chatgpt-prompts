import { Badge } from "@/components/ui/badge";
import { BOT_PLATFORMS, type BotPlatform } from "@/lib/bots";
import { cn } from "@/lib/utils";

const PLATFORM_STYLES: Record<BotPlatform, string> = {
  openclaw: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  hermes: "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  grok: "border-foreground/20 bg-foreground/5 text-foreground",
};

interface BotPlatformBadgeProps {
  platform: BotPlatform;
  className?: string;
}

export function BotPlatformBadge({ platform, className }: BotPlatformBadgeProps) {
  return (
    <Badge variant="outline" className={cn(PLATFORM_STYLES[platform], className)}>
      {BOT_PLATFORMS[platform].name}
    </Badge>
  );
}
