-- AlterTable
ALTER TABLE "User" DROP COLUMN "department",
DROP COLUMN "position",
DROP COLUMN "project",
DROP COLUMN "unit";

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "department" TEXT,
ADD COLUMN     "position" TEXT,
ADD COLUMN     "project" TEXT,
ADD COLUMN     "unit" TEXT[] DEFAULT ARRAY[]::TEXT[];
