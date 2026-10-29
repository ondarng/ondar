-- Run this migration on a backed-up staging database before production.
-- Resolve duplicate order numbers deterministically before enforcing the constraint.
WITH ranked AS (
  SELECT id, "merchantId",
         row_number() OVER (PARTITION BY "merchantId", "orderNumber" ORDER BY "createdAt", id) AS occurrence,
         row_number() OVER (PARTITION BY "merchantId" ORDER BY "orderNumber" DESC, "createdAt" DESC, id DESC) AS descending_rank
  FROM "Order"
), max_numbers AS (
  SELECT "merchantId", COALESCE(MAX("orderNumber"), 1000) AS max_number
  FROM "Order"
  GROUP BY "merchantId"
)
UPDATE "Order" o
SET "orderNumber" = max_numbers.max_number + ranked.descending_rank
FROM ranked
JOIN max_numbers ON max_numbers."merchantId" = ranked."merchantId"
WHERE o.id = ranked.id AND ranked.occurrence > 1;

CREATE TABLE "OrderCounter" (
  "merchantId" TEXT NOT NULL,
  "nextOrderNumber" INTEGER NOT NULL DEFAULT 1001,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "OrderCounter_pkey" PRIMARY KEY ("merchantId"),
  CONSTRAINT "OrderCounter_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "Merchant"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "OrderCounter" ("merchantId", "nextOrderNumber", "updatedAt")
SELECT "merchantId", COALESCE(MAX("orderNumber"), 1000) + 1, CURRENT_TIMESTAMP
FROM "Order"
GROUP BY "merchantId"
ON CONFLICT ("merchantId") DO NOTHING;

CREATE UNIQUE INDEX "Order_merchantId_orderNumber_key" ON "Order"("merchantId", "orderNumber");
CREATE UNIQUE INDEX "Order_paymentReference_key" ON "Order"("paymentReference");
