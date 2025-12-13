import { registerStoragePlugin } from "../registry";
import { urlStoragePlugin } from "./url";

const ENABLED_STORAGE: string = process.env.ENABLED_STORAGE || "url";

// Register all built-in storage plugins
export function registerBuiltInStoragePlugins(): void {
  if (ENABLED_STORAGE === "url") {
    registerStoragePlugin(urlStoragePlugin);
    return
  }

  if (ENABLED_STORAGE === "s3") {
    // To enable S3 storage:
    // 1. Set S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY env vars
    import("./s3").then(({ s3StoragePlugin }) => {
      registerStoragePlugin(s3StoragePlugin);
    });
    return;
  }

  if (ENABLED_STORAGE === "do-spaces") {
    // To enable DO Spaces storage:
    // 1. Set DO_SPACES_BUCKET, DO_SPACES_REGION, DO_SPACES_ACCESS_KEY_ID, DO_SPACES_SECRET_ACCESS_KEY env vars
    import("./do-spaces").then(({ doSpacesStoragePlugin }) => {
      registerStoragePlugin(doSpacesStoragePlugin);
    });
    return;
  }

  console.warn(`No storage plugin enabled for "${ENABLED_STORAGE}"`);
}

export { urlStoragePlugin };
