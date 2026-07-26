import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getExpenses, createExpense } from "@/services/accounting.service";
import { createAuditLog } from "@/services/audit.service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;

    const result = await getExpenses({
      search: searchParams.get("q") || undefined,
      categoryId: searchParams.get("categoryId") || undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: 20,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching expenses:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    if (!body.expenseCategoryId || !body.amount || !body.description) {
      return NextResponse.json(
        { success: false, error: "يرجى تعبئة جميع الحقول المطلوبة" },
        { status: 400 }
      );
    }

    const expense = await createExpense({
      expenseCategoryId: body.expenseCategoryId,
      amount: Number(body.amount),
      description: body.description,
      date: body.date || undefined,
      receiptUrl: body.receiptUrl || undefined,
    });

    await createAuditLog({
      action: "تسجيل مصروف جديد",
      module: "ACCOUNTING",
      entity: "Expense",
      entityId: expense.id,
      newValues: { amount: Number(expense.amount), description: expense.description },
      userId: session.user.id,
      userName: session.user.name || undefined,
      notes: `تسجيل مصروف جديد: ${expense.description} بمبلغ ${Number(expense.amount)}`,
    });

    return NextResponse.json({ success: true, data: expense }, { status: 201 });
  } catch (error) {
    console.error("Error creating expense:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء إضافة المصروف" }, { status: 500 });
  }
}
