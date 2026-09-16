/*
  Warnings:

  - You are about to drop the `Documentation` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Documentation";

-- CreateTable
CREATE TABLE "DocumentationTopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,
    "updatedByName" TEXT,

    CONSTRAINT "DocumentationTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentationSubtopic" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "order" INTEGER NOT NULL DEFAULT 0,
    "topicId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,
    "updatedByName" TEXT,

    CONSTRAINT "DocumentationSubtopic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DocumentationSubtopic" ADD CONSTRAINT "DocumentationSubtopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "DocumentationTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;
