import { NextResponse } from 'next/server';
import redis from '@/lib/redis/redis';
import { logProd } from '@/lib/logProd';

const PING_TIMEOUT_MS = 2500;

function timeout(ms: number): Promise<never> {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Health check timeout')), ms),
  );
}

async function isRedisReachable(): Promise<boolean> {
  try {
    await Promise.race([redis.ping(), timeout(PING_TIMEOUT_MS)]);
    return true;
  } catch (err) {
    logProd('Health check: Redis ping failed or timed out', err);
    return false;
  }
}

/** JSON shape returned by GET /api/health */
export type HealthResponse = { ok: true; redis: boolean };

/**
 * Health check: pings Redis with a short timeout.
 * Always returns 200. Use for monitoring or optional UI (e.g. degraded banner).
 * When redis is false, the app still works via fallbacks (no cache, local facts).
 */
export async function GET() {
  const redisOk = await isRedisReachable();
  return NextResponse.json({ ok: true, redis: redisOk } satisfies HealthResponse);
}
