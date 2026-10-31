/**
 * Lightweight sliding window in-memory rate limiter for authentication routes.
 */
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const tracker = new Map<string, RateLimitRecord>();
let cleanupCounter = 0;

function pruneExpiredEntries(): void {
  cleanupCounter++;
  if (cleanupCounter % 50 !== 0 && tracker.size < 500) return;
  const now = Date.now();
  for (const [key, record] of tracker.entries()) {
    if (record.resetAt < now) {
      tracker.delete(key);
    }
  }
}

export function checkRateLimit(
  key: string,
  maxAttempts: number = 8,
  windowSeconds: number = 15 * 60
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  pruneExpiredEntries();
  const now = Date.now();
  const existing = tracker.get(key);

  if (!existing || existing.resetAt < now) {
    tracker.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: maxAttempts - 1, resetInSeconds: windowSeconds };
  }

  if (existing.count >= maxAttempts) {
    const resetInSeconds = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: maxAttempts - existing.count,
    resetInSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

export function resetRateLimit(key: string): void {
  tracker.delete(key);
}
