-- CreateEnum
CREATE TYPE "DelistReason" AS ENUM ('TOO_SHORT', 'NOT_ENGLISH', 'LOW_QUALITY', 'NOT_LLM_INSTRUCTION', 'MANUAL');

-- AlterTable
ALTER TABLE "prompts" ADD COLUMN "delistReason" "DelistReason";
