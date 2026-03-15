import type { OIDCConfig } from "next-auth/providers";
import type { AuthPlugin } from "../types";

export interface GenericOIDCProfile extends Record<string, unknown> {
    sub: string;
    name?: string;
    preferred_username?: string;
    email?: string;
    picture?: string;
    avatar_url?: string;
    nickname?: string;
}

export const oidcPlugin: AuthPlugin = {
    id: "oidc",
    name: "Generic OIDC",
    getProvider: () => {
        const tokenAuthMethod = process.env.AUTH_OIDC_TOKEN_AUTH_METHOD;
        const clientId = process.env.AUTH_OIDC_ID;
        const clientSecret = process.env.AUTH_OIDC_SECRET;
        const issuer = process.env.AUTH_OIDC_ISSUER;
        const name = process.env.AUTH_OIDC_NAME;

        if (!clientId || !issuer || !name) {
            throw new Error("OIDC configuration is missing required environment variables: AUTH_OIDC_ID, AUTH_OIDC_ISSUER, or AUTH_OIDC_NAME");
        }

        if (!clientSecret && tokenAuthMethod !== "none") {
            throw new Error("AUTH_OIDC_SECRET is required unless AUTH_OIDC_TOKEN_AUTH_METHOD is set to 'none'");
        }

        const provider: OIDCConfig<GenericOIDCProfile> = {
            id: "oidc",
            name,
            type: "oidc",
            ...(process.env.AUTH_OIDC_LOGO ? { style: { logo: process.env.AUTH_OIDC_LOGO } } : {}),
            clientId,
            ...(clientSecret ? { clientSecret } : {}),
            issuer,
            wellKnown: process.env.AUTH_OIDC_WELLKNOWN || `${issuer}/.well-known/openid-configuration`,
            authorization: {
                ...(process.env.AUTH_OIDC_AUTHORIZATION_URL ? { url: process.env.AUTH_OIDC_AUTHORIZATION_URL } : {}),
                params: { scope: process.env.AUTH_OIDC_SCOPE || "openid email profile" }
            },
            client: {
                token_endpoint_auth_method:
                    tokenAuthMethod === "client_secret_post" ? "client_secret_post" :
                        tokenAuthMethod === "none" ? "none" :
                            "client_secret_basic",
            },
            ...(process.env.AUTH_OIDC_TOKEN_URL ? { token: process.env.AUTH_OIDC_TOKEN_URL } : {}),
            ...(process.env.AUTH_OIDC_USERINFO_URL ? { userinfo: process.env.AUTH_OIDC_USERINFO_URL } : {}),
            ...(process.env.AUTH_OIDC_JWKS_URL ? { jwks_endpoint: process.env.AUTH_OIDC_JWKS_URL } : {}),
            // PKCE is enabled by default for OIDC. It must be explicitly set to "false" to be disabled.
            ...(process.env.AUTH_OIDC_ENABLE_PKCE === "false" ? { checks: ["state"] } : {}),
            profile(profile) {
                const id = profile.sub; // OIDC spec requires 'sub' as the unique identifier
                const email = profile.email;

                // Validate required fields. 
                // The downstream 'jwt' callback in src/lib/auth/index.ts depends on user.email 
                // for database lookups. If missing, it fails silently.
                if (!id) {
                    throw new Error("OIDC profile is missing the required `sub` claim.");
                }
                if (!email || typeof email !== "string") {
                    throw new Error("OIDC profile is missing a valid email address.");
                }

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
