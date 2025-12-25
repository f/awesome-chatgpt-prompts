import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getMediaGeneratorPlugin } from "@/lib/plugins/media-generators";

/**
 * Polling endpoint for media generation status
 * Used by providers that don't support WebSocket (e.g., Fal.ai)
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const provider = searchParams.get("provider");
  const socketAccessToken = searchParams.get("token");

  if (!provider || !socketAccessToken) {
    return NextResponse.json(
      { error: "Missing provider or token" },
      { status: 400 }
    );
  }

  const plugin = getMediaGeneratorPlugin(provider);

  if (!plugin) {
    return NextResponse.json(
      { error: `Provider "${provider}" not found` },
      { status: 404 }
    );
  }

  if (!plugin.checkStatus) {
    return NextResponse.json(
      { error: "Provider does not support polling" },
      { status: 400 }
    );
  }

  try {
    const result = await plugin.checkStatus(socketAccessToken);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Status check failed" },
      { status: 500 }
    );
  }
}
