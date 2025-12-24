/**
 * Fal.ai Media Generator Plugin
 * 
 * Generates images and videos using Fal.ai API.
 * 
 * NOTE: This plugin is currently DISABLED and serves as a placeholder.
 * 
 * Required env vars:
 * - FAL_API_KEY
 * - FAL_VIDEO_MODELS (comma-separated)
 * - FAL_IMAGE_MODELS (comma-separated)
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

function parseModels(envVar: string | undefined, type: "image" | "video"): MediaGeneratorModel[] {
  if (!envVar) return [];
  return envVar
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean)
    .map((id) => ({
      id,
      name: id.split("/").pop() || id,
      type,
    }));
}

// Map Fal.ai message types to static translation keys (placeholder - uses same keys as Wiro)
const falStatusMap: Record<string, GenerationStatusKey> = {
  pending: "queued",
  in_progress: "generating",
  completed: "complete",
  failed: "error",
};

// Placeholder WebSocket handler for Fal.ai - to be implemented when enabling
const falWebSocketHandler: WebSocketHandler = {
  getInitMessage: (_socketAccessToken: string) => {
    // Fal.ai may use a different initialization mechanism
    return "";
  },

  handleMessage: (_event: MessageEvent, callbacks: WebSocketCallbacks) => {
    // Placeholder - Fal.ai WebSocket handling not implemented yet
    callbacks.setError("Fal.ai WebSocket handling is not implemented yet");
  },
};

// Export for potential future use
export { falStatusMap };

export const falGeneratorPlugin: MediaGeneratorPlugin = {
  id: "fal",
  name: "Fal.ai",

  isConfigured: () => {
    return !!(
      process.env.FAL_API_KEY &&
      (process.env.FAL_VIDEO_MODELS || process.env.FAL_IMAGE_MODELS)
    );
  },

  isEnabled: () => {
    // Fal.ai is disabled for now - return false even if configured
    return false;
  },

  getModels: () => {
    // Return empty array since disabled
    if (!falGeneratorPlugin.isEnabled()) {
      return [];
    }
    const imageModels = parseModels(process.env.FAL_IMAGE_MODELS, "image");
    const videoModels = parseModels(process.env.FAL_VIDEO_MODELS, "video");
    return [...imageModels, ...videoModels];
  },

  async startGeneration(_request: GenerationRequest): Promise<GenerationTask> {
    throw new Error(
      "Fal.ai integration is not yet implemented. Please use Wiro.ai or upload media directly."
    );
  },

  getWebSocketUrl: () => {
    // Placeholder - Fal.ai may use a different WebSocket mechanism
    return "";
  },

  webSocketHandler: falWebSocketHandler,
};
