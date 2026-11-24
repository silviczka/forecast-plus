import { NextResponse } from 'next/server';
import axios from 'axios';
import { logProd } from '@/lib/logProd';
import { isAllowedGifQuery } from '@/lib/allowlist';
import { getClientIp } from '@/lib/clientIp';
import { checkRateLimit, RATE_LIMITS } from '@/lib/redis/redisRateLimit';
import redis from '@/lib/redis/redis';
import type { Gif, GiphyItem } from '@/types/types';

const GIPHY_API_KEY = process.env.GIPHY_API_KEY;

export async function GET(req: Request) {
  if (!GIPHY_API_KEY) {
    return NextResponse.json(
      { gifs: [], error: 'GIPHY API key not set' },
      { status: 500 },
    );
  }
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get('q') || 'weather';

  // Allowlist: only searches the page itself generates, so our key can't be used as a free GIF search
  if (!isAllowedGifQuery(keyword)) {
    return NextResponse.json({ gifs: [], error: 'Unknown search' }, { status: 400 });
  }

  if (!(await checkRateLimit(getClientIp(req), RATE_LIMITS.giphy))) {
    return NextResponse.json({ gifs: [], error: 'Too many requests' }, { status: 429 });
  }

  // Cache: the allowlist means only ~31 different searches exist, so each one reaches
  // GIPHY at most once per hour, however many visitors there are.
  const cacheKey = `giphy:${keyword}`;
  const cached = await readCachedGifs(cacheKey);
  if (cached) return NextResponse.json({ gifs: cached }, { headers: { 'X-Cache': 'HIT' } });

  try {
    const res = await axios.get('https://api.giphy.com/v1/gifs/search', {
      params: {
        api_key: GIPHY_API_KEY,
        q: keyword,
        limit: 20, // decided here on the server, never by the browser
        rating: 'pg', // safe content
      },
    });

    const gifs: Gif[] = res.data.data.map((g: GiphyItem) => ({
      id: g.id,
      url: g.images.fixed_height.url,
      title: g.title,
    }));

    if (gifs.length > 0) await writeCachedGifs(cacheKey, gifs);
    return NextResponse.json({ gifs }, { headers: { 'X-Cache': 'MISS' } });
  } catch (err) {
    logProd('Giphy fetch error:', err);

    return NextResponse.json({ gifs: [] }, { status: 500 });
  }
}

const CACHE_SECONDS = 60 * 60;

/** Cached GIF list, or null. Any Redis problem just means "not cached" (GIFs are free, keep working). */
async function readCachedGifs(key: string): Promise<Gif[] | null> {
  try {
    // Upstash returns the parsed array, local ioredis returns the JSON string
    const value: unknown = await redis.get(key);
    const gifs = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(gifs) && gifs.length > 0 ? (gifs as Gif[]) : null;
  } catch (err) {
    logProd('GIF cache read failed:', err);
    return null;
  }
}

async function writeCachedGifs(key: string, gifs: Gif[]): Promise<void> {
  try {
    // set + expire work the same on Upstash and local ioredis
    await redis.set(key, JSON.stringify(gifs));
    await redis.expire(key, CACHE_SECONDS);
  } catch (err) {
    logProd('GIF cache write failed:', err);
  }
}
