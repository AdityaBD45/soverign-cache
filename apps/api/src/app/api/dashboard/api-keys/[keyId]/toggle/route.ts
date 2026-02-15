import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import { ApiKey } from "@/models/ApiKey";
import { getAuthUserOrThrow } from "@/app/lib/clerkRole";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ keyId: string }> }
) {
  try {
    const { userId, role } = await getAuthUserOrThrow();
    const { keyId } = await params;

    const body = await req.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive must be boolean" },
        { status: 400 }
      );
    }

    await connectDB();

    const keyDoc = await ApiKey.findById(keyId);
    if (!keyDoc) {
      return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    // user can only toggle their own keys
    if (role !== "admin" && keyDoc.ownerUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    keyDoc.isActive = isActive;
    await keyDoc.save();

    return NextResponse.json({
      success: true,
      message: isActive ? "API key enabled" : "API key disabled",
      isActive: keyDoc.isActive,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Unauthorized" },
      { status: 401 }
    );
  }
}
