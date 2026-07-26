import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { globalSearch } from "@/services/search.service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const query = searchParams.get("q") || "";

    const results = await globalSearch(query);
    return NextResponse.json({ success: true, data: results });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
