import Apple from "next-auth/providers/apple";
import type { AuthPlugin } from "../types";

export const applePlugin: AuthPlugin = {
  id: "apple",
  name: "Apple",
  getProvider: () => {
    if (!process.env.AUTH_APPLE_ID || !process.env.AUTH_APPLE_SECRET) {
      console.warn("Missing AUTH_APPLE_ID or AUTH_APPLE_SECRET. Apple auth provider disabled.");
      return null;
    }
    return Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
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
    });
  },
};
