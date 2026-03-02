import GitlabProvider from "next-auth/providers/gitlab";
import type { AuthPlugin } from "../types";

export const gitlabPlugin: AuthPlugin = {
    id: "gitlab",
    name: "GitLab",
    getProvider: () =>
        GitlabProvider({
            clientId: process.env.GITLAB_CLIENT_ID!,
            clientSecret: process.env.GITLAB_CLIENT_SECRET!,
            web_url: process.env.GITLAB_WEB_URL || "https://gitlab.com",
            profile(profile) {
                return {
                    id: profile.id.toString(),
                    name: profile.name || profile.username,
                    email: profile.email,
                    image: profile.avatar_url,
                    username: profile.username, // GitHub username (used as display username)
                    githubUsername: profile.username, // Immutable GitHub username for contributor attribution
                };
            },
    }),
};
