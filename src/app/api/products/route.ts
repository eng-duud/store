import { NextRequest, NextResponse } from "next/server";
import { getProducts } from "@/services/product.service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const filters = {
      search: searchParams.get("q") || undefined,
      categorySlug: searchParams.get("category") || undefined,
      minPrice: searchParams.get("minPrice")
        ? Number(searchParams.get("minPrice"))
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? Number(searchParams.get("maxPrice"))
        : undefined,
      sort: (searchParams.get("sort") as
        | "price_asc"
        | "price_desc"
        | "newest"
        | "name_asc") || undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 12,
      isFeatured: searchParams.get("featured") === "true",
    };

    const result = await getProducts(filters);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء جلب المنتجات" },
      { status: 500 }
    );
  }
}
