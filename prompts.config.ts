import { defineConfig } from "@/lib/config";

// Set to true to use clone branding (hide prompts.chat repo branding)
const useCloneBranding = false;

export default defineConfig({
  // Branding - customize for white-label
  branding: {
    name: "prompts.chat",
    logo: "/logo.svg",
    logoDark: "/logo-dark.svg",
    favicon: "/logo.svg",
    description: "Collect, organize, and share AI prompts",
  },

  // Theme - design system configuration
  theme: {
    // Border radius: "none" | "sm" | "md" | "lg"
    radius: "sm",
    // UI style: "flat" | "default" | "brutal"
    variant: "default",
    // Spacing density: "compact" | "default" | "comfortable"
    density: "default",
    // Colors (hex or oklch)
    colors: {
      primary: "#6366f1", // Indigo
    },
  },

  // Authentication plugins
  auth: {
    // Available: "credentials" | "google" | "azure" | "github" | custom
    // Use `providers` array to enable multiple auth providers
    providers: ["github", "google"],
    // Allow public registration (only applies to credentials provider)
    allowRegistration: false,
  },

  // Storage plugin for media uploads
  storage: {
    // Available: "url" | "s3" | custom
    provider: "url",
  },

  // Internationalization
  i18n: {
    locales: ["en", "tr", "es", "zh", "ja", "ar", "pt", "fr", "it", "de", "ko"],
    defaultLocale: "en",
  },

  // Features
  features: {
    // Allow users to create private prompts
    privatePrompts: true,
    // Enable change request system for versioning
    changeRequests: true,
    // Enable categories
    categories: true,
    // Enable tags
    tags: true,
    // Enable AI-powered semantic search (requires OPENAI_API_KEY)
    aiSearch: true,
    // Enable AI-powered generation features (requires OPENAI_API_KEY)
    aiGeneration: true,
  },

  // Homepage customization
  homepage: {
    // Set to true to hide prompts.chat repo branding and use your own branding
    useCloneBranding,
    achievements: {
      enabled: !useCloneBranding,
    },
    sponsors: {
      enabled: !useCloneBranding,
      items: [
        // Add sponsors here
        { name: "Clemta", logo: "https://clemta.com/wp-content/uploads/2023/03/logo-clemta-com-1.png.webp", url: "https://clemta.com" },
        { name: "warp.dev", className: 'p-2', logo: `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 79 18" overflow="visible"><g><path d="M 10.651 0 L 18.482 0 C 19.749 0 20.777 1.059 20.777 2.365 L 20.777 11.545 C 20.777 12.851 19.749 13.91 18.482 13.91 L 7.276 13.91 Z" fill="rgb(0,0,0)"></path><path d="M 8.583 2.663 L 2.276 2.663 C 1.019 2.663 0 3.721 0 5.027 L 0 14.208 C 0 15.514 1.019 16.573 2.275 16.573 L 10.039 16.573 L 10.35 15.279 L 5.548 15.279 Z M 30.145 13.932 L 26.693 2.666 L 28.643 2.666 L 31.086 11.272 L 33.732 2.666 L 35.57 2.666 L 38.215 11.272 L 40.636 2.666 L 42.631 2.666 L 39.156 13.932 L 37.296 13.932 L 34.651 5.371 L 32.005 13.932 Z M 51.231 6.601 C 51.231 5.058 50.132 4.075 48.473 4.075 C 46.927 4.075 45.828 4.991 45.671 6.511 L 43.901 6.176 C 44.237 3.941 46.097 2.488 48.473 2.488 C 51.208 2.488 53.114 4.097 53.114 6.712 L 53.114 13.932 L 51.231 13.932 L 51.231 12.01 C 50.581 13.306 49.101 14.111 47.465 14.111 C 45.201 14.111 43.654 12.725 43.654 10.78 C 43.654 8.612 45.425 7.427 49.034 7.07 L 51.231 6.824 Z M 45.559 10.758 C 45.559 11.808 46.456 12.546 47.756 12.546 C 49.953 12.546 51.231 11.093 51.231 8.836 L 51.231 8.299 L 49.034 8.545 C 46.747 8.791 45.559 9.573 45.559 10.758 Z M 65.94 6.489 L 64.035 6.846 C 63.945 5.17 62.892 4.209 61.188 4.209 C 59.103 4.209 57.758 6.086 57.758 9.104 L 57.758 13.932 L 55.853 13.932 L 55.853 2.666 L 57.758 2.666 L 57.758 4.88 C 58.588 3.27 59.977 2.488 61.636 2.488 C 64.147 2.488 65.851 4.053 65.94 6.489 Z M 67.971 18 L 67.971 2.666 L 69.877 2.666 L 69.877 4.298 C 70.482 3.27 71.961 2.488 73.598 2.488 C 77.072 2.488 79 4.991 79 8.299 C 79 11.607 77.028 14.11 73.553 14.11 C 72.118 14.11 70.639 13.395 69.877 12.367 L 69.877 18 L 67.971 18 Z M 73.374 12.412 C 75.615 12.412 77.072 10.78 77.072 8.299 C 77.072 5.818 75.615 4.186 73.374 4.186 C 71.177 4.186 69.72 5.818 69.72 8.299 C 69.72 10.78 71.177 12.412 73.374 12.412 Z" fill="rgb(0,0,0)"></path></g></svg>`, url: "https://warp.dev" },
        { name: "MCPTools", logo: "https://github.com/f/mcptools/raw/master/.github/resources/logo.png", url: "https://github.com/f/mcptools" },
      ],
    },
  },
});
