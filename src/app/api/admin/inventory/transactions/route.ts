import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getInventoryTransactions } from "@/services/inventory.service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;

    const result = await getInventoryTransactions({
      productId: searchParams.get("productId") || undefined,
      type: (searchParams.get("type") as any) || undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching inventory transactions:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
