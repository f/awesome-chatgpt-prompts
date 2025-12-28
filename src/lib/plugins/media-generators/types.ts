/**
 * Media Generator Plugin Types
 * 
 * Interface definitions for AI-powered media generation plugins.
 */

export type MediaType = "image" | "video" | "audio";

export interface MediaGeneratorModel {
  id: string;
  name: string;
  type: MediaType;
}

export type AspectRatio = "1:1" | "16:9" | "9:16" | "4:3" | "3:4" | "3:2" | "2:3";

export interface GenerationRequest {
  prompt: string;
  model: string;
  type: MediaType;
  inputImageUrl?: string;
  resolution?: string;
  aspectRatio?: AspectRatio;
}

export interface GenerationTask {
  taskId: string;
  socketAccessToken: string;
}

export interface GenerationProgress {
  type: string;
  message?: string;
  outputs?: Array<{ url: string }>;
}

export interface GenerationResult {
  success: boolean;
  urls: string[];
  error?: string;
}

/**
 * Result from polling-based status check
 */
export interface PollStatusResult {
  status: "in_queue" | "in_progress" | "completed" | "failed";
  statusKey: GenerationStatusKey;
  progress: number;
  queuePosition?: number;
  outputUrls: string[];
  error?: string;
}

// WebSocket handler types (client-side)
export interface WebSocketCallbacks {
  setProgress: (value: number | ((prev: number) => number)) => void;
  setStatus: (status: "idle" | "confirming" | "starting" | "queued" | "processing" | "completed" | "error") => void;
  setStatusMessage: (key: GenerationStatusKey) => void;
  setError: (error: string | null) => void;
  onComplete: (outputUrls: string[]) => void;
  onCleanup: () => void;
}

/**
 * Static generation status keys used across all providers.
 * These map to translation keys in messages/*.json under prompts.mediaGeneration.*
 */
export type GenerationStatusKey =
  | "connecting"
  | "connected"
  | "queued"
  | "accepted"
  | "preprocessStart"
  | "preprocessEnd"
  | "gpuAssigned"
  | "started"
  | "generating"
  | "processingOutput"
  | "ending"
  | "postprocessStart"
  | "postprocessEnd"
  | "complete"
  | "error"
  | "errorProcessing";

export interface WebSocketHandler {
  getInitMessage: (socketAccessToken: string) => string;
  handleMessage: (event: MessageEvent, callbacks: WebSocketCallbacks) => void;
}

export interface MediaGeneratorPlugin {
  id: string;
  name: string;
  logo?: string;
  logoDark?: string;
  /**
   * Check if the plugin is properly configured
   */
  isConfigured: () => boolean;
  /**
   * Check if the plugin is enabled (configured + not disabled)
   */
  isEnabled: () => boolean;
  /**
   * Get available models for generation
   */
  getModels: () => MediaGeneratorModel[];
  /**
   * Start a generation task and return task info for WebSocket connection
   */
  startGeneration: (request: GenerationRequest) => Promise<GenerationTask>;
  /**
   * Get WebSocket URL for tracking progress (empty string = uses polling)
   */
  getWebSocketUrl: () => string;
  /**
   * Get client-side WebSocket handler for this provider
   */
  webSocketHandler: WebSocketHandler;
  /**
   * Check status of a generation task (for polling-based providers)
   * Returns null if provider uses WebSocket instead of polling
   */
  checkStatus?: (socketAccessToken: string) => Promise<PollStatusResult>;
}
