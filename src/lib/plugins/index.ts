import { registerBuiltInAuthPlugins } from "./auth";
import { registerBuiltInStoragePlugins } from "./storage";
import { getAuthPlugin, getStoragePlugin } from "./registry";
import { getConfig } from "@/lib/config";

// Export all types
export * from "./types";
export * from "./registry";

// Initialize all built-in plugins
let initialized = false;

export function initializePlugins(): void {
  if (initialized) return;
  
  registerBuiltInAuthPlugins();
  registerBuiltInStoragePlugins();
  
  initialized = true;
}

/**
 * Get the configured auth plugin based on prompts.config.ts
 */
export async function getConfiguredAuthPlugin() {
  initializePlugins();
  const config = await getConfig();
  const plugin = getAuthPlugin(config.auth.provider);
  
  if (!plugin) {
    throw new Error(
      `Auth plugin "${config.auth.provider}" not found. ` +
      `Available plugins: credentials, google, azure, github`
    );
  }
  
  return plugin;
}

/**
 * Get the configured storage plugin based on prompts.config.ts
 */
export async function getConfiguredStoragePlugin() {
  initializePlugins();
  const config = await getConfig();
  const plugin = getStoragePlugin(config.storage.provider);
  
  if (!plugin) {
    throw new Error(
      `Storage plugin "${config.storage.provider}" not found. ` +
      `Available plugins: url, s3`
    );
  }
  
  return plugin;
}
