import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getProductById, updateProduct, deleteProduct } from "@/services/product.service";
import { createAuditLog } from "@/services/audit.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
      return NextResponse.json({ success: false, error: "المنتج غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error fetching product:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const oldProduct = await getProductById(id);

    const product = await updateProduct(id, {
      name: body.name,
      sku: body.sku,
      price: body.price !== undefined ? Number(body.price) : undefined,
      salePrice: body.salePrice !== undefined ? (body.salePrice ? Number(body.salePrice) : null) : undefined,
      stockQuantity: body.stockQuantity !== undefined ? Number(body.stockQuantity) : undefined,
      description: body.description,
      shortDescription: body.shortDescription,
      status: body.status,
      isFeatured: body.isFeatured,
      categoryIds: body.categoryIds,
      imageUrls: body.imageUrls,
    });

    await createAuditLog({
      action: "تعديل منتج",
      module: "PRODUCTS",
      entity: "Product",
      entityId: id,
      oldValues: oldProduct ? { name: oldProduct.name, sku: oldProduct.sku, price: Number(oldProduct.price) } : undefined,
      newValues: { name: product.name, sku: product.sku, price: Number(product.price) },
      userId: session.user.id,
      userName: session.user.name || undefined,
      notes: `تم تعديل المنتج: ${product.name}`,
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء تعديل المنتج" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return PUT(request, { params });
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin();
    const { id } = await params;
    const oldProduct = await getProductById(id);
    await deleteProduct(id);

    await createAuditLog({
      action: "حذف منتج",
      module: "PRODUCTS",
      entity: "Product",
      entityId: id,
      oldValues: oldProduct ? { name: oldProduct.name, sku: oldProduct.sku, price: Number(oldProduct.price) } : undefined,
      userId: session.user.id,
      userName: session.user.name || undefined,
      notes: `تم حذف المنتج: ${oldProduct?.name || id}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء حذف المنتج" }, { status: 500 });
  }
}
