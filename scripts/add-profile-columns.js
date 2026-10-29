require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const query = `
    ALTER TABLE "BusinessProfile" 
    ADD COLUMN IF NOT EXISTS "secondaryPhone" TEXT,
    ADD COLUMN IF NOT EXISTS "publicEmail" TEXT,
    ADD COLUMN IF NOT EXISTS "instagram" TEXT,
    ADD COLUMN IF NOT EXISTS "tiktok" TEXT,
    ADD COLUMN IF NOT EXISTS "deliveryCoverage" TEXT DEFAULT 'Lagos - Ikeja, Yaba and Lekki';
  `;

  await prisma.$executeRawUnsafe(query);
  console.log('Columns added successfully!');
}

main()
  .catch((e) => {
    console.error('Error:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
