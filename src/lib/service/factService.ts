import OpenAI from 'openai';
import type { Redis as IORedisClient } from 'ioredis';
import redis from '../redis';
import { checkRateLimitRedis } from '../rateLimit';
import { getLocalFallbackFact } from '../fallbackFunFacts/localFallbackFunFacts';
import {
  addRedisFallbackFact,
  getRedisFallbackFact,
} from '../fallbackFunFacts/redisFallbackCache';
import {
  saveToLocalBuffer,
  flushBufferToRedis,
  hasLocalBufferData,
} from '../fallbackFunFacts/localBuffer';
import { checkLocalRateLimit } from '../fallbackFunFacts/localRateLimit';
import { ensureRedisUp } from './redisService';
import { devOnly } from '../devonly';
import { logProd } from '../logProd';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function getFactForKeyword(ip: string, keyword: string) {
  if (!keyword) throw new Error('Missing keyword');

  const redisUp = await ensureRedisUp();

  // Try flushing local buffer if Redis is available
  devOnly(() => {
    if (redisUp && hasLocalBufferData()) {
      flushBufferToRedis(redis as IORedisClient).catch((err) =>
        console.error('Could not flush local buffer:', err.message),
      );
    }
  });

  // --- RATE LIMIT ---
  let allowed = true;
  if (redisUp) {
    try {
      allowed = await checkRateLimitRedis(ip);
    } catch (err: unknown) {
      logProd('Redis unavailable for rate limit, using local fallback:', err);
      allowed = checkLocalRateLimit(ip, 3, 60 * 60 * 1000); // fallback
    }
  } else {
    allowed = false;
  }

  if (!allowed) {
    logProd(`Fun fact rate-limited for IP ${ip}, keyword "${keyword}"`);
    const fact = redisUp
      ? await getRedisFallbackFact(keyword, ip)
      : getLocalFallbackFact(ip);
    return { text: fact, rateLimited: true };
  }

  // --- CACHE CHECK ---
  const cacheKey = `fact:${ip}:${keyword}`;
  if (redisUp) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return { text: cached, rateLimited: false };
    } catch (err: unknown) {
      logProd('Redis cache get failed:', err);
    }
  }

  // --- OPENAI CALL ---
  let text = '';
  let fromOpenAI = false;
  try {
    const prompt = `Generate a short fun fact or "Did you know..." style message about ${keyword}. Make it 1-2 complete sentences, simple, friendly. Make each response feel unique, interesting, and playful. Try to make each fact unique, you can speak of books, movies, songs, known people, animals, clothes, anything that comes to mind in connection with weather and ${keyword}. Ensure the sentences are fully finished and make sense on its own, always ending with proper punctuation.`;
    logProd('OPENAI API CALL for keyword:', keyword);
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 50,
    });
    text = response.choices?.[0]?.message?.content?.trim() ?? '';
    if (!/[.!?]$/.test(text)) text += '.';
    logProd(`Fun fact for keyword "${keyword}" fetched:`, text);
    fromOpenAI = true;
  } catch (err: unknown) {
    logProd('OpenAI call failed, using local fallback:', err);
    text = getLocalFallbackFact(ip);
  }

  // --- SAVE TO CACHE / FALLBACK ---
  if (redisUp) {
    try {
      await redis.set(cacheKey, text, 'EX', 60 * 60);
    } catch (err: unknown) {
      logProd('Redis cache set failed:', err);
    }

    if (fromOpenAI) {
      try {
        await addRedisFallbackFact(keyword, text);
      } catch (err: unknown) {
        logProd('Redis fallback store failed', err);
        devOnly(() => saveToLocalBuffer(keyword, text));
      }
    }
  } else if (fromOpenAI) {
    devOnly(() => saveToLocalBuffer(keyword, text));
  }

  return { text, rateLimited: false };
}
