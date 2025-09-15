import { devOnly } from '../devonly';
import { logProd } from '../logProd';
import redis from './redis';
import { getLocalFallbackFact } from '../local/localFallbackFunFacts';

/**
 * Add a new fact to Redis for a keyword.
 */
export async function addRedisFallbackFact(keyword: string, fact: string) {
  const fallbackKey = `fallback:${keyword}`;
  try {
    await redis.lpush(fallbackKey, fact);
    await redis.ltrim(fallbackKey, 0, 3999); // keep 4000 facts
    // optional: set expiration
    // await redis.expire(fallbackKey, 24 * 60 * 60); // 24h
  } catch (err) {
    logProd('Failed to add fallback fact to Redis:', err);
  }
}

/**
 * Get a random fallback fact for a keyword.
 * Returns a fact from Redis if available, otherwise uses static array.
 */
export async function getRedisFallbackFact(keyword: string, ip: string) {
  const fallbackKey = `fallback:${keyword}`;
  try {
    const facts = await redis.lrange(fallbackKey, 0, -1);
    if (facts.length > 0) {
      const randomFact = facts[Math.floor(Math.random() * facts.length)];
      return randomFact;
    }
    logProd(
      `Redis fallback empty for keyword "${keyword}", using local static fallback.`,
    );
  } catch (err) {
    logProd('Redis fallback error, using local static fallback:', err);
  }

  // Redis empty or failed → use static fallback
  return getLocalFallbackFact(ip);
}
