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
  build: {
    // 依然保留这个核心配置，踢出 native 二进制依赖
    external: ["@swc/core", "@swc/wasm", "fsevents"],
    minify: true,
  },
};

export default config;
