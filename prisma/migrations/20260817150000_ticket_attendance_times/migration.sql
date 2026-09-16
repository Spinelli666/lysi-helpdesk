-- AlterTable: add nullable columns first, backfill, then enforce NOT NULL
ALTER TABLE "Ticket" ADD COLUMN "startedAt" TIMESTAMP(3);
ALTER TABLE "Ticket" ADD COLUMN "endedAt" TIMESTAMP(3);

UPDATE "Ticket" SET "startedAt" = "createdAt", "endedAt" = COALESCE("resolvedAt", "createdAt");

ALTER TABLE "Ticket" ALTER COLUMN "startedAt" SET NOT NULL;
ALTER TABLE "Ticket" ALTER COLUMN "endedAt" SET NOT NULL;

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_resolvedById_fkey";

-- AlterTable: drop the status workflow columns (tickets are always created already-attended)
ALTER TABLE "Ticket" DROP COLUMN "status",
DROP COLUMN "resolvedAt",
DROP COLUMN "resolvedById";

-- DropEnum
DROP TYPE "TicketStatus";
