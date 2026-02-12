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
    const { key } = body;

    if (!key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    // sc:cache:v1:<namespace>:<key>
    const redisKey = `sc:cache:v1:${namespace.slug}:${key}`;

    const deletedCount = await redis.del(redisKey);

    await connectDB();
    await PurgeLog.create({
      namespaceId: namespace._id,
      apiKeyId: apiKey._id,
      action: "PURGE_KEY",
      value: key,
      status: "SUCCESS",
      message: deletedCount ? "Deleted" : "Not found",
    });

    return NextResponse.json({
      success: true,
      namespace: namespace.slug,
      key,
      deleted: deletedCount === 1,
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
