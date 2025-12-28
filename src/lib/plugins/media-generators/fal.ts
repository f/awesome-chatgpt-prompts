/**
 * Fal.ai Media Generator Plugin
 * 
 * Generates images and videos using Fal.ai API.
 * Uses Fal.ai's queue API for async generation with polling-based status updates.
 * 
 * Required env vars:
 * - FAL_API_KEY
 * - FAL_VIDEO_MODELS (comma-separated, e.g., "fal-ai/veo3,fal-ai/kling-video/v2/master/image-to-video")
 * - FAL_IMAGE_MODELS (comma-separated, e.g., "fal-ai/flux-pro/v1.1-ultra,fal-ai/flux/dev")
 * - FAL_AUDIO_MODELS (comma-separated, e.g., "fal-ai/stable-audio")
 */

import type {
  MediaGeneratorPlugin,
  MediaGeneratorModel,
  GenerationRequest,
  GenerationTask,
  WebSocketHandler,
  WebSocketCallbacks,
  GenerationStatusKey,
  PollStatusResult,
} from "./types";

const FAL_QUEUE_BASE = "https://queue.fal.run";

function parseModels(envVar: string | undefined, type: "image" | "video" | "audio"): MediaGeneratorModel[] {
  if (!envVar) return [];
  return envVar
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)
    .map((id) => ({
      id,
      name: id,
      type,
    }));
}

// Map Fal.ai status to our status keys
const falStatusMap: Record<string, GenerationStatusKey> = {
  IN_QUEUE: "queued",
  IN_PROGRESS: "generating",
  COMPLETED: "complete",
  FAILED: "error",
};

export { falStatusMap };

// Fal.ai response types
export interface FalQueueResponse {
  request_id: string;
  response_url: string;
  status_url: string;
  cancel_url: string;
}

export interface FalStatusResponse {
  status: "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  queue_position?: number;
  response_url?: string;
  logs?: Array<{ message: string; timestamp: string }>;
}

export interface FalImageOutput {
  images?: Array<{ url: string; content_type?: string }>;
  image?: { url: string };
}

export interface FalVideoOutput {
  video?: { url: string };
  videos?: Array<{ url: string }>;
}

export interface FalAudioOutput {
  audio_file?: { url: string };
  audio?: Array<{ url: string }> | { url: string };
}

/**
 * Submit a generation request to Fal.ai queue
 */
async function submitToFalQueue(
  modelId: string,
  input: Record<string, unknown>
): Promise<FalQueueResponse> {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) throw new Error("FAL_API_KEY is not configured");

  const url = `${FAL_QUEUE_BASE}/${modelId}`;
  
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fal.ai API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Get status of a Fal.ai queue request using the status URL
 */
export async function getFalRequestStatus(
  statusUrl: string
): Promise<FalStatusResponse> {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) throw new Error("FAL_API_KEY is not configured");

  const response = await fetch(statusUrl, {
    method: "GET",
    headers: {
      "Authorization": `Key ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fal.ai status error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Get result of a completed Fal.ai request using the response URL
 */
export async function getFalRequestResult(
  responseUrl: string
): Promise<FalImageOutput | FalVideoOutput | FalAudioOutput> {
  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) throw new Error("FAL_API_KEY is not configured");

  const response = await fetch(responseUrl, {
    method: "GET",
    headers: {
      "Authorization": `Key ${apiKey}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Fal.ai result error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

/**
 * Map aspect ratio to Fal.ai image_size format
 */
function mapAspectRatioToImageSize(aspectRatio?: string): string {
  const mapping: Record<string, string> = {
    "1:1": "square",
    "16:9": "landscape_16_9",
    "9:16": "portrait_16_9",
    "4:3": "landscape_4_3",
    "3:4": "portrait_4_3",
    "3:2": "landscape_4_3", // closest match
    "2:3": "portrait_4_3", // closest match
  };
  return mapping[aspectRatio || "1:1"] || "square";
}

// Fal.ai uses polling, not WebSocket - this handler is for the polling mechanism
const falWebSocketHandler: WebSocketHandler = {
  getInitMessage: (socketAccessToken: string) => {
    // For Fal.ai, socketAccessToken contains "modelId:requestId"
    // This initiates the polling mechanism
    return JSON.stringify({
      type: "fal_init",
      data: socketAccessToken,
    });
  },

  handleMessage: (_event: MessageEvent, _callbacks: WebSocketCallbacks) => {
    // Fal.ai doesn't use WebSocket - polling is handled by the client
    // This is a no-op as the actual status checking is done via HTTP polling
  },
};

export const falGeneratorPlugin: MediaGeneratorPlugin = {
  id: "fal",
  name: "Fal.ai",
  logo: "/sponsors/fal.svg",
  logoDark: "/sponsors/fal-dark.svg",

  isConfigured: () => {
    return !!(
      process.env.FAL_API_KEY &&
      (process.env.FAL_VIDEO_MODELS || process.env.FAL_IMAGE_MODELS || process.env.FAL_AUDIO_MODELS)
    );
  },

  isEnabled: () => {
    return falGeneratorPlugin.isConfigured();
  },

  getModels: () => {
    if (!falGeneratorPlugin.isEnabled()) {
      return [];
    }
    const imageModels = parseModels(process.env.FAL_IMAGE_MODELS, "image");
    const videoModels = parseModels(process.env.FAL_VIDEO_MODELS, "video");
    const audioModels = parseModels(process.env.FAL_AUDIO_MODELS, "audio");
    return [...imageModels, ...videoModels, ...audioModels];
  },

  async startGeneration(request: GenerationRequest): Promise<GenerationTask> {
    if (!this.isConfigured()) {
      throw new Error(
        "Fal.ai is not configured. Please set FAL_API_KEY and FAL_VIDEO_MODELS or FAL_IMAGE_MODELS."
      );
    }

    const input: Record<string, unknown> = {
      prompt: request.prompt,
    };

    if (request.type === "video") {
      // Video generation parameters
      if (request.aspectRatio) {
        input.aspect_ratio = request.aspectRatio;
      }
      if (request.inputImageUrl) {
        input.image_url = request.inputImageUrl;
      }
    } else if (request.type === "audio") {
      // Audio generation parameters
      input.duration_seconds = 30;
      input.duration = 30;
    } else {
      // Image generation parameters
      input.image_size = mapAspectRatioToImageSize(request.aspectRatio);
      input.num_images = 1;
      if (request.inputImageUrl) {
        input.image_url = request.inputImageUrl;
      }
    }

    const queueResponse = await submitToFalQueue(request.model, input);

    // Return status_url and response_url encoded in socketAccessToken for polling
    // Format: statusUrl|responseUrl
    return {
      taskId: queueResponse.request_id,
      socketAccessToken: `${queueResponse.status_url}|${queueResponse.response_url}`,
    };
  },

  getWebSocketUrl: () => {
    // Fal.ai uses polling, return empty to indicate polling mode
    return "";
  },

  webSocketHandler: falWebSocketHandler,

  async checkStatus(socketAccessToken: string): Promise<PollStatusResult> {
    // Parse statusUrl|responseUrl from socketAccessToken
    const [statusUrl, responseUrl] = socketAccessToken.split("|");
    
    if (!statusUrl || !responseUrl) {
      throw new Error("Invalid token format");
    }

    const status = await getFalRequestStatus(statusUrl);
    
    // Map status to our format
    const statusKey = falStatusMap[status.status] || "generating";
    
    // Calculate progress based on status
    let progress = 0;
    switch (status.status) {
      case "IN_QUEUE":
        progress = 25;
        break;
      case "IN_PROGRESS":
        progress = 50;
        break;
      case "COMPLETED":
        progress = 100;
        break;
      case "FAILED":
        progress = 0;
        break;
    }

    // If completed, fetch the result
    let outputUrls: string[] = [];
    if (status.status === "COMPLETED") {
      const result = await getFalRequestResult(responseUrl);
      outputUrls = extractOutputUrls(result);
    }

    return {
      status: status.status.toLowerCase().replace("_", "_") as PollStatusResult["status"],
      statusKey,
      progress,
      queuePosition: status.queue_position,
      outputUrls,
    };
  },
};

/**
 * Extract output URLs from Fal.ai result
 */
function extractOutputUrls(result: FalImageOutput | FalVideoOutput | FalAudioOutput): string[] {
  const urls: string[] = [];

  // Image outputs
  if ("images" in result && result.images) {
    urls.push(...result.images.map((img) => img.url));
  }
  if ("image" in result && result.image) {
    urls.push(result.image.url);
  }

  // Video outputs
  if ("videos" in result && result.videos) {
    urls.push(...result.videos.map((vid) => vid.url));
  }
  if ("video" in result && result.video) {
    urls.push(result.video.url);
  }

  // Audio outputs
  if ("audio_file" in result && result.audio_file) {
    urls.push(result.audio_file.url);
  }
  if ("audio" in result && result.audio) {
    if (Array.isArray(result.audio)) {
      urls.push(...result.audio.map((a) => a.url));
    } else {
      urls.push(result.audio.url);
    }
  }

  return urls;
}
