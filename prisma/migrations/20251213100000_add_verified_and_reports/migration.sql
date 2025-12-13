-- AlterTable
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateEnum (if not exists)
DO $$ BEGIN
    CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'INAPPROPRIATE', 'COPYRIGHT', 'MISLEADING', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum (if not exists)
DO $$ BEGIN
    CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'DISMISSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable (if not exists)
CREATE TABLE IF NOT EXISTS "prompt_reports" (
    "id" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "promptId" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,

    CONSTRAINT "prompt_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "prompt_reports_promptId_idx" ON "prompt_reports"("promptId");

-- CreateIndex
CREATE INDEX "prompt_reports_reporterId_idx" ON "prompt_reports"("reporterId");

-- CreateIndex
CREATE INDEX "prompt_reports_status_idx" ON "prompt_reports"("status");

-- AddForeignKey
ALTER TABLE "prompt_reports" ADD CONSTRAINT "prompt_reports_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_reports" ADD CONSTRAINT "prompt_reports_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
