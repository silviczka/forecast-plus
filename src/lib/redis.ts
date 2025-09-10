import { Redis as UpstashRedis } from '@upstash/redis';
import Redis from 'ioredis';

let redisClient: any;

if (process.env.NODE_ENV === 'production') {
  // Upstash for production
  redisClient = new UpstashRedis({
    url: process.env.REDIS_URL!,
    token: process.env.REDIS_TOKEN!,
  });
} else {
  // Docker Redis locally
  if (!process.env.REDIS_URL)
    throw new Error('REDIS_URL is not defined in .env.local');
  redisClient = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 1, // fail fast (default is 20!)
    connectTimeout: 2000, // 2s connect timeout
    retryStrategy: () => null,
    enableOfflineQueue: false, // don’t buffer commands
  });
}

export default redisClient;
