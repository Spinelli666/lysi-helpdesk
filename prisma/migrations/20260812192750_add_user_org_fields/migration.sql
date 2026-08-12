-- AlterTable
ALTER TABLE "User" ADD COLUMN     "department" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "project" TEXT,
ADD COLUMN     "unit" TEXT[] DEFAULT ARRAY[]::TEXT[];
