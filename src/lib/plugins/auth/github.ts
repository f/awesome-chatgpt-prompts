import GitHub from "next-auth/providers/github";
import type { AuthPlugin } from "../types";

export const githubPlugin: AuthPlugin = {
  id: "github",
  name: "GitHub",
  getProvider: () =>
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
};
