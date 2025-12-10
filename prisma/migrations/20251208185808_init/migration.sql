-- CreateTable
CREATE TABLE "category_subscriptions" (
    "userId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "category_subscriptions_pkey" PRIMARY KEY ("userId","categoryId")
);

-- CreateIndex
CREATE INDEX "category_subscriptions_userId_idx" ON "category_subscriptions"("userId");

-- CreateIndex
CREATE INDEX "category_subscriptions_categoryId_idx" ON "category_subscriptions"("categoryId");

-- AddForeignKey
ALTER TABLE "category_subscriptions" ADD CONSTRAINT "category_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "category_subscriptions" ADD CONSTRAINT "category_subscriptions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
