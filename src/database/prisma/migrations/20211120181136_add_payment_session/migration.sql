-- CreateTable
CREATE TABLE "PaymentSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "expireAfter" INTEGER NOT NULL,

    CONSTRAINT "PaymentSession_pkey" PRIMARY KEY ("id")
);
