import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrderById } from "@/services/order.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const order = await getOrderById(id, session.user.id);

    if (!order) {
      return NextResponse.json({ success: false, error: "الطلب غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
