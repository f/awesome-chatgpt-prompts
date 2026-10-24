import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Clock, Plug, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BotInstall } from "@/components/bots/bot-install";
import { BotPlatformBadge } from "@/components/bots/bot-platform-badge";
import { JsonLd, breadcrumbSchema } from "@/components/seo/structured-data";
import {
  BOT_PLATFORMS,
  getAllBots,
  getBotBySlug,
  getBotUrls,
  getHermesInstallCommand,
  getInstallPrompt,
} from "@/lib/bots";
import { buildPageMetadata, getBaseUrl, NOINDEX_ROBOTS } from "@/lib/seo";

interface BotPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return getAllBots().map((bot) => ({ slug: bot.slug }));
}

export async function generateMetadata({ params }: BotPageProps): Promise<Metadata> {
  const { slug } = await params;
  const bot = getBotBySlug(slug);
  if (!bot) {
    return { robots: NOINDEX_ROBOTS };
  }
  return buildPageMetadata({
    title: `${bot.name} · ${BOT_PLATFORMS[bot.platform].name}`,
    description: bot.summary,
    path: `/bots/${bot.slug}`,
  });
}

export default async function BotPage({ params }: BotPageProps) {
  const { slug } = await params;
  const bot = getBotBySlug(slug);
  if (!bot) {
    notFound();
  }

  const t = await getTranslations("bots");
  const tNav = await getTranslations("nav");
  const baseUrl = getBaseUrl();
  const platformName = BOT_PLATFORMS[bot.platform].name;

  return (
    <div className="container max-w-5xl py-6">
      <JsonLd
        data={breadcrumbSchema([
          { name: tNav("bots"), path: "/bots" },
          { name: bot.name, path: `/bots/${bot.slug}` },
        ])}
      />

      <Link
        href="/bots"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToBots")}
      </Link>

      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <BotPlatformBadge platform={bot.platform} />
          {bot.isExample && <Badge variant="secondary">{t("example")}</Badge>}
        </div>
        <h1 className="text-2xl font-semibold">{bot.name}</h1>
        <p className="text-muted-foreground">{bot.description}</p>
        {bot.isExample && (
          <p className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
            {t("exampleNotice")}
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8 min-w-0">
          <section className="space-y-2">
            <h2 className="text-base font-semibold">{t("instructions")}</h2>
            <pre className="whitespace-pre-wrap break-words rounded-md border bg-muted/50 p-4 text-sm font-mono leading-relaxed">
              {bot.instructions}
            </pre>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">{t("routines")}</h2>
            {bot.routines.length > 0 ? (
              <div className="space-y-3">
                {bot.routines.map((routine) => (
                  <div key={routine.name} className="rounded-md border p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-medium">{routine.name}</h3>
                      <Badge variant="outline" className="gap-1">
                        {routine.type === "schedule" ? <Clock /> : <Zap />}
                        {routine.type === "schedule" ? t("scheduled") : t("eventTriggered")}
                      </Badge>
                    </div>
                    <p className="text-sm">
                      <span className="text-muted-foreground">{routine.type === "schedule" ? t("schedule") : t("trigger")}: </span>
                      {routine.triggerLabel}
                      {routine.type === "schedule" && (
                        <code className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">{routine.trigger}</code>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">{routine.prompt}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noRoutines")}</p>
            )}
          </section>

          {(bot.skills.length > 0 || bot.connectors.length > 0) && (
            <section className="grid gap-6 sm:grid-cols-2">
              {bot.skills.length > 0 && (
                <div className="space-y-2">
                  <h2 className="flex items-center gap-2 text-base font-semibold">
                    <Sparkles className="h-4 w-4" />
                    {t("skills")}
                  </h2>
                  <ul className="space-y-2">
                    {bot.skills.map((skill) => (
                      <li key={skill.name} className="text-sm">
                        <span className="font-medium">{skill.name}</span>
                        <span className="text-muted-foreground"> — {skill.description}</span>
                        {skill.source && (
                          <code className="mt-1 block w-fit rounded bg-muted px-1.5 py-0.5 text-xs">{skill.source}</code>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {bot.connectors.length > 0 && (
                <div className="space-y-2">
                  <h2 className="flex items-center gap-2 text-base font-semibold">
                    <Plug className="h-4 w-4" />
                    {t("connectors")}
                  </h2>
                  <div className="flex flex-wrap gap-1">
                    {bot.connectors.map((connector) => (
                      <Badge key={connector} variant="outline">{connector}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-16 h-fit rounded-md border p-4 space-y-3">
          <h2 className="text-base font-semibold">{t("install")}</h2>
          <BotInstall
            platform={bot.platform}
            platformName={platformName}
            installUrl={bot.installUrl}
            installPrompt={getInstallPrompt(bot, baseUrl)}
            hermesCommand={bot.platform === "hermes" ? getHermesInstallCommand(bot, baseUrl) : null}
            urls={getBotUrls(bot, baseUrl)}
          />
        </aside>
      </div>
    </div>
  );
}
