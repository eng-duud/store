import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { updateExpense, deleteExpense } from "@/services/accounting.service";
import { createAuditLog } from "@/services/audit.service";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const expense = await updateExpense(id, {
      expenseCategoryId: body.expenseCategoryId,
      amount: body.amount ? Number(body.amount) : undefined,
      description: body.description,
      date: body.date,
      receiptUrl: body.receiptUrl,
    });

    await createAuditLog({
      action: "تحديث مصروف",
      module: "ACCOUNTING",
      entity: "Expense",
      entityId: expense.id,
      newValues: { amount: Number(expense.amount), description: expense.description },
      userId: session.user.id,
      userName: session.user.name || undefined,
      notes: `تم تحديث المصروف: ${expense.description}`,
    });

    return NextResponse.json({ success: true, data: expense });
  } catch (error) {
    console.error("Error updating expense:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء تعديل المصروف" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    await deleteExpense(id);

    await createAuditLog({
      action: "حذف مصروف",
      module: "ACCOUNTING",
      entity: "Expense",
      entityId: id,
      userId: session.user.id,
      userName: session.user.name || undefined,
      notes: "تم حذف مصروف",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء حذف المصروف" }, { status: 500 });
  }
}
