-- CreateEnum
CREATE TYPE "LogAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'TOGGLE');

-- CreateEnum
CREATE TYPE "LogEntity" AS ENUM ('TICKET', 'EMPLOYEE', 'USER', 'SUBJECT');

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "action" "LogAction" NOT NULL,
    "entityType" "LogEntity" NOT NULL,
    "entityId" TEXT NOT NULL,
    "entityLabel" TEXT NOT NULL,
    "changes" JSONB,
    "actorId" TEXT NOT NULL,
    "actorName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Log_entityType_idx" ON "Log"("entityType");

-- CreateIndex
CREATE INDEX "Log_createdAt_idx" ON "Log"("createdAt");
