import type { OAuth2Config } from "next-auth/providers";
import type { AuthPlugin } from "../types";

export interface GenericOAuthProfile extends Record<string, unknown> {
    sub?: string;
    id?: string;
    name?: string;
    preferred_username?: string;
    email?: string;
    picture?: string;
    avatar_url?: string;
    nickname?: string;
}

export const oauthPlugin: AuthPlugin = {
    id: "oauth",
    name: "Generic OAuth 2.0",
    getProvider: () => {
        const tokenAuthMethod = process.env.AUTH_OAUTH_TOKEN_AUTH_METHOD;
        const clientId = process.env.AUTH_OAUTH_ID;
        const clientSecret = process.env.AUTH_OAUTH_SECRET;
        const issuer = process.env.AUTH_OAUTH_ISSUER;
        const name = process.env.AUTH_OAUTH_NAME;

        if (!clientId || !issuer || !name) {
            throw new Error("OAuth configuration is missing required environment variables: AUTH_OAUTH_ID, AUTH_OAUTH_ISSUER, or AUTH_OAUTH_NAME");
        }

        if (!clientSecret && tokenAuthMethod !== "none") {
            throw new Error("AUTH_OAUTH_SECRET is required unless AUTH_OAUTH_TOKEN_AUTH_METHOD is set to 'none'");
        }

        const provider: OAuth2Config<GenericOAuthProfile> = {
            id: "oauth",
            name,
            type: "oauth",
            ...(process.env.AUTH_OAUTH_LOGO ? { style: { logo: process.env.AUTH_OAUTH_LOGO } } : {}),
            clientId,
            ...(clientSecret ? { clientSecret } : {}),
            issuer,
            ...(process.env.AUTH_OAUTH_WELLKNOWN ? { wellKnown: process.env.AUTH_OAUTH_WELLKNOWN } : {}),
            authorization: {
                url: process.env.AUTH_OAUTH_AUTHORIZATION_URL || (process.env.AUTH_OAUTH_WELLKNOWN ? undefined : `${issuer}/authorize`),
                // Default to empty scopes for relaxed OAuth as legacy providers often fail with OIDC-specific scopes like 'openid'
                params: { scope: process.env.AUTH_OAUTH_SCOPE || "email profile" }
            },
            client: {
                token_endpoint_auth_method:
                    tokenAuthMethod === "client_secret_post" ? "client_secret_post" :
                        tokenAuthMethod === "none" ? "none" :
                            "client_secret_basic",
            },
            token: process.env.AUTH_OAUTH_TOKEN_URL || (process.env.AUTH_OAUTH_WELLKNOWN ? undefined : `${issuer}/token`),
            userinfo: process.env.AUTH_OAUTH_USERINFO_URL || (process.env.AUTH_OAUTH_WELLKNOWN ? undefined : `${issuer}/userinfo`),
            ...(process.env.AUTH_OAUTH_JWKS_URL ? { jwks_endpoint: process.env.AUTH_OAUTH_JWKS_URL } : {}),
            // PKCE is enabled by default for OAuth. It must be explicitly set to "false" to be disabled.
            ...(process.env.AUTH_OAUTH_ENABLE_PKCE === "false" ? { checks: ["state"] } : {}),
            profile(profile) {
                const id = profile.sub || profile.id;
                const email = profile.email;

                // Validate required fields. 
                // The downstream 'jwt' callback in src/lib/auth/index.ts depends on user.email 
                // for database lookups. If missing, it fails silently.
                if (!id) {
                    throw new Error("OAuth profile is missing a unique identifier (sub/id).");
                }
                if (!email || typeof email !== "string") {
                    throw new Error("OAuth profile is missing a valid email address.");
                }

                // Coerce identifier to string to satisfy type contracts
                const stringId = String(id);

                return {
                    id: stringId,
                    name: profile.name || profile.preferred_username || email,
                    email: email, // Required as per Session.user type and DB lookups
                    image: profile.picture || profile.avatar_url || "",
                    username: profile.preferred_username || profile.nickname || email.split("@")[0] || stringId,
                };
            },
        };
        return provider;
    },
};
