import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { mediaService } from "@/services/media.service";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orphans = await mediaService.findOrphans();

    return NextResponse.json({
      success: true,
      data: {
        orphanCount: orphans.length,
        orphans,
      },
    });
  } catch (error) {
    console.error("Orphan detection error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to detect orphans" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await mediaService.cleanupOrphans();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Orphan cleanup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cleanup failed" },
      { status: 500 }
    );
  }
}
