import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { createProduct } from "@/services/product.service";
import { createAuditLog } from "@/services/audit.service";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    if (!body.name || !body.sku || body.price === undefined) {
      return NextResponse.json(
        { success: false, error: "يرجى تعبئة جميع الحقول المطلوبة" },
        { status: 400 }
      );
    }

    const product = await createProduct({
      name: body.name,
      sku: body.sku,
      price: Number(body.price),
      salePrice: body.salePrice ? Number(body.salePrice) : null,
      costPrice: body.costPrice ? Number(body.costPrice) : null,
      stockQuantity: Number(body.stockQuantity) || 0,
      description: body.description || undefined,
      shortDescription: body.shortDescription || undefined,
      status: body.status || "ACTIVE",
      isFeatured: Boolean(body.isFeatured),
      categoryIds: Array.isArray(body.categoryIds) ? body.categoryIds : [],
      imageUrls: Array.isArray(body.imageUrls) ? body.imageUrls : [],
    });

    await createAuditLog({
      action: "إنشاء منتج جديد",
      module: "PRODUCTS",
      entity: "Product",
      entityId: product.id,
      newValues: { name: product.name, sku: product.sku, price: Number(product.price) },
      userId: session.user.id,
      userName: session.user.name || undefined,
      notes: `تم إضافة منتج جديد: ${product.name}`,
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}
