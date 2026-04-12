// open-next.config.ts
// 不再从包里 import defineConfig，直接导出一个兼容的配置对象

const config = {
  default: {
    runtime: "edge",
    placement: "smart",
  },
  build: {
    // 依然保留这个核心配置，防止二进制依赖报错
    external: ["@swc/core", "@swc/wasm", "fsevents"],
    minify: true,
  },
};

export default config;
