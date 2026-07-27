import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { mediaService } from "@/services/media.service";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const orphans = await mediaService.findOrphans();

    return NextResponse.json({
      success: true,
      data: {
        orphanCount: orphans.length,
        orphans,
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Orphan detection error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to detect orphans" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const result = await mediaService.cleanupOrphans();

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Orphan cleanup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cleanup failed" },
      { status: 500 }
    );
  }
}
