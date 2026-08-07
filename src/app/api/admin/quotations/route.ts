import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getQuotationsOverview, createQuotation } from "@/services/quotation.service";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const data = await getQuotationsOverview();
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error("Quotations API GET Error:", error);
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
    const { customerName, customerPhone, customerEmail, validUntil, items, notes } = body;

    if (!customerName || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "البيانات غير مكتملة" }, { status: 400 });
    }

    const newQuotation = await createQuotation({
      customerName,
      customerPhone,
      customerEmail,
      validUntil: validUntil || new Date(Date.now() + 86400000 * 15).toISOString(),
      items,
      notes,
      userId: session.user.id,
      userName: session.user.name || undefined,
    });

    return NextResponse.json({ success: true, data: newQuotation });
  } catch (error: any) {
    console.error("Quotations API POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
