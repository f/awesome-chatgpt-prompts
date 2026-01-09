-- AlterTable
ALTER TABLE "prompts" ADD COLUMN     "bestWithMCP" JSONB,
ADD COLUMN     "bestWithModels" TEXT[];
