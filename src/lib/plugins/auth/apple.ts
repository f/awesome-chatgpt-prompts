import Apple from "next-auth/providers/apple";
import type { AuthPlugin } from "../types";

export const applePlugin: AuthPlugin = {
  id: "apple",
  name: "Apple",
  getProvider: () =>
    Apple({
      clientId: process.env.AUTH_APPLE_ID!,
      clientSecret: process.env.AUTH_APPLE_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name?.firstName
            ? `${profile.name.firstName} ${profile.name.lastName || ""}`.trim()
            : profile.email?.split("@")[0] || "User",
          email: profile.email,
          image: null,
        };
      },
    }),
};
