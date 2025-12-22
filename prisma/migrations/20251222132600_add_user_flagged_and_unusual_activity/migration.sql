-- AlterEnum
ALTER TYPE "DelistReason" ADD VALUE 'UNUSUAL_ACTIVITY';

-- AlterTable
ALTER TABLE "users" ADD COLUMN "flagged" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "flaggedAt" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "flaggedReason" TEXT;
