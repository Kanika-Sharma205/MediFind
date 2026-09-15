const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient(); 
prisma.pharmacy.findMany().then(p => console.log(JSON.stringify(p, null, 2))).finally(() => prisma.$disconnect());
