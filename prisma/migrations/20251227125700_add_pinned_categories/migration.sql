-- AlterTable
ALTER TABLE "categories" ADD COLUMN "pinned" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "categories_pinned_idx" ON "categories"("pinned");
