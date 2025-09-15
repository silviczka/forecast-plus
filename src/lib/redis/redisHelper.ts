import { Redis as UpstashRedis } from '@upstash/redis';

// --- TYPE GUARD ---
export function isUpstashRedis(client: unknown): client is UpstashRedis {
  return (
    client !== null &&
    typeof client === 'object' &&
    'set' in client &&
    typeof (client as UpstashRedis).set === 'function'
  );
}
