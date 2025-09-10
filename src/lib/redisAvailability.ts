import redis from './redis';

let redisAvailable = true; // default assume available

export function isRedisAvailable() {
  return redisAvailable;
}

export async function checkRedisAvailability() {
  try {
    // ping should resolve fast if Redis is alive
    await redis.ping();
    redisAvailable = true;
  } catch {
    redisAvailable = false;
  }
  return redisAvailable;
}
