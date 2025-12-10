import Google from "next-auth/providers/google";
import type { AuthPlugin } from "../types";

export const googlePlugin: AuthPlugin = {
  id: "google",
  name: "Google",
  getProvider: () =>
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
};
