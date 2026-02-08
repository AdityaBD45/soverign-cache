import { createClient } from "redis";

const globalForRedis = globalThis;

export const redis =
  globalForRedis.__redisClient ??
  createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

if (!globalForRedis.__redisClient) {
  globalForRedis.__redisClient = redis;
}

redis.on("error", (err) => console.error("Redis Error:", err));

export async function ensureRedisConnected() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}
