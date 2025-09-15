import { logProd } from '../logProd';
import redisClient from '../redis';
import { isRedisAvailable, checkRedisAvailability } from '../redisAvailability';

export async function ensureRedisUp() {
  try {
    const pong = await redisClient.ping?.();
    logProd('Redis PING result:', pong);
  } catch (err) {
    logProd('Redis PING failed:', JSON.stringify(err, null, 2));
  }
  await checkRedisAvailability();
  return isRedisAvailable();
}
