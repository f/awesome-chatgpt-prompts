import { NextRequest, NextResponse } from "next/server";
import { botToJson, botToMarkdown, botToSkill, getBotBySlug } from "@/lib/bots";
import { getBaseUrl } from "@/lib/seo";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const bot = getBotBySlug(slug);

  if (!bot) {
    return new NextResponse("Bot not found", { status: 404 });
  }

  const baseUrl = getBaseUrl();
  const format = request.nextUrl.searchParams.get("format");
  // Raw files duplicate the bot page, so keep them out of search results
  const headers = { "X-Robots-Tag": "noindex", "Access-Control-Allow-Origin": "*" };

  if (format === "json") {
    return NextResponse.json(botToJson(bot, baseUrl), { headers });
  }

  const output = format === "skill" ? botToSkill(bot, baseUrl) : botToMarkdown(bot, baseUrl);
  return new NextResponse(output, {
    headers: { ...headers, "Content-Type": "text/markdown; charset=utf-8" },
  });
}
