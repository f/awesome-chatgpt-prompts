// open-next.config.ts
import { defineConfig } from "@opennextjs/cloudflare";

export default defineConfig({
  default: {
    runtime: "edge",
    placement: "smart",
  },
  build: {
    // 踢出二进制依赖，防止打包崩溃
    external: ["@swc/core", "@swc/wasm", "fsevents"],
    minify: true,
  },
});
