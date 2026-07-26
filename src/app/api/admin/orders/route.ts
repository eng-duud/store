import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getAllOrders, updateOrderStatus } from "@/services/order.service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const result = await getAllOrders({
      search: searchParams.get("q") || undefined,
      status: searchParams.get("status") || undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: 20,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching orders:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { orderId, status, note } = body;

    if (!orderId || !status) {
      return NextResponse.json(
        { success: false, error: "orderId and status are required" },
        { status: 400 }
      );
    }

    const order = await updateOrderStatus(orderId, status, note, session.user.id, session.user.name || undefined);
    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error updating order:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
