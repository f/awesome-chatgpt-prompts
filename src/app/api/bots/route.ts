import { NextResponse } from "next/server";
import { BOT_PLATFORMS, getAllBots, getBotUrls } from "@/lib/bots";
import { getBaseUrl } from "@/lib/seo";

export async function GET() {
  const baseUrl = getBaseUrl();
  const bots = getAllBots().map((bot) => ({
    slug: bot.slug,
    name: bot.name,
    platform: bot.platform,
    platformName: BOT_PLATFORMS[bot.platform].name,
    summary: bot.summary,
    isExample: bot.isExample,
    installUrl: bot.installUrl,
    urls: getBotUrls(bot, baseUrl),
  }));

  return NextResponse.json(
    { bots },
    { headers: { "X-Robots-Tag": "noindex", "Access-Control-Allow-Origin": "*" } }
  );
}
