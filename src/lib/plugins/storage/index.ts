import { registerStoragePlugin } from "../registry";
import { urlStoragePlugin } from "./url";

// Register all built-in storage plugins
// S3 and DO Spaces storage removed for Cloudflare Workers (saves ~850 KiB from @aws-sdk)
export function registerBuiltInStoragePlugins(): void {
  registerStoragePlugin(urlStoragePlugin);
}

export { urlStoragePlugin };
