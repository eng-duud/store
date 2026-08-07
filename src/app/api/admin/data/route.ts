import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getBackupsList, getImportLogsList, createSystemBackup } from "@/lib/data-platform";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const backups = getBackupsList();
    const importLogs = getImportLogsList();

    return NextResponse.json({
      success: true,
      data: {
        backups,
        importLogs,
      },
    });
  } catch (error: any) {
    console.error("Data Platform API GET Error:", error);
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
    if (body.action === "CREATE_BACKUP") {
      const backup = createSystemBackup(session.user.name || undefined);
      return NextResponse.json({ success: true, data: backup });
    }

    return NextResponse.json({ success: false, error: "إجراء غير صالح" }, { status: 400 });
  } catch (error: any) {
    console.error("Data Platform API POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
