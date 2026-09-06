import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { GitHubProfile } from "next-auth/providers/github";
import type { OAuthConfig, OAuthUserConfig } from "next-auth/providers";
import { githubPlugin } from "@/lib/plugins/auth/github";

interface GitHubProviderOptions extends OAuthUserConfig<GitHubProfile> {
  userinfo: {
    request: (params: {
      tokens: { access_token?: string };
    }) => Promise<GitHubProfile>;
  };
}

function getProviderOptions(): GitHubProviderOptions {
  const provider = githubPlugin.getProvider() as OAuthConfig<GitHubProfile>;
  return provider.options as GitHubProviderOptions;
}

function mockGitHubResponses(
  emails: Array<{
    email: string;
    primary: boolean;
    verified: boolean;
    visibility: "public" | "private";
  }>
) {
  const fetchMock = vi
    .fn<typeof fetch>()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 123,
          login: "octocat",
          name: "The Octocat",
          email: null,
          avatar_url: "https://avatars.githubusercontent.com/u/123",
        }),
        { status: 200 }
      )
    )
    .mockResolvedValueOnce(
      new Response(JSON.stringify(emails), { status: 200 })
    );
  vi.stubGlobal("fetch", fetchMock);

  return fetchMock;
}

describe("GitHub auth plugin", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.AUTH_GITHUB_ID;
    delete process.env.AUTH_GITHUB_SECRET;
    delete process.env.GITHUB_CLIENT_ID;
    delete process.env.GITHUB_CLIENT_SECRET;
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.unstubAllGlobals();
  });

  it("uses Auth.js GitHub credential names", () => {
    process.env.AUTH_GITHUB_ID = "auth-client-id";
    process.env.AUTH_GITHUB_SECRET = "auth-client-secret";

    const options = getProviderOptions();

    expect(options.clientId).toBe("auth-client-id");
    expect(options.clientSecret).toBe("auth-client-secret");
  });

  it("supports legacy GitHub credential names", () => {
    process.env.GITHUB_CLIENT_ID = "legacy-client-id";
    process.env.GITHUB_CLIENT_SECRET = "legacy-client-secret";

    const options = getProviderOptions();

    expect(options.clientId).toBe("legacy-client-id");
    expect(options.clientSecret).toBe("legacy-client-secret");
  });

  it("enables account linking only with a verified GitHub email", async () => {
    const fetchMock = mockGitHubResponses([
      {
        email: "unverified@example.com",
        primary: true,
        verified: false,
        visibility: "private",
      },
      {
        email: "verified@example.com",
        primary: false,
        verified: true,
        visibility: "private",
      },
    ]);
    const options = getProviderOptions();

    const profile = await options.userinfo.request({
      tokens: { access_token: "github-token" },
    });

    expect(options.allowDangerousEmailAccountLinking).toBe(true);
    expect(profile.email).toBe("verified@example.com");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/user/emails",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer github-token",
        }),
      })
    );
  });

  it("rejects GitHub profiles without a verified email", async () => {
    mockGitHubResponses([
      {
        email: "unverified@example.com",
        primary: true,
        verified: false,
        visibility: "private",
      },
    ]);
    const options = getProviderOptions();

    await expect(
      options.userinfo.request({
        tokens: { access_token: "github-token" },
      })
    ).rejects.toThrow(
      "GitHub account does not have a verified email address"
    );
  });
});
