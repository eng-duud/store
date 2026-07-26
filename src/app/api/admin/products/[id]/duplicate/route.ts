import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { duplicateProduct } from "@/services/product.service";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const duplicated = await duplicateProduct(id);

    return NextResponse.json({
      success: true,
      message: "تم تكرار المنتج بنجاح!",
      data: duplicated,
    });
  } catch (error) {
    console.error("Error duplicating product:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء نسخ المنتج" },
      { status: 500 }
    );
  }
}
