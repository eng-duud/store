import { NextResponse } from "next/server";
import { getDashboardStats } from "@/services/dashboard.service";
import { requireAdmin } from "@/lib/admin";

export async function GET() {
  try {
    await requireAdmin();
    const stats = await getDashboardStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
