# Staging rehearsal checklist

## Before the window

- [ ] Staging is a current, isolated copy of production.
- [ ] A tested backup and a separate restore target exist.
- [ ] Integrity PRs 1–6 are merged and deployed to staging.
- [ ] Maintenance window and rollback owner are confirmed.
- [ ] Backfill batch size, resume cursor storage, and canary merchant are agreed.

## During the window

- [ ] Put variant migration traffic into maintenance mode.
- [ ] Apply schema migration only.
- [ ] Run a small batch; stop it; resume it; compare journal counts.
- [ ] Recompute reservations from active unpaid-order and custom-checkout holds.
- [ ] Produce the mismatch report and `needs_stock_split` queue.
- [ ] Run verification queries and the old-cart compatibility test.
- [ ] Restore the backup into the separate target and confirm recovery works.

## Exit criteria

- [ ] No unflagged variant/product stock difference.
- [ ] No cross-merchant variant reference.
- [ ] No unflagged order line without a variant.
- [ ] Canary merchant checkout, verified payment, expiry, and refund all pass.
- [ ] Rollback switch is tested before enabling the canary.
