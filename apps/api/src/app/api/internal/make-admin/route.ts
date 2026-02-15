import { NextResponse } from "next/server";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ⚠️ Only allow if userId matches your own (hardcoded)
    const OWNER_ID = process.env.OWNER_USER_ID;
    if (!OWNER_ID) {
      return NextResponse.json(
        { error: "OWNER_USER_ID missing in env" },
        { status: 500 }
      );
    }

    if (userId !== OWNER_ID) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const client = await clerkClient();

    const updated = await client.users.updateUser(userId, {
      publicMetadata: { role: "admin" },
    });

    return NextResponse.json({
      success: true,
      userId,
      publicMetadata: updated.publicMetadata,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
