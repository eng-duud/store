import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getNotifications, markNotificationAsRead, pushNotification } from "@/lib/workflow-platform";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "غير مصرح" }, { status: 401 });
    }

    const notifications = getNotifications();
    return NextResponse.json({ success: true, data: notifications });
  } catch (error: any) {
    console.error("Notifications API GET Error:", error);
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
    const { action, id, title, message, category, priority, channels } = body;

    if (action === "MARK_READ" && id) {
      markNotificationAsRead(id);
      return NextResponse.json({ success: true });
    }

    if (title && message) {
      const notif = pushNotification({
        title,
        message,
        category: category || "SYSTEM",
        priority: priority || "MEDIUM",
        channels: channels || ["IN_APP"],
      });
      return NextResponse.json({ success: true, data: notif });
    }

    return NextResponse.json({ success: false, error: "طلب غير صالح" }, { status: 400 });
  } catch (error: any) {
    console.error("Notifications API POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
