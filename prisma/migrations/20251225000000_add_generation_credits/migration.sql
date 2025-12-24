-- AlterTable
ALTER TABLE "users" ADD COLUMN "dailyGenerationLimit" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "users" ADD COLUMN "generationCreditsRemaining" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "users" ADD COLUMN "generationCreditsResetAt" TIMESTAMP(3);
