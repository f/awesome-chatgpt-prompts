-- AlterTable
ALTER TABLE "prompts" ADD COLUMN IF NOT EXISTS "isUnlisted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "prompts" ADD COLUMN IF NOT EXISTS "unlistedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "prompts_isUnlisted_idx" ON "prompts"("isUnlisted");
