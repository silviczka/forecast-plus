import redis from './redis';

type RateLimitOptions = {
  /** Redis key prefix, so each feature has its own counter per IP */
  prefix: string;
  /** Allowed requests per IP per window */
  limit: number;
  windowSeconds: number;
  /**
   * What to do when Redis is unreachable.
   * false = refuse (fail closed): for features that cost money.
   * true  = allow (fail open): for free features, so the app keeps working.
   */
  failOpen: boolean;
};

const MINUTE = 60;
const HOUR = 60 * 60;

/*
 * Free features get two limits together:
 *  - per minute: stops floods fast; a human who hits it waits under a minute
 *  - per hour:   stops "patient" bots that stay just under the minute limit
 * Both are far above what a person does (a page load needs 1-3 GIF searches, 1 weather call).
 */
export const RATE_LIMITS = {
  // OpenAI costs money -> fail closed. Prefix "rate" keeps the existing "rate:<ip>" keys.
  funFacts: [{ prefix: 'rate', limit: 7, windowSeconds: HOUR, failOpen: false }],
  // Free APIs -> fail open, so the app keeps working if Redis is down.
  // GIPHY answers are cached, so this protects our server from floods, not the GIPHY key.
  giphy: [
    { prefix: 'rate:giphy:min', limit: 30, windowSeconds: MINUTE, failOpen: true },
    { prefix: 'rate:giphy', limit: 600, windowSeconds: HOUR, failOpen: true },
  ],
  // Open-Meteo's free quota is shared by all visitors (every call comes from our server)
  weather: [
    { prefix: 'rate:weather:min', limit: 20, windowSeconds: MINUTE, failOpen: true },
    { prefix: 'rate:weather', limit: 300, windowSeconds: HOUR, failOpen: true },
  ],
} satisfies Record<string, RateLimitOptions[]>;

/**
 * Returns true if this IP may make another request.
 *
 * INCR is atomic: Redis adds 1 and returns the new value in one step, so 20 requests
 * arriving at the same instant get 1, 2, 3 ... 20 and only the first `limit` pass.
 * (The previous read-then-write version let a burst of 20 all read "0" and pass.)
 */
export async function checkRateLimit(ip: string, limits: RateLimitOptions[]): Promise<boolean> {
  // Every limit is counted, and all of them must pass
  const results = await Promise.all(limits.map((options) => checkOneLimit(ip, options)));
  return results.every(Boolean);
}

async function checkOneLimit(ip: string, options: RateLimitOptions): Promise<boolean> {
  const key = `${options.prefix}:${ip}`;
  try {
    const count = await redis.incr(key);

    if (count === 1) {
      await redis.expire(key, options.windowSeconds);
    } else if (count > options.limit && (await redis.ttl(key)) < 0) {
      // Self-heal: if setting the expiry ever failed, don't block this IP forever
      await redis.expire(key, options.windowSeconds);
    }

    return count <= options.limit;
  } catch (err) {
    console.error(`Rate limit check failed for "${options.prefix}" (Redis error):`, err);
    return options.failOpen;
  }
}

/** Fun-fact limit, kept under its old name for existing callers. */
export function checkRateLimitRedis(ip: string) {
  return checkRateLimit(ip, RATE_LIMITS.funFacts);
}
