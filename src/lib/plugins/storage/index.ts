import { registerStoragePlugin } from "../registry";
import { urlStoragePlugin } from "./url";

// Register all built-in storage plugins
export function registerBuiltInStoragePlugins(): void {
  registerStoragePlugin(urlStoragePlugin);
  
  // S3 plugin requires @aws-sdk/client-s3 to be installed
  // To enable S3 storage:
  // 1. npm install @aws-sdk/client-s3
  // 2. Set S3_BUCKET, S3_REGION, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY env vars
  // 3. Uncomment the code below:
  //
  // import("./s3").then(({ s3StoragePlugin }) => {
  //   registerStoragePlugin(s3StoragePlugin);
  // });
}

export { urlStoragePlugin };
