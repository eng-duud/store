import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getActivityTimeline } from "@/services/timeline.service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const moduleFilter = searchParams.get("module") || undefined;

    const items = await getActivityTimeline({ module: moduleFilter, limit: 40 });
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
