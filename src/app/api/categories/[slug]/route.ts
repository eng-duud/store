import { NextRequest, NextResponse } from "next/server";
import { getCategoryBySlug } from "@/services/category.service";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const category = await getCategoryBySlug(slug);

    if (!category) {
      return NextResponse.json(
        { success: false, error: "الفئة غير موجودة" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء جلب الفئة" },
      { status: 500 }
    );
  }
}
