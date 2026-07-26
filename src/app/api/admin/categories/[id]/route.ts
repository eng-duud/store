import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import prisma from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import { createAuditLog } from "@/services/audit.service";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const parsed = categorySchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0].message },
        { status: 400 }
      );
    }

    const oldCategory = await prisma.category.findUnique({ where: { id } });
    if (!oldCategory) {
      return NextResponse.json({ success: false, error: "الفئة غير موجودة" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
    if (parsed.data.imageId !== undefined) updateData.imageId = parsed.data.imageId;
    if (parsed.data.parentId !== undefined) updateData.parentId = parsed.data.parentId;
    if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
    if (parsed.data.sortOrder !== undefined) updateData.sortOrder = parsed.data.sortOrder;

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    });

    await createAuditLog({
      action: "تحديث فئة",
      module: "CATEGORIES",
      entity: "Category",
      entityId: category.id,
      oldValues: { name: oldCategory.name, description: oldCategory.description, status: oldCategory.status },
      newValues: { name: category.name, description: category.description, status: category.status },
      userId: session.user?.id,
      userName: session.user?.name || undefined,
      notes: `تم تحديث الفئة: ${category.name}`,
    });

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;

    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      return NextResponse.json({ success: false, error: "الفئة غير موجودة" }, { status: 404 });
    }

    const productCount = await prisma.productCategory.count({
      where: { categoryId: id },
    });

    if (productCount > 0) {
      return NextResponse.json(
        { success: false, error: "لا يمكن حذف فئة تحتوي على منتجات" },
        { status: 400 }
      );
    }

    await prisma.category.update({ where: { id }, data: { deletedAt: new Date() } });

    await createAuditLog({
      action: "حذف فئة",
      module: "CATEGORIES",
      entity: "Category",
      entityId: id,
      oldValues: { name: category.name, description: category.description },
      userId: session.user?.id,
      userName: session.user?.name || undefined,
      notes: `تم حذف الفئة: ${category.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
