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
  if (!process.env.DATABASE_URL) {
    try {
      // Fallback for Next.js SSR / worker threads
      const fs = require("fs");
      const path = require("path");
      const dotenv = require("dotenv");
      const localEnv = path.resolve(process.cwd(), ".env.local");
      if (fs.existsSync(localEnv)) {
        dotenv.config({ path: localEnv });
      }
      dotenv.config({ path: path.resolve(process.cwd(), ".env") });
    } catch {
      // Ignored
    }
  }

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
      min: 1, // Keep at least 1 warm socket alive so merchant clicks never stall on 1.8s cold handshakes
      max: 10,
      idleTimeoutMillis: 120000, // Keep idle sockets warm for 2 minutes across page transitions
      connectionTimeoutMillis: 10000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 5000,
    });

  pool.on("error", (err) => {
    // When PgBouncer closes an idle connection, swallow the idle warning so pool creates a fresh socket
    console.warn("Postgres pool client notice (auto-reconnecting):", err.message);
  });

  if (!globalForPrisma.pool) {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);

  const baseClient = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

  // Resilient retry extension for transient PgBouncer pooler connection drops
  const resilientClient = baseClient.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          let lastError: unknown;
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              return await query(args);
            } catch (err: unknown) {
              lastError = err;
              const errObj = err as { code?: string; message?: string };
              const isConnectionError =
                errObj?.code === "P1001" ||
                errObj?.code === "P1002" ||
                errObj?.code === "P1008" ||
                errObj?.code === "P1017" ||
                errObj?.message?.includes("Can't reach database server") ||
                errObj?.message?.includes("Connection lost") ||
                errObj?.message?.includes("Connection terminated") ||
                errObj?.message?.includes("ECONNRESET") ||
                errObj?.message?.includes("ETIMEDOUT") ||
                errObj?.message?.includes("timeout");

              if (isConnectionError && attempt < 3) {
                const backoffMs = attempt === 1 ? 50 : 150;
                console.warn(
                  `[Prisma] Connection retry ${attempt}/3 for ${model}.${operation} in ${backoffMs}ms...`
                );
                await new Promise((resolve) => setTimeout(resolve, backoffMs));
                continue;
              }
              throw err;
            }
          }
          throw lastError;
        },
      },
    },
  });

  return resilientClient as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma;
}
