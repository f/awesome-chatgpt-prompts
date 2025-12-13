-- AlterTable
ALTER TABLE "users" ADD COLUMN "githubUsername" TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS "users_githubUsername_idx" ON "users"("githubUsername");
