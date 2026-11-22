import { NextResponse } from 'next/server';
import type { Redis } from 'ioredis';
import redis from '@/lib/redis/redis';
import { isUpstashRedis } from '@/lib/redis/redisHelper';

const KEEPALIVE_KEY = 'keepalive';

/**
 * Minimal Redis keep-alive for Upstash free tier.
 * Upstash archives free DBs after 14 days of inactivity; any request resets that timer.
 * Vercel cron: once per week (Sundays 08:00 UTC). One Redis SET = one activity.
 * Same key is overwritten each run.
 *
 * Security: only Vercel's cron may call this. Vercel sends CRON_SECRET as a Bearer token.
 * Fails closed: if CRON_SECRET is not configured, every request is refused.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error('CRON_SECRET is not set - refusing all cron requests');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    console.error('Redis keepalive failed:', err);
    return NextResponse.json({ error: 'Keepalive failed' }, { status: 502 });
  }
}
