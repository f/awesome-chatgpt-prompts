import { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Clock, EyeOff, Pencil, Plug, Sparkles, Star, Zap } from "lucide-react";
import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BotInstall } from "@/components/bots/bot-install";
import { BotPlatformBadge } from "@/components/bots/bot-platform-badge";
import { JsonLd, breadcrumbSchema } from "@/components/seo/structured-data";
import {
  BOT_PLATFORM_INFO,
  extractBotId,
  getBotById,
  getBotUrls,
  getHermesInstallCommand,
  getInstallPrompt,
} from "@/lib/bots";
import { canViewPrompt } from "@/lib/prompt-access";
import { buildPageMetadata, getBaseUrl, NOINDEX_ROBOTS, toMetaDescription } from "@/lib/seo";
import { getBotUrl } from "@/lib/urls";

interface BotPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BotPageProps): Promise<Metadata> {
  const { slug } = await params;
  const bot = await getBotById(extractBotId(slug));
  if (!bot || bot.isPrivate) {
    return { robots: NOINDEX_ROBOTS };
  }
  return buildPageMetadata({
    title: `${bot.title} · ${BOT_PLATFORM_INFO[bot.platform].name}`,
    description: toMetaDescription(bot.description || bot.instructions),
    path: getBotUrl(bot.id, bot.slug),
    noindex: bot.isUnlisted,
  });
}

export default async function BotPage({ params }: BotPageProps) {
  const { slug } = await params;
  const bot = await getBotById(extractBotId(slug));
  const session = await auth();
  if (!bot || !canViewPrompt(bot, session)) {
    notFound();
  }

  const canonicalPath = getBotUrl(bot.id, bot.slug);
  if (`/bots/${slug}` !== canonicalPath) {
    permanentRedirect(canonicalPath);
  }

  const t = await getTranslations("bots");
  const tNav = await getTranslations("nav");
  const baseUrl = getBaseUrl();
  const platformName = BOT_PLATFORM_INFO[bot.platform].name;
  const canEdit = session?.user?.id === bot.authorId || session?.user?.role === "ADMIN";
  const { routines, skills, connectors } = bot.config;

  return (
    <div className="container max-w-5xl py-6">
      <JsonLd
        data={breadcrumbSchema([
          { name: tNav("bots"), path: "/bots" },
          { name: bot.title, path: canonicalPath },
        ])}
      />

      <div className="mb-4 flex items-center justify-between gap-2">
        <Link href="/bots" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          {t("backToBots")}
        </Link>
        {canEdit && (
          <Button size="sm" variant="outline" className="h-8 text-xs" asChild>
            <Link href={`${canonicalPath}/edit`}>
              <Pencil className="h-3.5 w-3.5 mr-1" />
              {t("edit")}
            </Link>
          </Button>
        )}
      </div>

      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <BotPlatformBadge platform={bot.platform} />
          {bot.isFeatured && <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />}
          {bot.isPrivate && (
            <Badge variant="secondary"><EyeOff />{t("private")}</Badge>
          )}
          {bot.isUnlisted && <Badge variant="outline">{t("unlisted")}</Badge>}
        </div>
        <h1 className="text-2xl font-semibold">{bot.title}</h1>
        {bot.description && <p className="text-muted-foreground">{bot.description}</p>}
        <Link href={`/@${bot.author.username}`} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <Avatar className="h-5 w-5">
            <AvatarImage src={bot.author.avatar || undefined} alt={bot.author.username} />
            <AvatarFallback className="text-[10px]">{(bot.author.name || bot.author.username).charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          @{bot.author.username}
        </Link>
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
            {routines.length > 0 ? (
              <div className="space-y-3">
                {routines.map((routine, index) => (
                  <div key={index} className="rounded-md border p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-medium">{routine.name}</h3>
                      <Badge variant="outline" className="gap-1">
                        {routine.type === "schedule" ? <Clock /> : <Zap />}
                        {routine.type === "schedule" ? t("scheduled") : t("eventTriggered")}
                      </Badge>
                    </div>
                    <p className="text-sm">
                      <span className="text-muted-foreground">{routine.type === "schedule" ? t("schedule") : t("trigger")}: </span>
                      {routine.triggerLabel || routine.trigger}
                      {routine.type === "schedule" && routine.triggerLabel && (
                        <code className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">{routine.trigger}</code>
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{routine.prompt}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noRoutines")}</p>
            )}
          </section>

          {(skills.length > 0 || connectors.length > 0) && (
            <section className="grid gap-6 sm:grid-cols-2">
              {skills.length > 0 && (
                <div className="space-y-2">
                  <h2 className="flex items-center gap-2 text-base font-semibold">
                    <Sparkles className="h-4 w-4" />
                    {t("skills")}
                  </h2>
                  <ul className="space-y-2">
                    {skills.map((skill, index) => (
                      <li key={index} className="text-sm">
                        <span className="font-medium">{skill.name}</span>
                        {skill.description && <span className="text-muted-foreground"> — {skill.description}</span>}
                        {skill.source && (
                          <code className="mt-1 block w-fit rounded bg-muted px-1.5 py-0.5 text-xs">{skill.source}</code>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {connectors.length > 0 && (
                <div className="space-y-2">
                  <h2 className="flex items-center gap-2 text-base font-semibold">
                    <Plug className="h-4 w-4" />
                    {t("connectors")}
                  </h2>
                  <div className="flex flex-wrap gap-1">
                    {connectors.map((connector) => (
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
            hermesCommand={bot.platform === "HERMES" ? getHermesInstallCommand(bot, baseUrl) : null}
            urls={getBotUrls(bot, baseUrl)}
          />
        </aside>
      </div>
    </div>
  );
}
