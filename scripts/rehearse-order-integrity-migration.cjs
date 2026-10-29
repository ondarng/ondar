/*
 * Applies the approved order-integrity schema migration to the locally
 * configured disposable/staging database. It never prints the connection URL.
 * Usage: node scripts/rehearse-order-integrity-migration.cjs --apply
 */
require("dotenv").config({ path: ".env" });

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const apply = process.argv.includes("--apply");
const migrationFile = path.join(
  __dirname,
  "..",
  "prisma",
  "migrations",
  "202610290001_order_integrity",
  "migration.sql"
);

async function preflight(client) {
  const counts = await client.query('SELECT COUNT(*)::int AS orders, (SELECT COUNT(*)::int FROM "Product") AS products, (SELECT COUNT(*)::int FROM "Merchant") AS merchants FROM "Order"');
  const duplicates = await client.query('SELECT "merchantId", "orderNumber", COUNT(*)::int AS count FROM "Order" GROUP BY 1, 2 HAVING COUNT(*) > 1');
  const counters = await client.query("SELECT to_regclass('public.\"OrderCounter\"') IS NOT NULL AS exists");
  return {
    counts: counts.rows[0],
    duplicateOrderNumbers: duplicates.rows,
    orderCounterExists: counters.rows[0].exists,
  };
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not configured in .env.");
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    console.log("Preflight:", JSON.stringify(await preflight(client)));
    if (!apply) {
      console.log("Dry run only. Pass --apply to execute the migration.");
      return;
    }
    const sql = fs.readFileSync(migrationFile, "utf8");
    await client.query("BEGIN");
    try {
      await client.query(sql);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
    const verification = await client.query(`
      SELECT
        NOT EXISTS (
          SELECT 1 FROM "Order" GROUP BY "merchantId", "orderNumber" HAVING COUNT(*) > 1
        ) AS unique_order_numbers,
        NOT EXISTS (
          SELECT "paymentReference" FROM "Order" WHERE "paymentReference" IS NOT NULL GROUP BY 1 HAVING COUNT(*) > 1
        ) AS unique_payment_references,
        (SELECT COUNT(*) FROM "OrderCounter")::int AS counters
    `);
    console.log("Verification:", JSON.stringify(verification.rows[0]));
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Migration rehearsal failed:", error.message);
  process.exitCode = 1;
});
