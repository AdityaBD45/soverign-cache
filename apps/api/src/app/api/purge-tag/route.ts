import { NextResponse } from "next/server";

import { requireApiKey } from "@/app/lib/auth";
import { redis } from "@/app/lib/redis";
import { connectDB } from "@/app/lib/db";
import { PurgeLog } from "@/models/PurgeLog";
import { rateLimitOrThrow } from "@/app/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const { namespace, apiKey } = await requireApiKey(req);

    // 🚦 Rate limit (30 req/min)
    await rateLimitOrThrow(apiKey._id.toString());

    const body = await req.json();
    const { tag } = body;

    if (!tag) {
      return NextResponse.json({ error: "tag is required" }, { status: 400 });
    }

    // sc:tag:v1:<namespace>:<tag>
    const tagSetKey = `sc:tag:v1:${namespace.slug}:${tag}`;

    const keys = await redis.smembers(tagSetKey);

    if (keys.length > 0) {
      await redis.del(...keys);
    }

    await redis.del(tagSetKey);

    await connectDB();
    await PurgeLog.create({
      namespaceId: namespace._id,
      apiKeyId: apiKey._id,
      action: "PURGE_TAG",
      value: tag,
      status: "SUCCESS",
      message: `Purged ${keys.length} keys`,
    });

    return NextResponse.json({
      success: true,
      namespace: namespace.slug,
      tag,
      deletedKeys: keys.length,
    });
  } catch (err: any) {
    const msg = err?.message || "Something went wrong";

    // 🚦 rate limit
    if (msg.toLowerCase().includes("rate limit")) {
      return NextResponse.json({ error: msg }, { status: 429 });
    }

    // 🔒 auth errors
    if (
      msg.toLowerCase().includes("authorization") ||
      msg.toLowerCase().includes("api key") ||
      msg.toLowerCase().includes("unauthorized")
    ) {
      return NextResponse.json({ error: msg }, { status: 401 });
    }

    // 💥 fallback
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
