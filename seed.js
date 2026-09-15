const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding cloud database...');
  
  const users = [
    { name: 'Admin User', email: 'admin@medifind.test', password: 'Admin@1234', role: 'ADMIN' },
    { name: 'Test Customer', email: 'customer@medifind.test', password: 'Customer@1234', role: 'CUSTOMER' },
    { name: 'Pharmacy Owner', email: 'pharmacist@medifind.test', password: 'Pharmacist@1234', role: 'OWNER' }
  ];

  for (const u of users) {
    const existingUser = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existingUser) {
      const passwordHash = await bcrypt.hash(u.password, 12);
      const user = await prisma.user.create({
        data: {
          name: u.name,
          email: u.email,
          passwordHash,
          role: u.role,
          isActive: true,
          isVerified: true
        }
      });
      console.log(`Created user: ${user.email}`);

      // If OWNER, create a default approved pharmacy for them
      if (u.role === 'OWNER') {
        const pharmacy = await prisma.pharmacy.create({
          data: {
            ownerId: user.id,
            name: 'MediFind Central Pharmacy',
            legalStoreName: 'MediFind Central',
            status: 'APPROVED',
            licenseNumber: 'MF-CENTRAL-001',
            address: '123 Health St',
            city: 'Mumbai',
            state: 'MH',
            pincode: '400001',
            latitude: 19.0760,
            longitude: 72.8777
          }
        });
        console.log(`Created pharmacy: ${pharmacy.name}`);
        
        // Also create a dummy manufacturer and medicine so search works
        const mfg = await prisma.manufacturer.create({
          data: { id: 'mfg-01', name: 'PharmaCorp', code: 'PC01' }
        });
        
        const med = await prisma.medicine.create({
          data: {
            id: 'med-01',
            skuCode: 'SKU-PARA-500',
            genericName: 'Paracetamol',
            brandName: 'Dolo 650',
            manufacturerId: 'mfg-01',
            updatedAt: new Date()
          }
        });
        
        await prisma.medicineBatch.create({
          data: {
            id: 'batch-01',
            batchNumber: 'B-2026-01',
            medicineId: 'med-01',
            pharmacyId: pharmacy.id,
            expiryDate: new Date('2028-01-01'),
            purchasePrice: 15.00,
            sellingPrice: 30.00,
            looseQuantity: 500
          }
        });
        console.log('Created test medicine stock for search!');
      }
    } else {
      console.log(`User ${u.email} already exists`);
    }
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('Seeding complete.');
  });
