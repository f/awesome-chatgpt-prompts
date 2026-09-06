import GitHub, {
  type GitHubEmail,
  type GitHubProfile,
} from "next-auth/providers/github";
import type { TokenSet } from "@auth/core/types";
import type { AuthPlugin } from "../types";

const GITHUB_API_URL = "https://api.github.com";

function isGitHubProfile(value: unknown): value is GitHubProfile {
  if (!value || typeof value !== "object") return false;

  const profile = value as Partial<GitHubProfile>;
  return (
    typeof profile.id === "number" &&
    typeof profile.login === "string" &&
    typeof profile.avatar_url === "string"
  );
}

function isGitHubEmail(value: unknown): value is GitHubEmail {
  if (!value || typeof value !== "object") return false;

  const email = value as Partial<GitHubEmail>;
  return (
    typeof email.email === "string" &&
    typeof email.primary === "boolean" &&
    typeof email.verified === "boolean"
  );
}

async function getVerifiedGitHubProfile(
  accessToken: string
): Promise<GitHubProfile> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "prompts.chat",
  };
  const [profileResponse, emailsResponse] = await Promise.all([
    fetch(`${GITHUB_API_URL}/user`, { headers }),
    fetch(`${GITHUB_API_URL}/user/emails`, { headers }),
  ]);

  if (!profileResponse.ok) {
    throw new Error(
      `GitHub profile request failed with status ${profileResponse.status}`
    );
  }
  if (!emailsResponse.ok) {
    throw new Error(
      `GitHub email request failed with status ${emailsResponse.status}`
    );
  }

  const profile: unknown = await profileResponse.json();
  const emails: unknown = await emailsResponse.json();

  if (!isGitHubProfile(profile)) {
    throw new Error("GitHub returned an invalid user profile");
  }
  if (!Array.isArray(emails)) {
    throw new Error("GitHub returned an invalid email list");
  }

  const githubEmails = emails.filter(isGitHubEmail);
  const verifiedEmail =
    githubEmails.find((email) => email.primary && email.verified) ??
    githubEmails.find((email) => email.verified);

  if (!verifiedEmail) {
    throw new Error("GitHub account does not have a verified email address");
  }

  return {
    ...profile,
    email: verifiedEmail.email,
  };
}

const githubUserinfo = {
  url: `${GITHUB_API_URL}/user`,
  async request({ tokens }: { tokens: TokenSet }) {
    if (!tokens.access_token) {
      throw new Error("GitHub did not return an access token");
    }

    return getVerifiedGitHubProfile(tokens.access_token);
  },
};

export const githubPlugin: AuthPlugin = {
  id: "github",
  name: "GitHub",
  getProvider: () => {
    const clientId =
      process.env.AUTH_GITHUB_ID || process.env.GITHUB_CLIENT_ID;
    const clientSecret =
      process.env.AUTH_GITHUB_SECRET || process.env.GITHUB_CLIENT_SECRET;

    return GitHub({
      clientId,
      clientSecret,
      allowDangerousEmailAccountLinking: true,
      userinfo: githubUserinfo,
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          username: profile.login, // GitHub username (used as display username)
          githubUsername: profile.login, // Immutable GitHub username for contributor attribution
        };
      },
    });
  },
};
