-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "organizer" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startDate" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "timezone" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "eventDetailId" UUID NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDetail" (
    "id" UUID NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "EventDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "role" INTEGER NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerifyEmail" (
    "hash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ResetPassword" (
    "hash" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "user_fk" ON "Event"("userId");

-- CreateIndex
CREATE INDEX "event_fk" ON "EventDetail"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "email_index" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "VerifyEmail_hash_key" ON "VerifyEmail"("hash");

-- CreateIndex
CREATE INDEX "verifyEmail_hash_index" ON "VerifyEmail"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "ResetPassword_hash_key" ON "ResetPassword"("hash");

-- CreateIndex
CREATE INDEX "resetPassword_hash_index" ON "ResetPassword"("hash");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_eventDetailId_fkey" FOREIGN KEY ("eventDetailId") REFERENCES "EventDetail"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
