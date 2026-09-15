-- AlterTable
ALTER TABLE "Medicine" ADD COLUMN     "category" TEXT,
ADD COLUMN     "gstRate" DECIMAL(5,2),
ADD COLUMN     "hsnCode" TEXT,
ADD COLUMN     "packSize" TEXT,
ADD COLUMN     "saltComposition" TEXT,
ADD COLUMN     "schedule" TEXT,
ADD COLUMN     "unit" TEXT;

-- AlterTable
ALTER TABLE "MedicineBatch" ADD COLUMN     "freeQuantity" INTEGER,
ADD COLUMN     "looseQuantity" INTEGER,
ADD COLUMN     "manufacturingDate" TIMESTAMP(3),
ADD COLUMN     "marginPercent" DECIMAL(5,2),
ADD COLUMN     "mrp" DECIMAL(10,2),
ADD COLUMN     "packQuantity" INTEGER,
ADD COLUMN     "ptr" DECIMAL(10,2),
ADD COLUMN     "purchaseInvoiceDate" TIMESTAMP(3),
ADD COLUMN     "purchaseInvoiceNo" TEXT,
ADD COLUMN     "rackNumber" TEXT,
ADD COLUMN     "shelfNumber" TEXT,
ADD COLUMN     "supplierGstin" TEXT,
ADD COLUMN     "supplierName" TEXT;
