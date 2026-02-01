-- CreateTable
CREATE TABLE "user_prompt_examples" (
    "id" TEXT NOT NULL,
    "mediaUrl" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "promptId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "user_prompt_examples_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_prompt_examples_promptId_idx" ON "user_prompt_examples"("promptId");

-- CreateIndex
CREATE INDEX "user_prompt_examples_userId_idx" ON "user_prompt_examples"("userId");

-- AddForeignKey
ALTER TABLE "user_prompt_examples" ADD CONSTRAINT "user_prompt_examples_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "prompts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_prompt_examples" ADD CONSTRAINT "user_prompt_examples_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
