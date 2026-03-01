type RateLimitEntry = {
  timestamps: number[];
};

const store = new Map<string, RateLimitEntry>();

const LIMITS: Record<string, { maxRequests: number; windowMs: number }> = {
  interview: { maxRequests: 10, windowMs: 60_000 },
  sessions: { maxRequests: 30, windowMs: 60_000 },
};

const CLEANUP_INTERVAL_MS = 60_000;
let lastCleanup = Date.now();

function cleanup(now: number) {
  store.forEach((entry, key) => {
    const limit = key.includes(':interview:') ? LIMITS.interview : LIMITS.sessions;
    entry.timestamps = entry.timestamps.filter((t: number) => now - t < limit.windowMs);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  });
  lastCleanup = now;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfter: number;
}

export function checkRateLimit(userId: string, endpoint: 'interview' | 'sessions'): RateLimitResult {
  const limit = LIMITS[endpoint];
  const key = `${userId}:${endpoint}:`;
  const now = Date.now();

  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    cleanup(now);
  }

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Sliding window: remove timestamps outside the window
  entry.timestamps = entry.timestamps.filter((t) => now - t < limit.windowMs);

  if (entry.timestamps.length >= limit.maxRequests) {
    const oldest = entry.timestamps[0];
    const retryAfter = Math.ceil((oldest + limit.windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.timestamps.push(now);
  return { allowed: true, retryAfter: 0 };
}

/** Reset all rate limit state. For testing only. */
export function resetRateLimitStore() {
  store.clear();
  lastCleanup = Date.now();
}
