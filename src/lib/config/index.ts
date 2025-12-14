export interface BrandingConfig {
  name: string;
  logo: string;
  logoDark?: string;
  favicon: string;
  description: string;
}

export interface ThemeConfig {
  // Appearance
  radius: "none" | "sm" | "md" | "lg"; // Border radius
  variant: "flat" | "default" | "brutal"; // UI style variant
  density: "compact" | "default" | "comfortable"; // Spacing density
  // Colors (CSS oklch values or hex)
  colors: {
    primary: string;
    secondary?: string;
    accent?: string;
  };
}

export type AuthProvider = "credentials" | "google" | "azure" | "github" | string;

export interface AuthConfig {
  /** @deprecated Use `providers` array instead */
  provider?: AuthProvider;
  /** Array of auth providers to enable (e.g., ["github", "google"]) */
  providers?: AuthProvider[];
  allowRegistration: boolean;
}

export interface StorageConfig {
  provider: "url" | "s3" | string;
}

export interface I18nConfig {
  locales: string[];
  defaultLocale: string;
}

export interface FeaturesConfig {
  privatePrompts: boolean;
  changeRequests: boolean;
  categories: boolean;
  tags: boolean;
  aiSearch?: boolean;
  aiGeneration?: boolean;
}

export interface Sponsor {
  name: string;
  logo: string;
  url: string;
  className?: string;
}

export interface HomepageConfig {
  // Hide prompts.chat repo branding (achievements, GitHub links) and use clone's branding
  useCloneBranding?: boolean;
  achievements?: {
    enabled: boolean;
  };
  sponsors?: {
    enabled: boolean;
    items: Sponsor[];
  };
}

export interface PromptsConfig {
  branding: BrandingConfig;
  theme: ThemeConfig;
  auth: AuthConfig;
  storage: StorageConfig;
  i18n: I18nConfig;
  features: FeaturesConfig;
  homepage?: HomepageConfig;
}

export function defineConfig(config: PromptsConfig): PromptsConfig {
  return config;
}

// Load the user's config
let cachedConfig: PromptsConfig | null = null;

export async function getConfig(): Promise<PromptsConfig> {
  if (cachedConfig) return cachedConfig;

  try {
    // Dynamic import of user config
    const userConfig = await import("@/../prompts.config");
    cachedConfig = userConfig.default;
    return cachedConfig;
  } catch {
    // Fallback to default config
    cachedConfig = {
      branding: {
        name: "prompts.chat",
        logo: "/logo.svg",
        logoDark: "/logo-dark.svg",
        favicon: "/favicon.ico",
        description: "Collect, organize, and share AI prompts",
      },
      theme: {
        radius: "sm",
        variant: "flat",
        density: "compact",
        colors: {
          primary: "#6366f1",
        },
      },
      auth: {
        providers: ["credentials"],
        allowRegistration: true,
      },
      storage: {
        provider: "url",
      },
      i18n: {
        locales: ["en"],
        defaultLocale: "en",
      },
      features: {
        privatePrompts: true,
        changeRequests: true,
        categories: true,
        tags: true,
        aiSearch: false,
        aiGeneration: false,
      },
    };
    return cachedConfig;
  }
}

// Sync version for client components (must be initialized first)
export function getConfigSync(): PromptsConfig {
  if (!cachedConfig) {
    throw new Error("Config not initialized. Call getConfig() first in a server component.");
  }
  return cachedConfig;
}
