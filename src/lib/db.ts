import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasourceUrl: process.env.DATABASE_URL,
  });

// Prevent connection pool exhaustion in serverless environments
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
} else {
  // In production, always use the same instance to avoid connection issues
  globalForPrisma.prisma = db;
}
