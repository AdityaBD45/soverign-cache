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
    const { namespaceId, key } = body;

    if (!namespaceId || !key) {
      return NextResponse.json(
        { error: "namespaceId and key are required" },
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

    const redisKey = `sc:cache:v1:${namespace.slug}:${key}`;

    const deletedCount = await redis.del(redisKey);

    await PurgeLog.create({
      ownerUserId: namespace.ownerUserId,
      namespaceId: namespace._id,
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
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
