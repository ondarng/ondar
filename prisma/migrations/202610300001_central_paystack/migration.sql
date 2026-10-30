CREATE TYPE "PaymentAttemptStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'FLAGGED');

CREATE TABLE "PaymentAttempt" (
  "id" TEXT NOT NULL,
  "orderId" TEXT NOT NULL,
  "merchantId" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "chargedKobo" BIGINT NOT NULL,
  "orderTotalKobo" BIGINT NOT NULL,
  "ondarShareKobo" BIGINT NOT NULL,
  "subaccountCode" TEXT NOT NULL,
  "authorizationUrl" TEXT,
  "status" "PaymentAttemptStatus" NOT NULL DEFAULT 'PENDING',
  "flag" TEXT,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "PaymentAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PaymentAttempt_reference_key" ON "PaymentAttempt"("reference");
CREATE INDEX "PaymentAttempt_orderId_status_createdAt_idx" ON "PaymentAttempt"("orderId", "status", "createdAt");
CREATE INDEX "PaymentAttempt_merchantId_status_createdAt_idx" ON "PaymentAttempt"("merchantId", "status", "createdAt");

ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_orderId_fkey"
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PaymentAttempt" ADD CONSTRAINT "PaymentAttempt_merchantId_fkey"
  FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
