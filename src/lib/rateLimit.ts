import { devOnly } from './devonly';
import redis from './redis';

const LIMIT = 3;
const WINDOW = 60 * 60; // seconds for Redis

export async function checkRateLimitRedis(ip: string) {
  try {
    const key = `rate:${ip}`;
    const count = parseInt((await redis.get(key)) || '0');

    if (count >= LIMIT) return false;

    if (count === 0) {
      await redis.set(key, '1', 'EX', WINDOW);
    } else {
      await redis.incr(key);
    }

    return true;
  } catch (err) {
    devOnly(() => console.error('Redis error, skipping rate limit:', err));

    return true; // allow request if Redis fails
  }
}
