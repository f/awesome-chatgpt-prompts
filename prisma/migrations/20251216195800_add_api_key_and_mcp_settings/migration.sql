-- AlterTable
ALTER TABLE "users" ADD COLUMN "apiKey" TEXT;
ALTER TABLE "users" ADD COLUMN "mcpPromptsPublicByDefault" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "users_apiKey_key" ON "users"("apiKey");
