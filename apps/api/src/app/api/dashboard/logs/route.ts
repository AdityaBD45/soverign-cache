import { NextResponse } from "next/server";

import { connectDB } from "@/app/lib/db";
import { PurgeLog } from "@/models/PurgeLog";
import { getAuthUserOrThrow } from "@/app/lib/clerkRole";

export async function GET() {
  try {
    const { userId, role } = await getAuthUserOrThrow();

    await connectDB();

    const filter = role === "admin" ? {} : { ownerUserId: userId };

    const logs = await PurgeLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      role,
      count: logs.length,
      logs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}
