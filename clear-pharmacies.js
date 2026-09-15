const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Clearing StockTransactions...");
  await prisma.stockTransaction.deleteMany();
  console.log("Clearing ReservationItems...");
  await prisma.reservationItem.deleteMany();
  console.log("Clearing Reservations...");
  await prisma.reservation.deleteMany();
  console.log("Clearing MedicineBatches...");
  await prisma.medicineBatch.deleteMany();
  console.log("Clearing Pharmacies...");
  await prisma.pharmacy.deleteMany();
  console.log("Done! All pharmacies have been successfully cleared.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
