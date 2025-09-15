import { logProd } from './logProd';
import redis from './redis';

const LIMIT = 7;
const WINDOW = 60 * 60; // seconds for Redis

export async function checkRateLimitRedis(ip: string) {
  try {
    const key = `rate:${ip}`;
    let count = parseInt((await redis.get(key)) || '0');

    if (count >= LIMIT) return false;

    if (count === 0) {
      // Upstash-compatible set with TTL
      if ('set' in redis && typeof redis.set === 'function') {
        // Upstash style
        await (redis as any).set(key, '1', { ex: WINDOW, nx: true });
      } else {
        // ioredis style fallback
        await redis.set(key, '1', 'EX', WINDOW);
      }
      count = 1;
    } else {
      await redis.incr(key);
      count += 1;
    }

    return true;
  } catch (err) {
    logProd(`Redis error for IP="${ip}", skipping rate limit:`, err);

    return false; // switch to localFacts when redis down
  }
}
