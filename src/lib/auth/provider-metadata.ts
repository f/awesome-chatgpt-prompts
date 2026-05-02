import type { getConfig } from "@/lib/config";

/**
 * Extracts display names and logo URLs for auth providers from environment variables.
 *
 * Standard providers (GitHub, Google, etc.) already have hardcoded names/icons in the UI.
 * This function reads `AUTH_OIDC_NAME`, `AUTH_OIDC_LOGO`, `AUTH_OAUTH_NAME`, `AUTH_OAUTH_LOGO`
 * so that the generic OIDC/OAuth providers can also display branded buttons.
 *
 * This runs server-side only (in Server Components) and passes the result as serializable props.
 */

// Map of provider env-var prefixes for generic providers
const GENERIC_PROVIDER_ENV_MAP: Record<string, { nameVar: string; logoVar: string }> = {
    oidc: { nameVar: "AUTH_OIDC_NAME", logoVar: "AUTH_OIDC_LOGO" },
    oauth: { nameVar: "AUTH_OAUTH_NAME", logoVar: "AUTH_OAUTH_LOGO" },
};

export interface ProviderMetadata {
    displayNames: Record<string, string>;
    logos: Record<string, string>;
}

/**
 * Validates that a URL uses a safe protocol (http or https).
 * Prevents injection of javascript:, data:, or other dangerous URI schemes.
 */
function isSafeUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
        return false;
    }
}

/**
 * Builds provider display names and logos maps for the given provider IDs.
 * Should be called from a Server Component where process.env is accessible.
 */
export function getProviderMetadata(providerIds: string[]): ProviderMetadata {
    const displayNames: Record<string, string> = {};
    const logos: Record<string, string> = {};

    for (const id of providerIds) {
        const envMapping = GENERIC_PROVIDER_ENV_MAP[id];
        if (envMapping) {
            const name = process.env[envMapping.nameVar];
            const logo = process.env[envMapping.logoVar];

            if (name) {
                displayNames[id] = name;
            }
            if (logo && isSafeUrl(logo)) {
                logos[id] = logo;
            }
        }
    }

    return { displayNames, logos };
}

/**
 * Helper to get configured provider IDs from config.
 * Shared by both login and register pages.
 */
export function getConfiguredProviderIds(config: Awaited<ReturnType<typeof getConfig>>): string[] {
    if (config.auth.providers && config.auth.providers.length > 0) {
        return config.auth.providers;
    }
    if (config.auth.provider && typeof config.auth.provider === "string") {
        return [config.auth.provider];
    }
    return ["credentials"];
}
