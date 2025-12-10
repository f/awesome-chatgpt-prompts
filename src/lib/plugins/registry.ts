import type { AuthPlugin, StoragePlugin, PluginRegistry } from "./types";

// Global plugin registry
const registry: PluginRegistry = {
  auth: new Map(),
  storage: new Map(),
};

// ============================================
// Auth Plugin Registration
// ============================================

export function registerAuthPlugin(plugin: AuthPlugin): void {
  registry.auth.set(plugin.id, plugin);
}

export function getAuthPlugin(id: string): AuthPlugin | undefined {
  return registry.auth.get(id);
}

export function getAllAuthPlugins(): AuthPlugin[] {
  return Array.from(registry.auth.values());
}

// ============================================
// Storage Plugin Registration
// ============================================

export function registerStoragePlugin(plugin: StoragePlugin): void {
  registry.storage.set(plugin.id, plugin);
}

export function getStoragePlugin(id: string): StoragePlugin | undefined {
  return registry.storage.get(id);
}

export function getAllStoragePlugins(): StoragePlugin[] {
  return Array.from(registry.storage.values());
}

// ============================================
// Registry Access
// ============================================

export function getRegistry(): PluginRegistry {
  return registry;
}
