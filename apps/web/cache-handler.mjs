import { ensureRedisConnected, redis } from "./app/lib/redis.js";

const PREFIX = "sc:v1:";

function buildKey(key) {
  return `${PREFIX}${key}`;
}

function log(...args) {
  console.log("[SOVEREIGN-CACHE]", ...args);
}

export default class SovereignRedisCacheHandler {
  constructor() {
    log("✅ Custom Cache Handler Loaded");
  }

  async get(key) {
    log("GET", key);

    await ensureRedisConnected();

    const raw = await redis.get(buildKey(key));
    if (!raw) {
      log("MISS", key);
      return null;
    }

    const parsed = JSON.parse(raw);

    // Next expects: { value, lastModified }
    if (!parsed?.value) {
      log("INVALID ENTRY", key);
      return null;
    }

    log("HIT", key);
    return parsed;
  }

  async set(key, data, ctx) {
    // Correct TTL extraction for Next 15
    const ttl =
      typeof ctx?.cacheControl?.revalidate === "number"
        ? ctx.cacheControl.revalidate
        : typeof ctx?.revalidate === "number"
          ? ctx.revalidate
          : 60;

    log("SET", key, "ttl =", ttl);

    await ensureRedisConnected();

    const entry = {
      value: data,
      lastModified: Date.now(),
    };

    await redis.set(buildKey(key), JSON.stringify(entry), {
      EX: ttl,
    });
  }

  async revalidateTag(tag) {
    log("REVALIDATE TAG", tag);
    // Stage 3
  }

  async resetRequestCache() {
    log("RESET REQUEST CACHE");
  }
}
