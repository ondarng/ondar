const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const profiles = await prisma.businessProfile.findMany({
    select: {
      id: true,
      businessName: true,
      slug: true,
      merchantId: true,
      merchant: {
        select: {
          email: true,
          onboardingStep: true,
          onboardingState: true,
          createdAt: true,
        }
      }
    }
  });
  console.log('BUSINESS_PROFILES:', JSON.stringify(profiles, null, 2));
  await pool.end();
}

main().catch(console.error);
