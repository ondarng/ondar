require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is required');
}

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  console.log('Connecting with rejectUnauthorized: false...');
  await client.connect();
  console.log('CONNECTED OK!');
  const res = await client.query('SELECT count(*) FROM "Merchant"');
  console.log('MERCHANT_COUNT:', res.rows[0]);
  await client.end();
}

run().catch(e => {
  console.error('ERROR:', e.message);
  process.exit(1);
});
