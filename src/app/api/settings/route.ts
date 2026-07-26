import { NextResponse } from "next/server";
import { getStoreSettings } from "@/services/settings.service";

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    return NextResponse.json(
      { success: false, error: "فشل في تحميل إعدادات المتجر" },
      { status: 500 }
    );
  }
}
