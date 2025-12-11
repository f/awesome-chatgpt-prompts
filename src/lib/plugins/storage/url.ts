import type { StoragePlugin, UploadResult } from "../types";

/**
 * URL Storage Plugin
 * 
 * This plugin only stores external URLs - no actual file upload.
 * Users provide URLs to external images/videos.
 */
export const urlStoragePlugin: StoragePlugin = {
  id: "url",
  name: "External URL",
  
  isConfigured: () => true, // Always available
  
  async upload(file: File | Buffer): Promise<UploadResult> {
    // This plugin doesn't actually upload files
    // It's meant for storing external URLs only
    throw new Error(
      "URL storage plugin does not support file uploads. " +
      "Please provide an external URL instead, or configure an upload-capable storage plugin like S3."
    );
  },
  
  async delete(): Promise<void> {
    // URLs cannot be deleted as they're external
    // This is a no-op
  },
};
