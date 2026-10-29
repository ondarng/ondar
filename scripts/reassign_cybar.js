const dns = require('dns');
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}
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
  console.log('Reassigning cybar to asiegbucaleb3@gmail.com...');

  // 1. Rename any other merchant profile holding slug 'cybar'
  const otherWithCybar = await prisma.businessProfile.findFirst({
    where: {
      slug: 'cybar',
      merchant: { email: { not: 'asiegbucaleb3@gmail.com' } }
    }
  });

  if (otherWithCybar) {
    console.log('Renaming other profile holding cybar:', otherWithCybar.id);
    await prisma.businessProfile.update({
      where: { id: otherWithCybar.id },
      data: { slug: 'cybar-test-archive', businessName: 'cybar (Test)' }
    });
  }

  // 2. Update asiegbucaleb3@gmail.com profile to cybar
  const calebMerchant = await prisma.merchant.findUnique({
    where: { email: 'asiegbucaleb3@gmail.com' },
    include: { businessProfile: true }
  });

  if (calebMerchant && calebMerchant.businessProfile) {
    console.log('Updating Caleb profile to cybar...');
    await prisma.businessProfile.update({
      where: { id: calebMerchant.businessProfile.id },
      data: {
        businessName: 'cybar',
        slug: 'cybar'
      }
    });
    console.log('Successfully updated Caleb profile to businessName: cybar, slug: cybar!');
  } else {
    console.log('Caleb profile not found or no businessProfile attached:', calebMerchant);
  }

  const verified = await prisma.businessProfile.findMany({
    select: { businessName: true, slug: true, merchant: { select: { email: true } } }
  });
  console.log('CURRENT PROFILES:', JSON.stringify(verified, null, 2));

  await pool.end();
}

main().catch(console.error);
