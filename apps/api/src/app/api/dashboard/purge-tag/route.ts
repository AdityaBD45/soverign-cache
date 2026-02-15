import { NextResponse } from "next/server";

import { connectDB } from "@/app/lib/db";
import { Namespace } from "@/models/Namespace";
import { PurgeLog } from "@/models/PurgeLog";
import { getAuthUserOrThrow } from "@/app/lib/clerkRole";
import { getRedisClientFromNamespace } from "@/app/lib/redisClients";

export async function POST(req: Request) {
  try {
    const { userId, role } = await getAuthUserOrThrow();

    await connectDB();

    const body = await req.json();
    const { namespaceId, tag } = body;

    if (!namespaceId || !tag) {
      return NextResponse.json(
        { error: "namespaceId and tag are required" },
        { status: 400 }
      );
    }

    const namespace = await Namespace.findById(namespaceId);

    if (!namespace) {
      return NextResponse.json(
        { error: "Namespace not found" },
        { status: 404 }
      );
    }

    // 🔒 Ownership check
    if (role !== "admin" && namespace.ownerUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const redis = getRedisClientFromNamespace(namespace);

    const tagSetKey = `sc:tag:v1:${namespace.slug}:${tag}`;

    const keys = await redis.smembers(tagSetKey);

    if (keys.length > 0) {
      await redis.del(...keys);
    }

    await redis.del(tagSetKey);

    await PurgeLog.create({
      ownerUserId: namespace.ownerUserId,
      namespaceId: namespace._id,
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
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
