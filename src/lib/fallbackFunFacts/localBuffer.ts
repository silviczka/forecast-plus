import fs from 'fs';
import path from 'path';
import { devOnly } from '../devonly';

const bufferFile = path.join(process.cwd(), 'fallbackBuffer.json');

// Ensure file exists
function initFile() {
  if (!fs.existsSync(bufferFile)) {
    fs.writeFileSync(bufferFile, JSON.stringify([]), 'utf8');
  }
}
initFile();

export function saveToLocalBuffer(keyword: string, fact: string) {
  try {
    const raw = fs.readFileSync(bufferFile, 'utf8');
    const arr = JSON.parse(raw);
    arr.push({ keyword, fact, createdAt: new Date().toISOString() });
    fs.writeFileSync(bufferFile, JSON.stringify(arr, null, 2), 'utf8');
  } catch (err) {
    devOnly(() => console.error('Failed to save to local buffer:', err));
  }
}

export async function flushBufferToRedis(redis: any) {
  try {
    const raw = fs.readFileSync(bufferFile, 'utf8');
    const arr: { keyword: string; fact: string }[] = JSON.parse(raw);

    if (arr.length === 0) return;

    arr.forEach(async (item) => {
      try {
        await redis.lpush(`fallback:${item.keyword}`, item.fact);
        await redis.ltrim(`fallback:${item.keyword}`, 0, 3999);
      } catch (err) {
        devOnly(() =>
          console.error('Redis still unavailable, skipping flush:', err),
        );
      }
    });

    // Clear file once flushed
    fs.writeFileSync(bufferFile, JSON.stringify([], null, 2), 'utf8');
  } catch (err) {
    devOnly(() => console.error('Failed to flush buffer:', err));
  }
}
//check if buffer has data before attempting flush
export function hasLocalBufferData(): boolean {
  try {
    if (!fs.existsSync(bufferFile)) return false;
    const raw = fs.readFileSync(bufferFile, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) && data.length > 0;
  } catch (err) {
    devOnly(() => console.error('Failed to check local buffer:', err));
    return false;
  }
}
