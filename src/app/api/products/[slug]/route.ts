import { NextRequest, NextResponse } from "next/server";
import { getProductBySlug } from "@/services/product.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const product = await getProductBySlug(slug);

    if (!product) {
      return NextResponse.json(
        { success: false, error: "المنتج غير موجود" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء جلب المنتج" },
      { status: 500 }
    );
  }
}
