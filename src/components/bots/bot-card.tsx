import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Bot as BotIcon, Clock, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BotPlatformBadge } from "@/components/bots/bot-platform-badge";
import type { Bot } from "@/lib/bots";

interface BotCardProps {
  bot: Bot;
}

export async function BotCard({ bot }: BotCardProps) {
  const t = await getTranslations("bots");
  const scheduled = bot.routines.filter((r) => r.type === "schedule").length;
  const events = bot.routines.length - scheduled;

  return (
    <Link
      href={`/bots/${bot.slug}`}
      className="group flex flex-col gap-3 rounded-[var(--radius)] border bg-card p-4 transition-colors hover:border-foreground/30 hover:bg-accent/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted">
          <BotIcon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          {bot.isExample && <Badge variant="secondary">{t("example")}</Badge>}
          <BotPlatformBadge platform={bot.platform} />
        </div>
      </div>
      <div className="space-y-1">
        <h2 className="font-semibold leading-snug group-hover:underline">{bot.name}</h2>
        <p className="text-sm text-muted-foreground line-clamp-3">{bot.summary}</p>
      </div>
      <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
        {scheduled > 0 && (
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {t("scheduledCount", { count: scheduled })}
          </span>
        )}
        {events > 0 && (
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {t("eventCount", { count: events })}
          </span>
        )}
      </div>
    </Link>
  );
}
