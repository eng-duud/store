import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getStoreSettings, updateStoreSettings } from "@/services/settings.service";
import { createAuditLog } from "@/services/audit.service";

export async function GET() {
  try {
    await requireAdmin();
    const settings = await getStoreSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "غير مصرح لك بالوصول" }, { status: 401 });
    }
    console.error("Error fetching admin settings:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ غير متوقع" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    const updatedSettings = await updateStoreSettings(body);

    await createAuditLog({
      action: "تحديث إعدادات المتجر",
      module: "SETTINGS",
      entity: "StoreSetting",
      newValues: body,
      userId: session.user.id,
      userName: session.user.name || undefined,
      notes: "تم تحديث إعدادات المتجر",
    });

    return NextResponse.json({
      success: true,
      message: "تم تحديث إعدادات المتجر بنجاح",
      data: updatedSettings,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "غير مصرح لك بالوصول" }, { status: 401 });
    }
    console.error("Error updating admin settings:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء حفظ الإعدادات" }, { status: 500 });
  }
}
