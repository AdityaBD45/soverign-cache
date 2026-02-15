import { NextResponse } from "next/server";

import { connectDB } from "@/app/lib/db";
import { ApiKey } from "@/models/ApiKey";
import { Namespace } from "@/models/Namespace";
import { getAuthUserOrThrow } from "@/app/lib/clerkRole";

export async function GET() {
  try {
    const { userId, role } = await getAuthUserOrThrow();

    await connectDB();

    const filter = role === "admin" ? {} : { ownerUserId: userId };

    const keys = await ApiKey.find(filter)
      .select("ownerUserId namespaceId keyPrefix isActive createdAt updatedAt")
      .sort({ createdAt: -1 })
      .limit(100);

    // Optional: attach namespace slug for UI
    const namespaceIds = keys.map((k) => k.namespaceId);

    const namespaces = await Namespace.find({
      _id: { $in: namespaceIds },
    }).select("slug name");

    const nsMap = new Map(
      namespaces.map((ns) => [ns._id.toString(), ns])
    );

    const result = keys.map((k) => ({
      id: k._id,
      ownerUserId: k.ownerUserId,
      namespaceId: k.namespaceId,
      namespaceSlug: nsMap.get(k.namespaceId.toString())?.slug || null,
      namespaceName: nsMap.get(k.namespaceId.toString())?.name || null,
      keyPrefix: k.keyPrefix,
      isActive: k.isActive,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      role,
      count: result.length,
      keys: result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}
