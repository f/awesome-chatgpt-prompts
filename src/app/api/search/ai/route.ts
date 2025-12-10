import { NextRequest, NextResponse } from "next/server";
import { semanticSearch, isAISearchEnabled } from "@/lib/ai/embeddings";

export async function GET(request: NextRequest) {
  try {
    const enabled = await isAISearchEnabled();
    if (!enabled) {
      return NextResponse.json(
        { error: "AI Search is not enabled" },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20");

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const results = await semanticSearch(query, limit);

    return NextResponse.json({
      results,
      query,
      count: results.length,
    });
  } catch (error) {
    console.error("AI Search error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
