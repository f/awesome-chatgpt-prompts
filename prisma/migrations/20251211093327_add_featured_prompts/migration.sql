-- AlterTable
ALTER TABLE "prompts" ADD COLUMN     "featuredAt" TIMESTAMP(3),
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "prompts_isFeatured_idx" ON "prompts"("isFeatured");
