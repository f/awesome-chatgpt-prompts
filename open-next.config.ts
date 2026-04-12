// open-next.config.ts
const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  // 报错信息里明确要求的字段，必须有
  edgeExternals: ["node:crypto"],
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  // 咱们之前为了解决 SWC 二进制崩溃加的配置
  build: {
    external: ["@swc/core", "@swc/wasm", "fsevents"],
    minify: true,
  },
};

export default config;
