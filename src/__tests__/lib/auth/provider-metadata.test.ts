import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getProviderMetadata, getConfiguredProviderIds } from "@/lib/auth/provider-metadata";

type ConfigParam = Parameters<typeof getConfiguredProviderIds>[0];

describe("Provider Metadata", () => {
    const originalEnv = process.env;

    beforeEach(() => {
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe("getProviderMetadata", () => {
        it("should return empty maps when no generic providers are requested", () => {
            const result = getProviderMetadata(["github", "google"]);
            expect(result.displayNames).toEqual({});
            expect(result.logos).toEqual({});
        });

        it("should read OIDC display name and logo from env", () => {
            process.env.AUTH_OIDC_NAME = "Corporate SSO";
            process.env.AUTH_OIDC_LOGO = "https://example.com/logo.svg";

            const result = getProviderMetadata(["github", "oidc"]);
            expect(result.displayNames).toEqual({ oidc: "Corporate SSO" });
            expect(result.logos).toEqual({ oidc: "https://example.com/logo.svg" });
        });

        it("should read OAuth display name and logo from env", () => {
            process.env.AUTH_OAUTH_NAME = "Legacy IdP";
            process.env.AUTH_OAUTH_LOGO = "https://idp.example.com/icon.png";

            const result = getProviderMetadata(["oauth"]);
            expect(result.displayNames).toEqual({ oauth: "Legacy IdP" });
            expect(result.logos).toEqual({ oauth: "https://idp.example.com/icon.png" });
        });

        it("should return both OIDC and OAuth metadata when both are configured", () => {
            process.env.AUTH_OIDC_NAME = "OIDC Provider";
            process.env.AUTH_OIDC_LOGO = "https://oidc.example.com/logo.svg";
            process.env.AUTH_OAUTH_NAME = "OAuth Provider";
            process.env.AUTH_OAUTH_LOGO = "https://oauth.example.com/logo.svg";

            const result = getProviderMetadata(["oidc", "oauth"]);
            expect(result.displayNames).toEqual({
                oidc: "OIDC Provider",
                oauth: "OAuth Provider",
            });
            expect(result.logos).toEqual({
                oidc: "https://oidc.example.com/logo.svg",
                oauth: "https://oauth.example.com/logo.svg",
            });
        });

        it("should omit name when env var is not set", () => {
            process.env.AUTH_OIDC_LOGO = "https://example.com/logo.svg";
            // AUTH_OIDC_NAME not set

            const result = getProviderMetadata(["oidc"]);
            expect(result.displayNames).toEqual({});
            expect(result.logos).toEqual({ oidc: "https://example.com/logo.svg" });
        });

        it("should omit logo when env var is not set", () => {
            process.env.AUTH_OIDC_NAME = "My Provider";
            // AUTH_OIDC_LOGO not set

            const result = getProviderMetadata(["oidc"]);
            expect(result.displayNames).toEqual({ oidc: "My Provider" });
            expect(result.logos).toEqual({});
        });

        it("should reject logo URLs with javascript: protocol", () => {
            process.env.AUTH_OIDC_NAME = "Evil Provider";
            process.env.AUTH_OIDC_LOGO = "javascript:alert('xss')";

            const result = getProviderMetadata(["oidc"]);
            expect(result.displayNames).toEqual({ oidc: "Evil Provider" });
            expect(result.logos).toEqual({});
        });

        it("should reject logo URLs with data: protocol", () => {
            process.env.AUTH_OIDC_LOGO = "data:image/svg+xml,<svg></svg>";

            const result = getProviderMetadata(["oidc"]);
            expect(result.logos).toEqual({});
        });

        it("should accept http:// logo URLs", () => {
            process.env.AUTH_OIDC_LOGO = "http://internal.corp.com/logo.png";

            const result = getProviderMetadata(["oidc"]);
            expect(result.logos).toEqual({ oidc: "http://internal.corp.com/logo.png" });
        });

        it("should reject malformed URLs", () => {
            process.env.AUTH_OIDC_LOGO = "not-a-url";

            const result = getProviderMetadata(["oidc"]);
            expect(result.logos).toEqual({});
        });
    });

    describe("getConfiguredProviderIds", () => {
        it("should return providers array when configured", () => {
            const config = {
                auth: { providers: ["github", "google", "oidc"], allowRegistration: false },
            } as unknown as ConfigParam;

            expect(getConfiguredProviderIds(config)).toEqual(["github", "google", "oidc"]);
        });

        it("should fallback to deprecated singular provider string if present", () => {
            const config = {
                auth: { provider: "github", allowRegistration: false },
            } as unknown as ConfigParam;

            expect(getConfiguredProviderIds(config)).toEqual(["github"]);
        });

        it("should default to credentials when providers array is empty", () => {
            const config = {
                auth: { providers: [], allowRegistration: false },
            } as unknown as ConfigParam;

            expect(getConfiguredProviderIds(config)).toEqual(["credentials"]);
        });

        it("should default to credentials when providers is not set", () => {
            const config = {
                auth: { allowRegistration: false },
            } as unknown as ConfigParam;

            expect(getConfiguredProviderIds(config)).toEqual(["credentials"]);
        });
    });
});
