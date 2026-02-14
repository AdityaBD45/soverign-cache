import Redis from "ioredis";
import { decryptRedisUrl } from "@/app/lib/crypto";

/**
 * Cache Redis clients by redisUrl (per namespace)
 * So we don't reconnect every request.
 */
const clientMap = new Map<string, Redis>();

export function getRedisClientFromNamespace(namespace: {
  redisUrlEnc: string;
  redisUrlIv: string;
  redisUrlTag: string;
}) {
  const redisUrl = decryptRedisUrl({
    enc: namespace.redisUrlEnc,
    iv: namespace.redisUrlIv,
    tag: namespace.redisUrlTag,
  });

  // reuse client
  const existing = clientMap.get(redisUrl);
  if (existing) return existing;

  const client = new Redis(redisUrl, {
    maxRetriesPerRequest: null,
  });

  clientMap.set(redisUrl, client);

  return client;
}
