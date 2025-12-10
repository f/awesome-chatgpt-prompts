/*
  Warnings:

  - Added the required column `originalContent` to the `change_requests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalTitle` to the `change_requests` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "StructuredFormat" AS ENUM ('JSON', 'YAML');

-- CreateEnum
CREATE TYPE "RequiredMediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- CreateEnum
CREATE TYPE "WebhookEvent" AS ENUM ('PROMPT_CREATED', 'PROMPT_UPDATED', 'PROMPT_DELETED');

-- AlterEnum
ALTER TYPE "PromptType" ADD VALUE 'STRUCTURED';

-- AlterTable
ALTER TABLE "change_requests" ADD COLUMN     "originalContent" TEXT NOT NULL,
ADD COLUMN     "originalTitle" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "prompts" ADD COLUMN     "embedding" JSONB,
ADD COLUMN     "requiredMediaCount" INTEGER,
ADD COLUMN     "requiredMediaType" "RequiredMediaType",
ADD COLUMN     "requiresMediaUpload" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "structuredFormat" "StructuredFormat";

-- CreateTable
CREATE TABLE "prompt_votes" (
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_votes_pkey" PRIMARY KEY ("userId","promptId")
);

-- CreateTable
CREATE TABLE "pinned_prompts" (
    "userId" TEXT NOT NULL,
    "promptId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pinned_prompts_pkey" PRIMARY KEY ("userId","promptId")
);

-- CreateTable
CREATE TABLE "webhook_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'POST',
    "headers" JSONB,
    "payload" TEXT NOT NULL,
    "events" "WebhookEvent"[],
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PromptContributors" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_PromptContributors_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "prompt_votes_userId_idx" ON "prompt_votes"("userId");

-- CreateIndex
CREATE INDEX "prompt_votes_promptId_idx" ON "prompt_votes"("promptId");

-- CreateIndex
CREATE INDEX "pinned_prompts_userId_idx" ON "pinned_prompts"("userId");

-- CreateIndex
CREATE INDEX "_PromptContributors_B_index" ON "_PromptContributors"("B");

-- AddForeignKey
ALTER TABLE "prompt_votes" ADD CONSTRAINT "prompt_votes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_votes" ADD CONSTRAINT "prompt_votes_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_prompts" ADD CONSTRAINT "pinned_prompts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pinned_prompts" ADD CONSTRAINT "pinned_prompts_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromptContributors" ADD CONSTRAINT "_PromptContributors_A_fkey" FOREIGN KEY ("A") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PromptContributors" ADD CONSTRAINT "_PromptContributors_B_fkey" FOREIGN KEY ("B") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
