import { defineConfig } from "@/lib/config";

// Example custom configuration for Docker deployments
// Usage:
//   1. cp prompts.config.custom.example.ts prompts.config.custom.ts
//   2. Edit prompts.config.custom.ts with your settings
//   3. docker compose build && docker compose up -d

const useCloneBranding = true;

export default defineConfig({
  // Branding - customize for your organization
  branding: {
    name: "My Prompt Library",
    logo: "/assets/logo.svg", // Place in ./assets/
    logoDark: "/assets/logo-dark.svg",
    favicon: "/assets/favicon.svg",
    description: "Our team's curated AI prompts",
  },

  // Theme
  theme: {
    radius: "md",
    variant: "default",
    density: "default",
    colors: {
      primary: "#10b981", // Your brand color
    },
  },

  // Authentication - choose your providers
  auth: {
    // Options: "credentials", "github", "google", "azure", "apple"
    providers: ["github", "google"],
    allowRegistration: true,
  },

  // Internationalization
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },

  // Features - enable/disable as needed
  features: {
    privatePrompts: true,
    changeRequests: true,
    categories: true,
    tags: true,
    aiSearch: false, // Requires OPENAI_API_KEY
    aiGeneration: false,
    mcp: false,
    comments: true,
  },

  // Homepage - use your own branding
  homepage: {
    useCloneBranding,
    achievements: { enabled: false },
    sponsors: { enabled: false },
  },
});

