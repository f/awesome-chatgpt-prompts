-- AlterEnum
ALTER TYPE "PromptType" ADD VALUE 'BOT';

-- CreateEnum
CREATE TYPE "BotPlatform" AS ENUM ('GROK_BOT', 'OPENCLAW', 'HERMES');

-- AlterTable
ALTER TABLE "prompts" ADD COLUMN     "botConfig" JSONB,
ADD COLUMN     "botPlatform" "BotPlatform",
ADD COLUMN     "installUrl" TEXT;

-- CreateIndex
CREATE INDEX "prompts_type_botPlatform_idx" ON "prompts"("type", "botPlatform");
