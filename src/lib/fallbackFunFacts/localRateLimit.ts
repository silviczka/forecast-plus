import fs from 'fs';
import path from 'path';
import { devOnly } from '../devonly';

const rlFile = path.join(process.cwd(), 'rateLimitBuffer.json');

// Ensure file exists
if (!fs.existsSync(rlFile)) {
  fs.writeFileSync(rlFile, JSON.stringify({}), 'utf8');
}

export function checkLocalRateLimit(
  ip: string,
  limit: number,
  windowMs: number,
): boolean {
  try {
    const raw = fs.readFileSync(rlFile, 'utf8');
    const data: Record<string, { count: number; resetAt: number }> =
      JSON.parse(raw);

    const now = Date.now();
    const entry = data[ip];

    if (!entry || entry.resetAt < now) {
      data[ip] = { count: 1, resetAt: now + windowMs };
    } else {
      data[ip].count++;
    }

    fs.writeFileSync(rlFile, JSON.stringify(data, null, 2), 'utf8');
    return data[ip].count <= limit;
  } catch (err) {
    devOnly(() => console.error('Local rate limit check failed:', err));
    return true; // fallback allow
  }
}
