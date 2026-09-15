-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('ITEM_BASED', 'PRESCRIPTION_ONLY');

-- AlterEnum
ALTER TYPE "ReservationStatus" ADD VALUE 'AWAITING_REVIEW';

-- AlterTable
ALTER TABLE "Reservation" ADD COLUMN     "customerNote" TEXT,
ADD COLUMN     "orderType" "OrderType" NOT NULL DEFAULT 'ITEM_BASED',
ADD COLUMN     "pharmacistNote" TEXT;
