import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Configure Prisma for serverless environments with connection pooling
const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasourceUrl: process.env.DATABASE_URL,
  });
};

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

// Always reuse the same instance to prevent connection pool exhaustion
globalForPrisma.prisma = db;
