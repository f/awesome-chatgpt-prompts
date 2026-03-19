import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Lazily initialize Prisma client on first property access.
// On Cloudflare Workers: uses Neon serverless adapter (HTTP-based).
// On Node.js (Vercel, local dev): uses standard PrismaClient with DATABASE_URL.
function createPrismaClient(): PrismaClient {
  const dbUrl = process.env.DATABASE_URL || "";

  // Neon database: use Neon HTTP adapter (works on both edge and Node.js)
  if (dbUrl.includes("neon.tech")) {
    const adapter = new PrismaNeon({ connectionString: dbUrl });
    return new PrismaClient({ adapter });
  }

  // Standard Node.js environment with non-Neon database
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasourceUrl: process.env.DATABASE_URL,
  });
}

// Use a Proxy so existing code (`db.user.findMany()`) works unchanged.
// The real PrismaClient is created on first property access (during request handling).
export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = createPrismaClient();
    }
    return Reflect.get(globalForPrisma.prisma, prop, receiver);
  },
});
