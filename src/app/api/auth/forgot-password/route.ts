import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "البريد الإلكتروني مطلوب" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // In production: generate reset token and send email
      // For MVP: just acknowledge the request
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "حدث خطأ" },
      { status: 500 }
    );
  }
}
