import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  getRecycleBinItems,
  restoreRecycleBinItem,
  permanentlyDeleteRecycleBinItem,
} from "@/services/recycle-bin.service";

export async function GET() {
  try {
    await requireAdmin();
    const items = await getRecycleBinItems();
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { action, type, id } = body;

    if (!action || !type || !id) {
      return NextResponse.json({ success: false, error: "بيانات ناقصة" }, { status: 400 });
    }

    if (action === "RESTORE") {
      await restoreRecycleBinItem(type, id, session.user.id, session.user.name || undefined);
      return NextResponse.json({ success: true, message: "تمت الاستعادة بنجاح" });
    } else if (action === "DELETE") {
      await permanentlyDeleteRecycleBinItem(type, id, session.user.id, session.user.name || undefined);
      return NextResponse.json({ success: true, message: "تم الحذف النهائي بنجاح" });
    }

    return NextResponse.json({ success: false, error: "إجراء غير معروف" }, { status: 400 });
  } catch (error) {
    console.error("Recycle bin error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
