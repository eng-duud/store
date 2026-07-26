import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getInventoryOverview, adjustStock } from "@/services/inventory.service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;

    const result = await getInventoryOverview({
      search: searchParams.get("q") || undefined,
      status: (searchParams.get("status") as any) || undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 20,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching inventory overview:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    if (!body.productId || !body.type || body.quantity === undefined) {
      return NextResponse.json(
        { success: false, error: "يرجى تقديم المنتج ونوع الحركة والكمية" },
        { status: 400 }
      );
    }

    const result = await adjustStock({
      productId: body.productId,
      variantId: body.variantId,
      type: body.type,
      quantity: Number(body.quantity),
      notes: body.notes,
      reference: body.reference,
      userId: session.user.id,
      userName: session.user.name || undefined,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error("Error adjusting stock:", error);
    return NextResponse.json(
      { success: false, error: error.message || "حدث خطأ أثناء تعديل المخزون" },
      { status: 500 }
    );
  }
}
