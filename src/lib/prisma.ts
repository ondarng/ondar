import dns from "dns";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Ensure IPv4 is prioritized over IPv6 to eliminate multi-second connection delays on Windows
if (typeof dns.setDefaultResultOrder === "function") {
  dns.setDefaultResultOrder("ipv4first");
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function parseDatabaseConfig(connectionUrl: string) {
  const url = new URL(connectionUrl);
  return {
    host: url.hostname,
    port: url.port ? parseInt(url.port, 10) : 5432,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace(/^\//, "") || "postgres",
  };
}

function createPrismaClient() {
  const connectionUrl =
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@127.0.0.1:5432/ondar_build_placeholder";

  const dbConfig = parseDatabaseConfig(connectionUrl);

  const pool =
    globalForPrisma.pool ??
    new Pool({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      ssl: { rejectUnauthorized: false },
      min: 1,
      max: 10,
      idleTimeoutMillis: 120000,
      connectionTimeoutMillis: 45000,
      keepAlive: true,
    });

  pool.on("error", (err) => {
    console.warn("Postgres pool idle client warning:", err.message);
  });

  if (!globalForPrisma.pool) {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
