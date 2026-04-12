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
  // 刚才报错信息里提到的额外部分也给它补上
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
  build: {
    // 依然保留咱们之前的“地雷排查”配置
    external: ["@swc/core", "@swc/wasm", "fsevents"],
    minify: true,
  },
};

export default config;
