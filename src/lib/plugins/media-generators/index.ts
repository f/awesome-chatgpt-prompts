/**
 * Media Generators Plugin Registry
 * 
 * Manages AI-powered media generation plugins for images and videos.
 */

import { wiroGeneratorPlugin } from "./wiro";
import { falGeneratorPlugin } from "./fal";
import type { MediaGeneratorPlugin, MediaGeneratorModel, MediaType, WebSocketHandler } from "./types";

export * from "./types";

// Export individual plugins for direct access to handlers
export { wiroGeneratorPlugin } from "./wiro";
export { falGeneratorPlugin } from "./fal";

const mediaGeneratorRegistry = new Map<string, MediaGeneratorPlugin>();

let initialized = false;

export function registerMediaGeneratorPlugin(plugin: MediaGeneratorPlugin): void {
  mediaGeneratorRegistry.set(plugin.id, plugin);
}

export function getMediaGeneratorPlugin(id: string): MediaGeneratorPlugin | undefined {
  return mediaGeneratorRegistry.get(id);
}

export function getAllMediaGeneratorPlugins(): MediaGeneratorPlugin[] {
  return Array.from(mediaGeneratorRegistry.values());
}

export function getEnabledMediaGeneratorPlugins(): MediaGeneratorPlugin[] {
  return getAllMediaGeneratorPlugins().filter((p) => p.isEnabled());
}

export function initializeMediaGenerators(): void {
  if (initialized) return;

  registerMediaGeneratorPlugin(wiroGeneratorPlugin);
  registerMediaGeneratorPlugin(falGeneratorPlugin);

  initialized = true;
}

/**
 * Get all available models from enabled generators
 */
export function getAvailableModels(type?: MediaType): Array<MediaGeneratorModel & { provider: string }> {
  initializeMediaGenerators();

  const models: Array<MediaGeneratorModel & { provider: string }> = [];

  for (const plugin of getEnabledMediaGeneratorPlugins()) {
    const pluginModels = plugin.getModels();
    for (const model of pluginModels) {
      if (!type || model.type === type) {
        models.push({
          ...model,
          provider: plugin.id,
        });
      }
    }
  }

  return models;
}

/**
 * Check if any media generator is available
 */
export function isMediaGenerationAvailable(): boolean {
  initializeMediaGenerators();
  return getEnabledMediaGeneratorPlugins().length > 0;
}
