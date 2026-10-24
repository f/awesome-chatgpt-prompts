import { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { BotCard } from "@/components/bots/bot-card";
import { BOT_PLATFORMS, getAllBots, isBotPlatform, type BotPlatform } from "@/lib/bots";
import { buildPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

interface BotsPageProps {
  searchParams: Promise<{ platform?: string }>;
}

export async function generateMetadata({ searchParams }: BotsPageProps): Promise<Metadata> {
  const { platform } = await searchParams;
  const t = await getTranslations("seo.bots");
  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/bots",
    // Filtered views share the main canonical
    noindex: !!platform,
  });
}

export default async function BotsPage({ searchParams }: BotsPageProps) {
  const t = await getTranslations("bots");
  const tSeo = await getTranslations("seo.bots");
  const { platform: platformParam } = await searchParams;
  const platform = isBotPlatform(platformParam) ? platformParam : undefined;
  const bots = getAllBots(platform);

  const filters: Array<{ value?: BotPlatform; label: string }> = [
    { label: t("allPlatforms") },
    ...(Object.keys(BOT_PLATFORMS) as BotPlatform[]).map((value) => ({
      value,
      label: BOT_PLATFORMS[value].name,
    })),
  ];

  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg font-semibold">{tSeo("heading")}</h1>
          <span className="text-xs text-muted-foreground">{t("count", { count: bots.length })}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {filters.map((filter) => (
            <Link
              key={filter.label}
              href={filter.value ? `/bots?platform=${filter.value}` : "/bots"}
              className={cn(
                "px-3 py-1 rounded-md border text-xs transition-colors",
                platform === filter.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {filter.label}
            </Link>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-6">{t("description")}</p>

      {bots.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <BotCard key={bot.slug} bot={bot} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-muted-foreground">{t("noBots")}</p>
      )}
    </div>
  );
}
