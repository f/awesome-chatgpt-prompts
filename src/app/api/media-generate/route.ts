import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  initializeMediaGenerators,
  getMediaGeneratorPlugin,
  getAvailableModels,
  isMediaGenerationAvailable,
} from "@/lib/plugins/media-generators";

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  initializeMediaGenerators();

  const available = isMediaGenerationAvailable();
  const imageModels = getAvailableModels("image");
  const videoModels = getAvailableModels("video");

  return NextResponse.json({
    available,
    imageModels,
    videoModels,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prompt, model, provider, type, inputImageUrl, resolution, aspectRatio } = body;

    if (!prompt || !model || !provider || !type) {
      return NextResponse.json(
        { error: "Missing required fields: prompt, model, provider, type" },
        { status: 400 }
      );
    }

    initializeMediaGenerators();

    const plugin = getMediaGeneratorPlugin(provider);

    if (!plugin) {
      return NextResponse.json(
        { error: `Provider "${provider}" not found` },
        { status: 404 }
      );
    }

    if (!plugin.isEnabled()) {
      return NextResponse.json(
        { error: `Provider "${provider}" is not enabled` },
        { status: 400 }
      );
    }

    const task = await plugin.startGeneration({
      prompt,
      model,
      type,
      inputImageUrl,
      resolution,
      aspectRatio,
    });

    return NextResponse.json({
      success: true,
      taskId: task.taskId,
      socketAccessToken: task.socketAccessToken,
      webSocketUrl: plugin.getWebSocketUrl(),
      provider,
    });
  } catch (error) {
    console.error("Media generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
