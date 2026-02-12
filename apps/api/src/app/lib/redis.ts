import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
  throw new Error("❌ REDIS_URL missing in .env.local");
}

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});
