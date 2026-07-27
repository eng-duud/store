import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { getAdminProducts, createProduct } from "@/services/product.service";
import { createAuditLog } from "@/services/audit.service";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = request.nextUrl;

    const result = await getAdminProducts({
      search: searchParams.get("q") || undefined,
      status: searchParams.get("status") || undefined,
      page: Number(searchParams.get("page")) || 1,
      limit: 20,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    console.error("Error:", error);
    return NextResponse.json({ success: false, error: "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    const body = await request.json();

    if (!body.name || !body.sku || body.price === undefined) {
      return NextResponse.json(
        { success: false, error: "يرجى تعبئة جميع الحقول المطلوبة (الاسم، الرمز، السعر)" },
        { status: 400 }
      );
    }

    const product = await createProduct({
      name: body.name,
      sku: body.sku,
      price: Number(body.price),
      salePrice: body.salePrice ? Number(body.salePrice) : null,
      stockQuantity: Number(body.stockQuantity) || 0,
      description: body.description || undefined,
      shortDescription: body.shortDescription || undefined,
      status: body.status || "ACTIVE",
      isFeatured: Boolean(body.isFeatured),
      categoryIds: Array.isArray(body.categoryIds) ? body.categoryIds : [],
      images: Array.isArray(body.images) && body.images.length > 0
        ? body.images.map((img: any) => ({
            url: typeof img === "string" ? img : img.url,
            publicId: typeof img === "object" ? img.publicId || undefined : undefined,
          }))
        : Array.isArray(body.imageUrls) ? body.imageUrls : [],
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
    return NextResponse.json({ success: false, error: "حدث خطأ أثناء إضافة المنتج" }, { status: 500 });
  }
}
