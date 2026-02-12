import { createClient } from "redis";

const NAMESPACE = process.env.SOVEREIGN_NAMESPACE || "default";

// Cache keys (actual cached responses)
const CACHE_PREFIX =
  process.env.SOVEREIGN_CACHE_PREFIX || "sc:cache:v1:";

// Tag sets (tag -> keys mapping)
const TAG_PREFIX = process.env.SOVEREIGN_TAG_PREFIX || "sc:tag:v1:";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const LOGS = process.env.SOVEREIGN_LOGS === "true";

function log(...args) {
  if (LOGS) console.log("[SOVEREIGN-CACHE]", ...args);
}

let redis;

async function ensureRedisConnected() {
  if (!redis) {
    redis = createClient({ url: REDIS_URL });

    redis.on("error", (err) => {
      console.error("[SOVEREIGN-CACHE] Redis Error:", err);
    });
  }

  if (!redis.isOpen) {
    await redis.connect();
    log("Connected to Redis:", REDIS_URL);
  }
}

function buildKey(key) {
  // sc:cache:v1:softsell:products-list
  return `${CACHE_PREFIX}${NAMESPACE}:${key}`;
}

function buildTagKey(tag) {
  // sc:tag:v1:softsell:products
  return `${TAG_PREFIX}${NAMESPACE}:${tag}`;
}

export default class SovereignRedisCacheHandler {
  constructor() {
    log("✅ Custom Cache Handler Loaded | namespace =", NAMESPACE);
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

    if (!parsed?.value) {
      log("INVALID ENTRY", key);
      return null;
    }

    log("HIT", key);
    return parsed;
  }

  async set(key, data, ctx) {
    const ttl =
      typeof ctx?.cacheControl?.revalidate === "number"
        ? ctx.cacheControl.revalidate
        : typeof ctx?.revalidate === "number"
          ? ctx.revalidate
          : 60;

    const tags = Array.isArray(ctx?.tags) ? ctx.tags : [];

    log("SET", key, "ttl =", ttl, tags.length ? `tags=${tags.join(",")}` : "");

    await ensureRedisConnected();

    const entry = {
      value: data,
      lastModified: Date.now(),
    };

    const fullKey = buildKey(key);

    // 1) Store actual cache entry
    await redis.set(fullKey, JSON.stringify(entry), {
      EX: ttl,
    });

    // 2) Store tag -> keys mapping
    if (tags.length) {
      for (const tag of tags) {
        const tagKey = buildTagKey(tag);

        // Add this cache key to the tag set
        await redis.sAdd(tagKey, fullKey);

        // Keep tag set alive long enough
        const currentTTL = await redis.ttl(tagKey);
        if (currentTTL < ttl) {
          await redis.expire(tagKey, ttl);
        }
      }
    }
  }

  async revalidateTag(tag) {
    log("REVALIDATE TAG", tag);

    await ensureRedisConnected();

    const tagKey = buildTagKey(tag);

    const keys = await redis.sMembers(tagKey);

    if (!keys.length) {
      log("TAG EMPTY", tag);
      return;
    }

    log("PURGING", keys.length, "keys for tag", tag);

    // delete all cache keys
    await redis.del(keys);

    // delete tag set itself
    await redis.del(tagKey);

    log("DONE PURGE TAG", tag);
  }

  async resetRequestCache() {
    log("RESET REQUEST CACHE");
  }
}
