import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getSystemHealthOverview } from "@/lib/operations-center";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const health = getSystemHealthOverview();
    return NextResponse.json({ success: true, data: health });
  } catch (error: any) {
    console.error("Health API GET Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
