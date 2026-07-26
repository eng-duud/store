import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getFinancialSummary } from "@/services/accounting.service";
import { DateRangePreset } from "@/services/reports.service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const range = (searchParams.get("range") || "month") as DateRangePreset;

    const summary = await getFinancialSummary(range);
    return NextResponse.json({ success: true, data: summary });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching accounting summary:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء تحميل البيانات المالية" }, { status: 500 });
  }
}
