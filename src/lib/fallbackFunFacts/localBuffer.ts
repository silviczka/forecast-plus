import fs from 'fs';
import path from 'path';
import { devOnly } from '../devonly';
import type { Redis } from 'ioredis';

const bufferFile = path.join(process.cwd(), 'fallbackBuffer.json');

// Ensure file exists - only in development
function initFile() {
  devOnly(() => {
    try {
      if (!fs.existsSync(bufferFile)) {
        fs.writeFileSync(bufferFile, JSON.stringify([]), 'utf8');
      }
    } catch (err) {
      console.error('Failed to init buffer file:', err);
    }
  });
}
initFile();

export function saveToLocalBuffer(keyword: string, fact: string) {
  devOnly(() => {
    try {
      const raw = fs.readFileSync(bufferFile, 'utf8');
      const arr = JSON.parse(raw);
      arr.push({ keyword, fact, createdAt: new Date().toISOString() });
      fs.writeFileSync(bufferFile, JSON.stringify(arr, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save to local buffer:', err);
    }
  });
}

export async function flushBufferToRedis(redis: Redis) {
  devOnly(async () => {
    try {
      const raw = fs.readFileSync(bufferFile, 'utf8');
      const arr: { keyword: string; fact: string }[] = JSON.parse(raw);

      if (arr.length === 0) return;

      arr.forEach(async (item) => {
        try {
          await redis.lpush(`fallback:${item.keyword}`, item.fact);
          await redis.ltrim(`fallback:${item.keyword}`, 0, 3999);
        } catch (err) {
          console.error('Redis still unavailable, skipping flush:', err);
        }
      });

      // Clear file once flushed
      fs.writeFileSync(bufferFile, JSON.stringify([], null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to flush buffer:', err);
    }
  });
}
//check if buffer has data before attempting flush
export function hasLocalBufferData(): boolean {
  if (process.env.NODE_ENV === 'development') {
    try {
      if (!fs.existsSync(bufferFile)) return false;
      const raw = fs.readFileSync(bufferFile, 'utf8');
      const data = JSON.parse(raw);
      return Array.isArray(data) && data.length > 0;
    } catch (err) {
      console.error('Failed to check local buffer:', err);
      return false;
    }
  }
  
  // In production, always return false (no local buffer)
  return false;
}
