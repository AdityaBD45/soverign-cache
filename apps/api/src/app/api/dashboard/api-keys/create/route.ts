import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import { connectDB } from "@/app/lib/db";
import { ApiKey } from "@/models/ApiKey";
import { Namespace } from "@/models/Namespace";
import { getAuthUserOrThrow } from "@/app/lib/clerkRole";

function generateApiKey() {
  const random = crypto.randomBytes(32).toString("hex");
  return `sk_live_${random}`;
}

export async function POST(req: Request) {
  try {
    const { userId, role } = await getAuthUserOrThrow();

    const pepper = process.env.API_KEY_PEPPER;
    if (!pepper) {
      return NextResponse.json(
        { error: "API_KEY_PEPPER missing in env" },
        { status: 500 }
      );
    }

    await connectDB();

    const body = await req.json();
    const { namespaceId } = body;

    if (!namespaceId) {
      return NextResponse.json(
        { error: "namespaceId is required" },
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

    const rawKey = generateApiKey();
    const keyPrefix = rawKey.slice(0, 12);
    const keyHash = await bcrypt.hash(rawKey + pepper, 12);

    const apiKey = await ApiKey.create({
      ownerUserId: namespace.ownerUserId, // (admin can create but key belongs to namespace owner)
      namespaceId: namespace._id,
      keyPrefix,
      keyHash,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      apiKey: {
        id: apiKey._id,
        namespaceId: namespace._id,
        namespaceSlug: namespace.slug,
        keyPrefix,
        rawKey, // ⚠️ show only once
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
