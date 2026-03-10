import { NextResponse } from 'next/server';
import type { Redis } from 'ioredis';
import redis from '@/lib/redis/redis';
import { isUpstashRedis } from '@/lib/redis/redisHelper';
import { logProd } from '@/lib/logProd';

const KEEPALIVE_KEY = 'keepalive';

/**
 * Minimal Redis keep-alive for Upstash free tier.
 * Upstash archives free DBs after 14 days of inactivity; any request resets that timer.
 * Vercel cron: once per week (Sundays 08:00 UTC). One Redis SET = one activity.
 * Same key is overwritten each run.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET ?? process.env.VERCEL_CRON_SECRET;
  if (secret) {
    const auth = request.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const at = new Date().toISOString();
  try {
    const value = String(Date.now());
    if (isUpstashRedis(redis)) {
      await redis.set(KEEPALIVE_KEY, value);
    } else {
      await (redis as Redis).set(KEEPALIVE_KEY, value);
    }
    return NextResponse.json({ ok: true, at, key: KEEPALIVE_KEY });
  } catch (err) {
    logProd('Redis keepalive failed:', err);
    return NextResponse.json(
      { error: 'Keepalive failed', message: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    );
  }
}
