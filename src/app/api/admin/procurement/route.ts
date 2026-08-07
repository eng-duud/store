import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getProcurementOverview, createPurchaseOrder, receivePurchaseOrder } from "@/services/procurement.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const data = await getProcurementOverview();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Procurement API GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const body = await req.json();
    const { action, poId, supplierId, supplierName, items, notes } = body;

    if (action === "RECEIVE") {
      if (!poId) return NextResponse.json({ success: false, error: "رقم أمر الشراء مطلوب" }, { status: 400 });
      const result = await receivePurchaseOrder(poId, session.user.id, session.user.name || undefined);
      return NextResponse.json({ success: true, data: result });
    }

    if (!supplierId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "البيانات غير مكتملة" }, { status: 400 });
    }

    const newPO = await createPurchaseOrder({
      supplierId,
      supplierName: supplierName || "مورد عام",
      items,
      notes,
      userId: session.user.id,
      userName: session.user.name || undefined,
    });

    return NextResponse.json({ success: true, data: newPO });
  } catch (error: any) {
    console.error("Procurement API POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
