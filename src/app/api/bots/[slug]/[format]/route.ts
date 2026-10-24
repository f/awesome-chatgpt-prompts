import { NextResponse } from "next/server";
import { botToJson, botToMarkdown, botToSkill, getBotBySlug } from "@/lib/bots";
import { getBaseUrl } from "@/lib/seo";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string; format: string }> }
) {
  const { slug, format } = await params;
  const bot = getBotBySlug(slug);

  if (!bot) {
    return new NextResponse("Bot not found", { status: 404 });
  }

  const baseUrl = getBaseUrl();
  // Raw files duplicate the bot page, so keep them out of search results
  const headers = { "X-Robots-Tag": "noindex", "Access-Control-Allow-Origin": "*" };

  if (format === "json") {
    return NextResponse.json(botToJson(bot, baseUrl), { headers });
  }

  if (format !== "md" && format !== "skill") {
    return new NextResponse("Unknown format", { status: 404 });
  }

  const output = format === "skill" ? botToSkill(bot, baseUrl) : botToMarkdown(bot, baseUrl);
  return new NextResponse(output, {
    headers: { ...headers, "Content-Type": "text/markdown; charset=utf-8" },
  });
}
