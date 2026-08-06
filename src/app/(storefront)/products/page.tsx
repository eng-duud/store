"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { ProductCard } from "@/components/product/product-card";
import { SearchBar } from "@/components/product/search-bar";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductGridSkeleton } from "@/components/shared/skeletons";
import { Pagination } from "@/components/shared/pagination";
import { useProducts, useCategories } from "@/hooks/use-products";

import { MobileProductFilters } from "@/components/product/mobile-product-filters";
import { CategoryNav } from "@/components/product/category-nav";
import { useRouter } from "next/navigation";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const currentSearch = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || undefined;
  const currentSubcategory = searchParams.get("sub") || undefined;
  const currentSort = searchParams.get("sort") || undefined;
  const currentPage = Number(searchParams.get("page")) || 1;

  const activeCategoryFilter = currentSubcategory || currentCategory;

  const { data: productsData, isLoading } = useProducts({
    search: currentSearch,
    categorySlug: activeCategoryFilter,
    sort: currentSort as "price_asc" | "price_desc" | "newest" | "name_asc" | undefined,
    page: currentPage,
    limit: 12,
  });

  const { data: categories } = useCategories();

  const searchParamObj: Record<string, string> = {};
  if (currentSearch) searchParamObj.q = currentSearch;
  if (currentCategory) searchParamObj.category = currentCategory;
  if (currentSubcategory) searchParamObj.sub = currentSubcategory;
  if (currentSort) searchParamObj.sort = currentSort;

  const handleSelectCategory = (catSlug?: string, subSlug?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (catSlug) {
      params.set("category", catSlug);
    } else {
      params.delete("category");
    }
    if (subSlug) {
      params.set("sub", subSlug);
    } else {
      params.delete("sub");
    }
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      {/* Header & Search */}
      <div className="mb-6">
        <h1 className="mb-4 text-3xl font-bold tracking-tight">معرض المنتجات</h1>
        <SearchBar defaultValue={currentSearch} />
      </div>

      {/* Top Category Nav with Filter Icon Button */}
      <div className="mb-8">
        <CategoryNav
          selectedCategorySlug={currentCategory}
          selectedSubcategorySlug={currentSubcategory}
          onSelectCategory={handleSelectCategory}
          onOpenMobileFilters={() => setMobileFilterOpen(true)}
        />
      </div>

      {/* Mobile Filter Sheet Drawer */}
      <MobileProductFilters
        open={mobileFilterOpen}
        onOpenChange={setMobileFilterOpen}
        categories={categories || []}
        currentCategory={currentCategory}
        currentSort={currentSort}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        {/* Desktop Sidebar Filters */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border bg-card p-5 shadow-card">
            <ProductFilters
              categories={categories || []}
              currentCategory={currentCategory}
              currentSort={currentSort}
            />
          </div>
        </aside>

        <div>
          {currentSearch && (
            <p className="mb-5 text-sm text-muted-foreground">
              نتائج البحث عن &quot;{currentSearch}&quot;
              {productsData && (
                <span className="font-semibold"> — {productsData.total} نتيجة</span>
              )}
            </p>
          )}

          {isLoading ? (
            <ProductGridSkeleton />
          ) : productsData && productsData.items.length > 0 ? (
            <>
              {/* Clean 2-column mobile grid & 3-column desktop grid */}
              <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {productsData.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-12">
                <Pagination
                  currentPage={productsData.page}
                  totalPages={productsData.totalPages}
                  basePath="/products"
                  searchParams={searchParamObj}
                />
              </div>
            </>
          ) : (
            <div className="rounded-2xl border bg-card p-16 text-center shadow-card">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/30">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.3-4.3"/>
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-bold">لا توجد منتجات</h3>
              <p className="text-sm text-muted-foreground">لم نتمكن من العثور على منتجات تطابق نتائجك</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 lg:px-8"><ProductGridSkeleton /></div>}>
      <ProductsContent />
    </Suspense>
  );
}
