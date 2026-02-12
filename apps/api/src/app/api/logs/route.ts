import { NextResponse } from "next/server";
import { requireApiKey } from "@/app/lib/auth";
import { connectDB } from "@/app/lib/db";
import { PurgeLog } from "@/models/PurgeLog";

export async function GET(req: Request) {
  try {
    const { namespace } = await requireApiKey(req);
   

    await connectDB();

    const logs = await PurgeLog.find({ namespaceId: namespace._id })
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      success: true,
      namespace: namespace.slug,
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
