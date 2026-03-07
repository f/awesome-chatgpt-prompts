import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { oauthPlugin } from "@/lib/plugins/auth/oauth";

describe("OAuth 2.0 Auth Plugin", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        process.env.AUTH_OAUTH_ID = "test-client-id";
        process.env.AUTH_OAUTH_SECRET = "test-client-secret";
        process.env.AUTH_OAUTH_ISSUER = "https://sso.test.com";
        process.env.AUTH_OAUTH_NAME = "Test OAuth";
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("should have correct plugin id and name", () => {
        expect(oauthPlugin.id).toBe("oauth");
        expect(oauthPlugin.name).toBe("Generic OAuth 2.0");
    });

    it("should have PKCE enabled by default", () => {
        const provider: any = oauthPlugin.getProvider();
        expect(provider.checks).toBeUndefined(); // Enabled by default
    });

    it("should allow disabling PKCE explicitly", () => {
        process.env.AUTH_OAUTH_ENABLE_PKCE = "false";
        const provider: any = oauthPlugin.getProvider();
        expect(provider.checks).toEqual(["state"]);
    });

    it("should configure standard OAuth provider dynamically from env", () => {
        process.env.AUTH_OAUTH_ID = "test-client-id";
        process.env.AUTH_OAUTH_SECRET = "test-client-secret";
        process.env.AUTH_OAUTH_ISSUER = "https://sso.test.com";

        const provider: any = oauthPlugin.getProvider();

        expect(provider.id).toBe("oauth");
        expect(provider.type).toBe("oauth");
        expect(provider.clientId).toBe("test-client-id");
        expect(provider.clientSecret).toBe("test-client-secret");
        expect(provider.issuer).toBe("https://sso.test.com");

        // Check fallback URLs derived from issuer
        expect(provider.authorization.url).toBe("https://sso.test.com/authorize");
        expect(provider.token).toBe("https://sso.test.com/token");
        expect(provider.userinfo).toBe("https://sso.test.com/userinfo");

        // Check default scope (should NOT include openid for relaxed OAuth)
        expect(provider.authorization.params.scope).toBe("email profile");
    });

    it("should use explicit URL overrides when provided", () => {
        process.env.AUTH_OAUTH_ID = "test-client-id";
        process.env.AUTH_OAUTH_SECRET = "test-client-secret";
        process.env.AUTH_OAUTH_ISSUER = "https://sso.test.com";

        process.env.AUTH_OAUTH_AUTHORIZATION_URL = "https://custom.test.com/auth";
        process.env.AUTH_OAUTH_TOKEN_URL = "https://custom.test.com/token";
        process.env.AUTH_OAUTH_USERINFO_URL = "https://custom.test.com/me";

        const provider: any = oauthPlugin.getProvider();

        expect(provider.authorization.url).toBe("https://custom.test.com/auth");
        expect(provider.token).toBe("https://custom.test.com/token");
        expect(provider.userinfo).toBe("https://custom.test.com/me");
    });

    it("should handle wellknown discovery correctly", () => {
        process.env.AUTH_OAUTH_ID = "test-client-id";
        process.env.AUTH_OAUTH_SECRET = "test-client-secret";
        process.env.AUTH_OAUTH_ISSUER = "https://sso.test.com";
        process.env.AUTH_OAUTH_WELLKNOWN = "https://sso.test.com/.well-known";

        const provider: any = oauthPlugin.getProvider();

        expect(provider.wellKnown).toBe("https://sso.test.com/.well-known");
        expect(provider.authorization.url).toBeUndefined(); // Let wellKnown handle it
        expect(provider.token).toBeUndefined();
        expect(provider.userinfo).toBeUndefined();
    });

    it("should handle custom style logo", () => {
        process.env.AUTH_OAUTH_LOGO = "https://logo.com/image.png";
        const provider: any = oauthPlugin.getProvider();

        expect(provider.style?.logo).toBe("https://logo.com/image.png");
    });

    it("should process user profile mappings correctly", () => {
        const provider: any = oauthPlugin.getProvider();

        const mockProfile = {
            sub: "12345",
            name: "Test User",
            email: "test@example.com",
            picture: "https://avatar.com/me.png",
            preferred_username: "testuser"
        };

        const parsedProfile = provider.profile(mockProfile);

        expect(parsedProfile.id).toBe("12345");
        expect(parsedProfile.name).toBe("Test User");
        expect(parsedProfile.email).toBe("test@example.com");
        expect(parsedProfile.image).toBe("https://avatar.com/me.png");
        expect(parsedProfile.username).toBe("testuser");
    });

    it("should fallback correctly if standard profile fields are missing", () => {
        const provider: any = oauthPlugin.getProvider();

        const weirdProfile = {
            id: 999, // Testing numeric ID coercion
            email: "weird@example.com",
            avatar_url: "https://avatar.com/me2.png"
        };

        const parsedProfile = provider.profile(weirdProfile);

        expect(parsedProfile.id).toBe("999");
        expect(parsedProfile.name).toBe("weird@example.com"); // Fallback to email
        expect(parsedProfile.email).toBe("weird@example.com");
        expect(parsedProfile.image).toBe("https://avatar.com/me2.png");
        expect(parsedProfile.username).toBe("weird"); // Fallback to email prefix
    });
});
