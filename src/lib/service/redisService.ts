import { isRedisAvailable, checkRedisAvailability } from '../redisAvailability';

export async function ensureRedisUp() {
  await checkRedisAvailability();
  return isRedisAvailable();
}
