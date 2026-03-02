import { defineConfig } from "vite";
import vinext from "vinext";
import rsc from "@vitejs/plugin-rsc";
import { cloudflare } from "@cloudflare/vite-plugin";
import { sentryVitePlugin } from "@sentry/vite-plugin";

export default defineConfig({
  plugins: [
    vinext(),
    rsc({
      entries: {
        rsc: "virtual:vinext-rsc-entry",
        ssr: "virtual:vinext-app-ssr-entry",
        client: "virtual:vinext-app-browser-entry",
      },
    }),
    cloudflare({
      viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
    }),
    sentryVitePlugin({
      org: "promptschat",
      project: "prompts-chat",
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        filesToDeleteAfterUpload: ["**/*.map"],
      },
    }),
  ],
});
