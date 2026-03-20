import Google from "next-auth/providers/google";
import type { AuthPlugin } from "../types";

export const googlePlugin: AuthPlugin = {
  id: "google",
  name: "Google",
  getProvider: () => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.warn("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET. Google auth provider disabled.");
      return null;
    }
    return Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
  },
};
