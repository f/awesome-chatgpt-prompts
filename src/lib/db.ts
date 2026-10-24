import { PrismaClient } from "@prisma/client";

// Configure Prisma for serverless environments with connection pooling
const prismaClientSingleton = () => {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasourceUrl: process.env.DATABASE_URL,
    // Prompt embeddings are large vectors that only the AI search code reads,
    // always through an explicit `select`. Omitting them by default keeps them
    // out of server-rendered pages and API responses.
    omit: {
      prompt: { embedding: true },
    },
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof prismaClientSingleton> | undefined;
};

export const db = globalForPrisma.prisma ?? prismaClientSingleton();

// Always reuse the same instance to prevent connection pool exhaustion
globalForPrisma.prisma = db;
