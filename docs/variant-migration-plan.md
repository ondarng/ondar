# Variant stock migration plan

Status: approved for a staging rehearsal only. Do not run against production until the staging rehearsal, restore test, canary, and verification gates pass.

## Data model changes

1. Add nullable `variantId` to order lines, holds, custom-checkout line snapshots, and stock-audit records. Add immutable snapshot fields for variant label, listed price, agreed price, and cost.
2. Add an archive marker to `ProductVariant`. Variants referenced by an order or active hold are archived instead of deleted.
3. Add a per-merchant variant migration switch. Product stock remains authoritative until that merchant has passed reconciliation and is explicitly switched.
4. Add a partial unique index ensuring one unarchived Default variant per product, and database validation that a variant's product belongs to the same merchant as the line/hold that references it.

## Backfill rules

1. Historic cost remains `NULL`/unknown. Never infer it from the product's present-day cost.
2. Products without options receive one Default variant. Its on-hand count is copied from the parent product; its reserved count is recomputed from active holds.
3. Products that already have variants retain parent-product stock as authoritative. They are marked `needs_stock_split`; no variant becomes orderable independently until the merchant allocates the parent total across its variants.
4. Existing order lines map to an archived `Legacy` variant when the historic chosen variant cannot be reliably determined. The original chosen label remains immutable snapshot text.
5. Old carts containing only `productId` map to the Default variant after the merchant switch. Before that switch they continue through the product-level compatibility path.
6. Recompute reserved from active holds (unpaid orders and active custom-checkout links), not from existing reserved counters. Record and flag every mismatch rather than silently overwriting it.

## Safe rollout

1. Finish and merge integrity work items 1–6 first.
2. Deploy schema changes and dual-read/dual-write code. Product counters remain authoritative; the new variant counters are projections only.
3. Run a resumable, batched backfill by merchant. Each batch records its cursor, counts, mismatches, and completion status.
4. Run a nightly drift check comparing each parent product with its variants and its active holds.
5. Canary one verified merchant only after reconciliation passes. Enable variant-authoritative stock with that merchant's switch flag.
6. Expand merchant by merchant. Make old product stock columns read-only after all switches; drop them only in a later, separately approved migration.

## Staging rehearsal runbook

1. Create a fresh staging copy and take a database backup. Record its checksum and restoration command.
2. Run the migration in maintenance mode, then run the batched backfill with a deliberately small batch size.
3. Interrupt and resume the backfill to prove the cursor/checkpoint is idempotent.
4. Restore the backup into a separate staging database and run the restore verification query set.
5. Test old product-only carts, Default variants, a `needs_stock_split` merchant, a Legacy order line, payments, expiry, and stock adjustments.
6. Keep the maintenance window open until every verification gate below passes.

## Verification gates

- For every reconciled product: `sum(variant.on_hand) = old product.on_hand`.
- For every reconciled product: `sum(variant.reserved) = recomputed active holds`.
- Every mismatch is stored as a flag; none are silently corrected.
- No order line lacks `variantId` unless it is explicitly flagged as Legacy.
- Row counts before/after match for products, orders, order lines, holds, custom-checkout links, and audits.
- Variant IDs always resolve through a product owned by the same merchant.
- A repeated batch and a repeated migration step do not create extra variants, holds, or stock changes.

## Rollback

1. Before any merchant switch, disable the migration flag and return to product-authoritative reads immediately.
2. Do not delete migration data during rollback; retain it for diagnostics.
3. If schema rollback is required, restore the pre-migration backup to the approved recovery environment, verify row counts and orders, then switch application traffic only after sign-off.
4. Preserve the migration journal, mismatch report, and audit trails for investigation.
