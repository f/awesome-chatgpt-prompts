import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { getConfig } from "@/lib/config";
import { initializePlugins, getAuthPlugin } from "@/lib/plugins";
import type { User } from "@prisma/client";

// Initialize plugins before use
initializePlugins();

// Build auth config dynamically based on prompts.config.ts
async function buildAuthConfig() {
  const config = await getConfig();
  const authPlugin = getAuthPlugin(config.auth.provider);

  if (!authPlugin) {
    throw new Error(`Auth plugin "${config.auth.provider}" not found`);
  }

  return {
    adapter: PrismaAdapter(db),
    providers: [authPlugin.getProvider()],
    session: {
      strategy: "jwt" as const,
    },
    pages: {
      signIn: "/login",
      signUp: "/register",
      error: "/login",
    },
    callbacks: {
      async jwt({ token, user, trigger }: { token: any; user?: any; trigger?: string }) {
        // On sign in, add user data to token
        if (user) {
          token.id = user.id;
          token.role = (user as User).role;
          token.username = (user as User).username;
          token.locale = (user as User).locale;
        }
        
        // Refresh user data from database on update or if username is missing
        if (trigger === "update" || !token.username) {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, username: true, locale: true },
          });
          if (dbUser) {
            token.role = dbUser.role;
            token.username = dbUser.username;
            token.locale = dbUser.locale;
          }
        }
        
        return token;
      },
      async session({ session, token }) {
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.role = token.role as string;
          session.user.username = token.username as string;
          session.user.locale = token.locale as string;
        }
        return session;
      },
    },
  };
}

// Export auth handlers
const authConfig = await buildAuthConfig();

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);

// Extended session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
      username: string;
      locale: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    username: string;
    locale: string;
  }
}
