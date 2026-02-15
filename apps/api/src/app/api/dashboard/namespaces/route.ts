import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { Namespace } from "@/models/Namespace";
import { getAuthUserOrThrow } from "@/app/lib/clerkRole";

export async function GET() {
  try {
    const { userId, role } = await getAuthUserOrThrow();

    await connectDB();

    const filter = role === "admin" ? {} : { ownerUserId: userId };

    const namespaces = await Namespace.find(filter)
      .select("name slug ownerUserId createdAt updatedAt")
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      role,
      count: namespaces.length,
      namespaces,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}
