import { NextRequest, NextResponse } from "next/server";
import { getCategoryTree, getCategoryBySlug } from "@/services/category.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const slug = searchParams.get("slug");

    if (slug) {
      const category = await getCategoryBySlug(slug);
      if (!category) {
        return NextResponse.json(
          { success: false, error: "الفئة غير موجودة" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, data: category });
    }

    const tree = await getCategoryTree();
    return NextResponse.json({ success: true, data: tree });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء جلب الفئات" },
      { status: 500 }
    );
  }
}
