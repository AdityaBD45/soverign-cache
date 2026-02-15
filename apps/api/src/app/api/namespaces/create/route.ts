import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import { auth } from "@clerk/nextjs/server";

import { connectDB } from "@/app/lib/db";
import { Namespace } from "@/models/Namespace";
import { ApiKey } from "@/models/ApiKey";
import { encryptRedisUrl } from "@/app/lib/crypto";

function generateApiKey() {
  const random = crypto.randomBytes(32).toString("hex");
  return `sk_live_${random}`;
}

export async function POST(req: Request) {
  try {
    // ✅ Clerk Auth
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { namespaceName, namespaceSlug, redisUrl } = body;

    if (!namespaceName || !namespaceSlug || !redisUrl) {
      return NextResponse.json(
        { error: "namespaceName, namespaceSlug and redisUrl are required" },
        { status: 400 }
      );
    }

    // ✅ Encrypt redisUrl before storing
    const encrypted = encryptRedisUrl(redisUrl);

    // ✅ Create namespace (unique per user)
    const namespace = await Namespace.create({
      ownerUserId: userId,
      name: namespaceName,
      slug: namespaceSlug,

      redisUrlEnc: encrypted.enc,
      redisUrlIv: encrypted.iv,
      redisUrlTag: encrypted.tag,
    });

    const rawKey = generateApiKey();
    const keyPrefix = rawKey.slice(0, 12);

    const pepper = process.env.API_KEY_PEPPER;
    if (!pepper) {
      return NextResponse.json(
        { error: "API_KEY_PEPPER missing in env" },
        { status: 500 }
      );
    }

    const keyHash = await bcrypt.hash(rawKey + pepper, 12);

    const apiKey = await ApiKey.create({
      ownerUserId: userId, // ✅ NEW
      namespaceId: namespace._id,
      keyPrefix,
      keyHash,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      namespace: {
        id: namespace._id,
        name: namespace.name,
        slug: namespace.slug,
      },
      apiKey: {
        id: apiKey._id,
        keyPrefix,
        rawKey, // ⚠️ show only once
      },
    });
  } catch (err: any) {
    // duplicate slug
    if (err?.code === 11000) {
      return NextResponse.json(
        { error: "Namespace slug already exists" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
