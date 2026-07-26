import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getExpenseCategories, createExpenseCategory, updateExpenseCategory, deleteExpenseCategory } from "@/services/accounting.service";

export async function GET() {
  try {
    await requireAdmin();
    const categories = await getExpenseCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch {
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    if (!body.name) return NextResponse.json({ success: false, error: "الاسم مطلوب" }, { status: 400 });
    const cat = await createExpenseCategory({ name: body.name, description: body.description });
    return NextResponse.json({ success: true, data: cat }, { status: 201 });
  } catch {
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    if (!body.id || !body.name) return NextResponse.json({ success: false, error: "بيانات ناقصة" }, { status: 400 });
    const cat = await updateExpenseCategory(body.id, { name: body.name, description: body.description });
    return NextResponse.json({ success: true, data: cat });
  } catch {
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "المعرف مطلوب" }, { status: 400 });
    await deleteExpenseCategory(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
