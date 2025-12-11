import { defineConfig } from "@/lib/config";

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
    density: "compact",
    // Colors (hex or oklch)
    colors: {
      primary: "#6366f1", // Indigo
    },
  },

  // Authentication plugin
  auth: {
    // Available: "credentials" | "google" | "azure" | "github" | custom
    provider: "github",
    // Allow public registration
    allowRegistration: false,
  },

  // Storage plugin for media uploads
  storage: {
    // Available: "url" | "s3" | custom
    provider: "url",
  },

  // Internationalization
  i18n: {
    locales: ["en", "tr", "es", "zh", "ja"],
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
    aiSearch: false,
  },

  // Homepage customization
  homepage: {
    achievements: {
      enabled: true,
    },
    sponsors: {
      enabled: true,
      items: [
        // Add sponsors here
        { name: "Clemta", logo: "https://clemta.com/wp-content/uploads/2023/03/logo-clemta-com-1.png.webp", url: "https://clemta.com" },
        { name: "MCPTools", logo: "https://github.com/f/mcptools/raw/master/.github/resources/logo.png", url: "https://github.com/f/mcptools" },
      ],
    },
  },
});
