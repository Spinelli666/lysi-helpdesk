-- AlterEnum
ALTER TYPE "LogEntity" ADD VALUE 'DOCUMENTATION';

-- CreateTable
CREATE TABLE "Documentation" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "content" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,
    "updatedByName" TEXT,

    CONSTRAINT "Documentation_pkey" PRIMARY KEY ("id")
);
