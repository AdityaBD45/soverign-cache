import { redis } from "@/app/lib/redis";

export async function rateLimitOrThrow(apiKeyId: string) {
  const limit = 30;
  const windowSec = 60;

  const key = `sc:rl:v1:${apiKeyId}`;

  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, windowSec);
  }

  const remaining = Math.max(0, limit - count);

  if (count > limit) {
    throw new Error(`Rate limit exceeded (${limit} requests per ${windowSec}s)`);
  }

  return { count, remaining, limit, windowSec };
}
