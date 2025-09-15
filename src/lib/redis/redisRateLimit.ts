import { logProd } from '../logProd';
import redis from './redis';
import { isUpstashRedis } from './redisHelper';

const LIMIT = 7;
const WINDOW = 60 * 60; // seconds for Redis

export async function checkRateLimitRedis(ip: string) {
  try {
    const key = `rate:${ip}`;
    let count = parseInt((await redis.get(key)) || '0');

    if (count >= LIMIT) return false;

    if (count === 0) {
      if (isUpstashRedis(redis)) {
        // Upstash for prod
        await redis.set(key, '1', { ex: WINDOW, nx: true });
      } else {
        // ioredis for local - docker
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
