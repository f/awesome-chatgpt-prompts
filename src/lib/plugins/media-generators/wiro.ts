/**
 * Wiro.ai Media Generator Plugin
 * 
 * Generates images and videos using Wiro.ai API.
 * 
 * Required env vars:
 * - WIRO_API_KEY
 * - WIRO_VIDEO_MODELS (comma-separated, e.g., "google/veo3.1-fast")
 * - WIRO_IMAGE_MODELS (comma-separated, e.g., "google/nano-banana-pro,google/nano-banana")
 * - WIRO_AUDIO_MODELS (comma-separated, e.g., "elevenlabs/sound-effects")
 */

import type {
  MediaGeneratorPlugin,
  MediaGeneratorModel,
  GenerationRequest,
  GenerationTask,
  WebSocketHandler,
  WebSocketCallbacks,
  GenerationStatusKey,
} from "./types";

const WIRO_API_BASE = "https://api.wiro.ai/v1";
const WIRO_SOCKET_URL = "wss://socket.wiro.ai/v1";

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

// Map Wiro message types to static translation keys
const wiroStatusMap: Record<string, GenerationStatusKey> = {
  task_queue: "queued",
  task_accept: "accepted",
  task_preprocess_start: "preprocessStart",
  task_preprocess_end: "preprocessEnd",
  task_assign: "gpuAssigned",
  task_start: "started",
  task_output: "generating",
  task_error: "error",
  task_output_full: "processingOutput",
  task_error_full: "errorProcessing",
  task_end: "ending",
  task_postprocess_start: "postprocessStart",
  task_postprocess_end: "complete",
};

const wiroWebSocketHandler: WebSocketHandler = {
  getInitMessage: (socketAccessToken: string) => {
    return JSON.stringify({
      type: "task_info",
      tasktoken: socketAccessToken,
    });
  },

  handleMessage: (event: MessageEvent, callbacks: WebSocketCallbacks) => {
    const { setProgress, setStatus, setStatusMessage, onComplete, onCleanup } = callbacks;

    try {
      const msg = JSON.parse(event.data);

      if (msg.type) {
        const statusKey = wiroStatusMap[msg.type];
        if (statusKey) {
          setStatusMessage(statusKey);
        }

        switch (msg.type) {
          case "task_queue":
            setProgress(25);
            break;
          case "task_accept":
            setProgress(30);
            break;
          case "task_preprocess_start":
            setProgress(35);
            break;
          case "task_preprocess_end":
            setProgress(40);
            break;
          case "task_assign":
            setProgress(45);
            break;
          case "task_start":
            setStatus("processing");
            setProgress(50);
            break;
          case "task_output":
            setProgress((prev) => Math.min(prev + 5, 85));
            break;
          case "task_error":
            console.error("Wiro task error:", msg.message);
            break;
          case "task_end":
            setProgress(90);
            break;
          case "task_postprocess_start":
            setProgress(92);
            break;
          case "task_postprocess_end":
            setProgress(100);
            setStatus("completed");

            // Extract output URLs
            if (msg.message && Array.isArray(msg.message) && msg.message.length > 0) {
              const urls = msg.message.map((item: { url: string }) => item.url).filter(Boolean);
              if (urls.length > 0) {
                onComplete(urls);
              }
            }
            onCleanup();
            break;
        }
      }
    } catch (err) {
      console.error("Wiro WebSocket message parse error:", err);
    }
  },
};

export const wiroGeneratorPlugin: MediaGeneratorPlugin = {
  id: "wiro",
  name: "Wiro.ai",
  logo: "/sponsors/wiro.png",
  logoDark: "/sponsors/wiro.png",

  isConfigured: () => {
    return !!(
      process.env.WIRO_API_KEY &&
      (process.env.WIRO_VIDEO_MODELS || process.env.WIRO_IMAGE_MODELS || process.env.WIRO_AUDIO_MODELS)
    );
  },

  isEnabled: () => {
    return wiroGeneratorPlugin.isConfigured();
  },

  getModels: () => {
    const imageModels = parseModels(process.env.WIRO_IMAGE_MODELS, "image");
    const videoModels = parseModels(process.env.WIRO_VIDEO_MODELS, "video");
    const audioModels = parseModels(process.env.WIRO_AUDIO_MODELS, "audio");
    return [...imageModels, ...videoModels, ...audioModels];
  },

  async startGeneration(request: GenerationRequest): Promise<GenerationTask> {
    if (!this.isConfigured()) {
      throw new Error(
        "Wiro.ai is not configured. Please set WIRO_API_KEY and WIRO_VIDEO_MODELS or WIRO_IMAGE_MODELS."
      );
    }

    const apiKey = process.env.WIRO_API_KEY!;
    const url = `${WIRO_API_BASE}/Run/${request.model}`;

    const formData = new FormData();
    formData.append("prompt", request.prompt);
    
    if (request.type === "video") {
      // Video-specific parameters
      formData.append("resolution", "720p");
      formData.append("generateAudio", "false");
      formData.append("enhancePrompt", "true");
      formData.append("personGeneration", "allow_adult");
      formData.append("durationSeconds", "4");
      if (request.aspectRatio) {
        formData.append("aspectRatio", request.aspectRatio);
      }
    } else if (request.type === "audio") {
      // Audio-specific parameters
      formData.append("durationSeconds", "30");
    } else {
      // Image-specific parameters
      formData.append("resolution", request.resolution || "1K");
      if (request.aspectRatio) {
        formData.append("aspectRatio", request.aspectRatio);
      }
    }

    if (request.inputImageUrl) {
      // Fetch the image and add it to the form
      const imageResponse = await fetch(request.inputImageUrl);
      if (imageResponse.ok) {
        const imageBlob = await imageResponse.blob();
        formData.append("inputImage", imageBlob, "input.jpg");
      }
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Wiro.ai API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    if (!result.result) {
      throw new Error(
        `Wiro.ai generation failed: ${result.errors?.join(", ") || "Unknown error"}`
      );
    }

    return {
      taskId: result.taskid,
      socketAccessToken: result.socketaccesstoken,
    };
  },

  getWebSocketUrl: () => {
    return WIRO_SOCKET_URL;
  },

  webSocketHandler: wiroWebSocketHandler,
};
