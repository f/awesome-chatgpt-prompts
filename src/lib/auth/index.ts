import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { getConfig } from "@/lib/config";
import { initializePlugins, getAuthPlugin } from "@/lib/plugins";
import type { User } from "@prisma/client";
import type { Adapter, AdapterUser } from "next-auth/adapters";

// Initialize plugins before use
initializePlugins();

// Generate a unique username from email or name
async function generateUsername(email: string, name?: string | null): Promise<string> {
  // Try to use the part before @ in email
  let baseUsername = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
  
  // If too short, use name
  if (baseUsername.length < 3 && name) {
    baseUsername = name.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 15);
  }
  
  // Ensure minimum length
  if (baseUsername.length < 3) {
    baseUsername = "user";
  }
  
  // Check if username exists and append number if needed
  let username = baseUsername;
  let counter = 1;
  while (await db.user.findUnique({ where: { username } })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  return username;
}

// Custom adapter that wraps PrismaAdapter to add username
function CustomPrismaAdapter(): Adapter {
  const prismaAdapter = PrismaAdapter(db);
  
  return {
    ...prismaAdapter,
    async createUser(data: AdapterUser & { username?: string }) {
      // Use GitHub username if provided, otherwise generate one
      let username = (data as any).username;
      if (!username) {
        username = await generateUsername(data.email, data.name);
      } else {
        username = username.toLowerCase();
        
        // Check if there's an unclaimed account with this username
        const unclaimedEmail = `${username}@unclaimed.prompts.chat`;
        const unclaimedUser = await db.user.findUnique({
          where: { email: unclaimedEmail },
        });
        
        if (unclaimedUser) {
          // Claim this account - update with real user info
          const claimedUser = await db.user.update({
            where: { id: unclaimedUser.id },
            data: {
              name: data.name,
              email: data.email,
              avatar: data.image,
              emailVerified: data.emailVerified,
            },
          });
          
          return {
            ...claimedUser,
            image: claimedUser.avatar,
          } as AdapterUser;
        }
        
        // Ensure GitHub username is unique, append number if taken
        const baseUsername = username;
        let finalUsername = baseUsername;
        let counter = 1;
        while (await db.user.findUnique({ where: { username: finalUsername } })) {
          finalUsername = `${baseUsername}${counter}`;
          counter++;
        }
        username = finalUsername;
      }
      
      const user = await db.user.create({
        data: {
          name: data.name,
          email: data.email,
          avatar: data.image,
          emailVerified: data.emailVerified,
          username,
        },
      });
      
      return {
        ...user,
        image: user.avatar,
      } as AdapterUser;
    },
  };
}

// Build auth config dynamically based on prompts.config.ts
async function buildAuthConfig() {
  const config = await getConfig();
  const authPlugin = getAuthPlugin(config.auth.provider);

  if (!authPlugin) {
    throw new Error(`Auth plugin "${config.auth.provider}" not found`);
  }

  return {
    adapter: CustomPrismaAdapter(),
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
        
        // Always verify user exists in database
        if (token.id) {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { role: true, username: true, locale: true },
          });
          
          // User no longer exists - invalidate token
          if (!dbUser) {
            return null;
          }
          
          // Update token with latest user data
          if (trigger === "update" || !token.username) {
            token.role = dbUser.role;
            token.username = dbUser.username;
            token.locale = dbUser.locale;
          }
        }
        
        return token;
      },
      async session({ session, token }: { session: any; token: any }) {
        // If token is null/invalid, return empty session
        if (!token) {
          return { ...session, user: undefined };
        }
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

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: string;
    username: string;
    locale: string;
  }
}
