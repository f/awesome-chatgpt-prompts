import { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BotCard } from "@/components/bots/bot-card";
import { BOT_PLATFORMS, BOT_PLATFORM_INFO, listBots, platformFromParam } from "@/lib/bots";
import { buildPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

const PER_PAGE = 24;

interface BotsPageProps {
  searchParams: Promise<{ platform?: string; page?: string }>;
}

export async function generateMetadata({ searchParams }: BotsPageProps): Promise<Metadata> {
  const { platform, page } = await searchParams;
  const t = await getTranslations("seo.bots");
  return buildPageMetadata({
    title: t("title"),
    description: t("description"),
    path: "/bots",
    // Filtered and paginated views share the main canonical
    noindex: !!platform || !!page,
  });
}

function pageHref(platformParam: string | undefined, page: number) {
  const params = new URLSearchParams();
  if (platformParam) params.set("platform", platformParam);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/bots?${query}` : "/bots";
}

export default async function BotsPage({ searchParams }: BotsPageProps) {
  const t = await getTranslations("bots");
  const tSeo = await getTranslations("seo.bots");
  const params = await searchParams;
  const platform = platformFromParam(params.platform);
  const platformParam = platform ? BOT_PLATFORM_INFO[platform].param : undefined;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const { bots, total } = await listBots({ platform, skip: (page - 1) * PER_PAGE, take: PER_PAGE });
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const filters = [
    { param: undefined, label: t("allPlatforms") },
    ...BOT_PLATFORMS.map((value) => ({ param: BOT_PLATFORM_INFO[value].param, label: BOT_PLATFORM_INFO[value].name })),
  ];

  return (
    <div className="container py-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-baseline gap-2">
          <h1 className="text-lg font-semibold">{tSeo("heading")}</h1>
          <span className="text-xs text-muted-foreground">{t("count", { count: total })}</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex flex-wrap gap-1">
            {filters.map((filter) => (
              <Link
                key={filter.label}
                href={pageHref(filter.param, 1)}
                className={cn(
                  "px-3 py-1 rounded-md border text-xs transition-colors",
                  platformParam === filter.param
                    ? "bg-primary text-primary-foreground border-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {filter.label}
              </Link>
            ))}
          </div>
          <Button size="sm" className="h-8 text-xs w-full sm:w-auto" asChild>
            <Link href="/bots/new">
              <Plus className="h-3.5 w-3.5 mr-1" />
              {t("create")}
            </Link>
          </Button>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-6">{t("description")}</p>

      {bots.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-muted-foreground">{t("noBots")}</p>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button size="icon" variant="outline" className="h-8 w-8" disabled={page <= 1} asChild={page > 1}>
            {page > 1 ? (
              <Link href={pageHref(platformParam, page - 1)}><ChevronLeft className="h-4 w-4" /></Link>
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
          <span className="text-sm tabular-nums px-2">{page} / {totalPages}</span>
          <Button size="icon" variant="outline" className="h-8 w-8" disabled={page >= totalPages} asChild={page < totalPages}>
            {page < totalPages ? (
              <Link href={pageHref(platformParam, page + 1)}><ChevronRight className="h-4 w-4" /></Link>
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
