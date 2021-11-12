-- CreateTable
CREATE TABLE "TokenVerify" (
    "token" TEXT NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL,
    "expireAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TokenVerify_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE INDEX "token_index" ON "TokenVerify"("token");
