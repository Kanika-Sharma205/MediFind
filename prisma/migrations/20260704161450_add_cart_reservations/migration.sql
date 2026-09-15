/*
  Warnings:

  - The values [COLLECTED,EXPIRED] on the enum `ReservationStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `expiresAt` on the `Reservation` table. All the data in the column will be lost.
  - You are about to drop the column `reservationCode` on the `Reservation` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerId]` on the table `Pharmacy` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Reservation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `batchId` to the `ReservationItem` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "ReservationStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');
ALTER TABLE "Reservation" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Reservation" ALTER COLUMN "status" TYPE "ReservationStatus_new" USING ("status"::text::"ReservationStatus_new");
ALTER TYPE "ReservationStatus" RENAME TO "ReservationStatus_old";
ALTER TYPE "ReservationStatus_new" RENAME TO "ReservationStatus";
DROP TYPE "ReservationStatus_old";
ALTER TABLE "Reservation" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'OWNER';
ALTER TYPE "UserRole" ADD VALUE 'SUPER_ADMIN';

-- DropIndex
DROP INDEX "Reservation_reservationCode_key";

-- AlterTable
ALTER TABLE "Pharmacy" ADD COLUMN     "addressProofUrl" TEXT,
ADD COLUMN     "gstDocumentUrl" TEXT,
ADD COLUMN     "legalStoreName" TEXT,
ADD COLUMN     "licenseDocumentUrl" TEXT,
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "panDocumentUrl" TEXT;

-- AlterTable
ALTER TABLE "Reservation" DROP COLUMN "expiresAt",
DROP COLUMN "reservationCode",
ADD COLUMN     "prescriptionUrls" TEXT[],
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ReservationItem" ADD COLUMN     "batchId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';

-- CreateIndex
CREATE UNIQUE INDEX "Pharmacy_ownerId_key" ON "Pharmacy"("ownerId");

-- AddForeignKey
ALTER TABLE "Pharmacy" ADD CONSTRAINT "Pharmacy_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
