// open-next.config.ts
import { defineConfig } from "@opennextjs/cloudflare";

export default defineConfig({
  default: {
    runtime: "edge",
    placement: "smart",
  },
  build: {
    // 核心修复：将 SWC 相关的二进制依赖标记为外部依赖，不打包进 Worker
    external: ["@swc/core", "@swc/wasm", "fsevents"],
    // 开启混淆压缩，减小 bundle 体积，防止超过 Cloudflare 限制
    minify: true,
  },
});
