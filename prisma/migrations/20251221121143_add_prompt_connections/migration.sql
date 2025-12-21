-- DropIndex
DROP INDEX "users_githubUsername_idx";

-- CreateTable
CREATE TABLE "prompt_connections" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prompt_connections_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prompt_connections_sourceId_idx" ON "prompt_connections"("sourceId");

-- CreateIndex
CREATE INDEX "prompt_connections_targetId_idx" ON "prompt_connections"("targetId");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_connections_sourceId_targetId_key" ON "prompt_connections"("sourceId", "targetId");

-- AddForeignKey
ALTER TABLE "prompt_connections" ADD CONSTRAINT "prompt_connections_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_connections" ADD CONSTRAINT "prompt_connections_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
