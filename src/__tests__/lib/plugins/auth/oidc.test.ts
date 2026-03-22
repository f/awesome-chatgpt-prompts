import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { oidcPlugin } from "@/lib/plugins/auth/oidc";

describe("OpenID Connect Auth Plugin", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
        process.env.AUTH_OIDC_ID = "test-client-id";
        process.env.AUTH_OIDC_SECRET = "test-client-secret";
        process.env.AUTH_OIDC_ISSUER = "https://sso.test.com";
        process.env.AUTH_OIDC_NAME = "Test OIDC";
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it("should have correct plugin id and name", () => {
        expect(oidcPlugin.id).toBe("oidc");
        expect(oidcPlugin.name).toBe("Generic OIDC");
    });

    it("should configure standard OIDC provider dynamically from env", () => {
        process.env.AUTH_OIDC_ID = "test-client-id";
        process.env.AUTH_OIDC_SECRET = "test-client-secret";
        process.env.AUTH_OIDC_ISSUER = "https://sso.test.com";

        const provider: any = oidcPlugin.getProvider();

        expect(provider.id).toBe("oidc");
        expect(provider.type).toBe("oidc");
        expect(provider.clientId).toBe("test-client-id");
        expect(provider.clientSecret).toBe("test-client-secret");
        expect(provider.issuer).toBe("https://sso.test.com");
        expect(provider.wellKnown).toBe("https://sso.test.com/.well-known/openid-configuration");
    });

    it("should support well-known discovery override", () => {
        process.env.AUTH_OIDC_ISSUER = "https://sso.test.com";
        process.env.AUTH_OIDC_WELLKNOWN = "https://sso.test.com/custom-well-known";

        const provider: any = oidcPlugin.getProvider();
        expect(provider.wellKnown).toBe("https://sso.test.com/custom-well-known");
    });

    it("should have PKCE enabled by default", () => {
        delete process.env.AUTH_OIDC_ENABLE_PKCE;
        const provider: any = oidcPlugin.getProvider();
        expect(provider.checks).toBeUndefined(); // Enabled by default
    });

    it("should apply PKCE bypass if explicitly disabled", () => {
        process.env.AUTH_OIDC_ENABLE_PKCE = "false";
        const provider: any = oidcPlugin.getProvider();
        expect(provider.checks).toEqual(["state"]);
    });

    it("should keep PKCE enabled if explicitly turned on", () => {
        process.env.AUTH_OIDC_ENABLE_PKCE = "true";
        const provider: any = oidcPlugin.getProvider();
        expect(provider.checks).toBeUndefined(); // Auth.js will handle PKCE natively
    });

    it("should handle custom style logo", () => {
        process.env.AUTH_OIDC_LOGO = "https://logo.com/image.png";
        const provider: any = oidcPlugin.getProvider();

        expect(provider.style?.logo).toBe("https://logo.com/image.png");
    });

    it("should fall back to standard UserInfo fields correctly", () => {
        process.env.AUTH_OIDC_ID = "test-client-id";
        process.env.AUTH_OIDC_SECRET = "test-client-secret";
        process.env.AUTH_OIDC_ISSUER = "https://sso.test.com";

        const provider: any = oidcPlugin.getProvider();

        const mockProfile = {
            sub: "12345",
            name: "Test User",
            email: "test@example.com",
            picture: "https://avatar.com/me.png",
            preferred_username: "testuser"
        };

        const parsedProfile: any = provider.profile(mockProfile);

        expect(parsedProfile.id).toBe("12345");
        expect(parsedProfile.name).toBe("Test User");
        expect(parsedProfile.email).toBe("test@example.com");
        expect(parsedProfile.image).toBe("https://avatar.com/me.png");
        expect(parsedProfile.username).toBe("testuser");
    });
});
