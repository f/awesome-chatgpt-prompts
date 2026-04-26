/**
 * PromptChan Media Generator Plugin
 *
 * Generates images using the PromptChan API (prod.aicloudnetservices.com).
 * Uses polling-based status updates.
 *
 * Required env vars:
 * - PROMPTCHAN_API_KEY
 * - PROMPTCHAN_IMAGE_MODELS (comma-separated styles, e.g. "Photo XL+ v2,Cinematic XL")
 */

import type {
  MediaGeneratorPlugin,
  MediaGeneratorModel,
  GenerationRequest,
  GenerationTask,
  WebSocketHandler,
  WebSocketCallbacks,
  PollStatusResult,
  GenerationStatusKey,
} from "./types";

const PROMPTCHAN_BASE = "https://prod.aicloudnetservices.com";
const SUBMIT_URL = `${PROMPTCHAN_BASE}/api/external/video_v3.1/submit`;
const STATUS_URL = `${PROMPTCHAN_BASE}/api/external/video_v3.1/status`;

function parseModels(envVar: string | undefined, type: "image" | "video" | "audio"): MediaGeneratorModel[] {
  if (!envVar) return [];
  return envVar
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)
    .map((id) => ({ id, name: id, type }));
}

function mapAspectRatio(aspectRatio?: string): string {
  const map: Record<string, string> = {
    "1:1": "Square",
    "16:9": "Landscape",
    "9:16": "Portrait",
    "4:3": "Landscape",
    "3:4": "Portrait",
    "3:2": "Landscape",
    "2:3": "Portrait",
  };
  return map[aspectRatio ?? "9:16"] ?? "Portrait";
}

interface PromptchanSubmitResponse {
  task_id?: string;
  id?: string;
  taskId?: string;
  // Synchronous response fields
  url?: string;
  image_url?: string;
  output_url?: string;
}

interface PromptchanStatusResponse {
  status?: string;
  url?: string;
  image_url?: string;
  output_url?: string;
  progress?: number;
  error?: string;
}

const promptchanWebSocketHandler: WebSocketHandler = {
  getInitMessage: (socketAccessToken: string) =>
    JSON.stringify({ type: "promptchan_init", data: socketAccessToken }),
  handleMessage: (_event: MessageEvent, _callbacks: WebSocketCallbacks) => {
    // PromptChan uses HTTP polling, not WebSocket
  },
};

export const promptchanGeneratorPlugin: MediaGeneratorPlugin = {
  id: "promptchan",
  name: "PromptChan",

  isConfigured: () => {
    return !!(process.env.PROMPTCHAN_API_KEY && process.env.PROMPTCHAN_IMAGE_MODELS);
  },

  isEnabled: () => {
    return promptchanGeneratorPlugin.isConfigured();
  },

  getModels: () => {
    if (!promptchanGeneratorPlugin.isEnabled()) return [];
    return parseModels(process.env.PROMPTCHAN_IMAGE_MODELS, "image");
  },

  async startGeneration(request: GenerationRequest): Promise<GenerationTask> {
    if (!promptchanGeneratorPlugin.isConfigured()) {
      throw new Error(
        "PromptChan is not configured. Please set PROMPTCHAN_API_KEY and PROMPTCHAN_IMAGE_MODELS."
      );
    }

    const apiKey = process.env.PROMPTCHAN_API_KEY!;

    const response = await fetch(SUBMIT_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: request.prompt,
        style: request.model,
        aspect: mapAspectRatio(request.aspectRatio),
        age_slider: 18,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PromptChan API error: ${response.status} - ${errorText}`);
    }

    const data: PromptchanSubmitResponse = await response.json();

    // Synchronous API: image URL returned immediately
    const directUrl = data.url ?? data.image_url ?? data.output_url;
    if (directUrl) {
      return { taskId: "direct", socketAccessToken: `direct|${directUrl}` };
    }

    // Async API: task ID returned, poll for result
    const taskId = data.task_id ?? data.id ?? data.taskId;
    if (!taskId) {
      throw new Error("PromptChan API returned neither an image URL nor a task ID");
    }

    return { taskId, socketAccessToken: `async|${taskId}` };
  },

  getWebSocketUrl: () => "",

  webSocketHandler: promptchanWebSocketHandler,

  async checkStatus(socketAccessToken: string): Promise<PollStatusResult> {
    const pipeIdx = socketAccessToken.indexOf("|");
    const mode = socketAccessToken.slice(0, pipeIdx);
    const value = socketAccessToken.slice(pipeIdx + 1);

    // Synchronous result — already have the URL
    if (mode === "direct") {
      return {
        status: "completed",
        statusKey: "complete" as GenerationStatusKey,
        progress: 100,
        outputUrls: [value],
      };
    }

    // Poll the status endpoint
    const apiKey = process.env.PROMPTCHAN_API_KEY!;

    const response = await fetch(`${STATUS_URL}/${value}`, {
      headers: { "x-api-key": apiKey },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`PromptChan status error: ${response.status} - ${errorText}`);
    }

    const data: PromptchanStatusResponse = await response.json();

    if (data.error || data.status === "failed" || data.status === "error") {
      return {
        status: "failed",
        statusKey: "error" as GenerationStatusKey,
        progress: 0,
        outputUrls: [],
        error: data.error ?? "Generation failed",
      };
    }

    const outputUrl = data.url ?? data.image_url ?? data.output_url;
    const isComplete =
      outputUrl != null ||
      data.status === "complete" ||
      data.status === "completed" ||
      data.status === "success";

    if (isComplete && outputUrl) {
      return {
        status: "completed",
        statusKey: "complete" as GenerationStatusKey,
        progress: 100,
        outputUrls: [outputUrl],
      };
    }

    return {
      status: "in_progress",
      statusKey: "generating" as GenerationStatusKey,
      progress: data.progress ?? 50,
      outputUrls: [],
    };
  },
};
