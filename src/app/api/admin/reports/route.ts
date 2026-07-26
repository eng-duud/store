import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  getReportsSummary,
  getSalesReport,
  getProductReport,
  getCustomerReport,
  DateRangePreset,
} from "@/services/reports.service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const type = searchParams.get("type") || "summary";
    const range = (searchParams.get("range") || "month") as DateRangePreset;

    let data: any = {};

    switch (type) {
      case "sales":
        data = await getSalesReport(range);
        break;
      case "products":
        data = await getProductReport();
        break;
      case "customers":
        data = await getCustomerReport();
        break;
      case "summary":
      default:
        data = await getReportsSummary(range);
        break;
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching report data:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء تحميل التقارير" }, { status: 500 });
  }
}
