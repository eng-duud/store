"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ProductCard } from "@/components/product/product-card";
import { SearchBar } from "@/components/product/search-bar";
import { ProductFilters } from "@/components/product/product-filters";
import { ProductGridSkeleton } from "@/components/shared/skeletons";
import { Pagination } from "@/components/shared/pagination";
import { useProducts, useCategories } from "@/hooks/use-products";

function ProductsContent() {
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || undefined;
  const currentSort = searchParams.get("sort") || undefined;
  const currentPage = Number(searchParams.get("page")) || 1;

  const { data: productsData, isLoading } = useProducts({
    search: currentSearch,
    categorySlug: currentCategory,
    sort: currentSort as "price_asc" | "price_desc" | "newest" | "name_asc" | undefined,
    page: currentPage,
    limit: 12,
  });

  const { data: categories } = useCategories();

  const searchParamObj: Record<string, string> = {};
  if (currentSearch) searchParamObj.q = currentSearch;
  if (currentCategory) searchParamObj.category = currentCategory;
  if (currentSort) searchParamObj.sort = currentSort;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-10">
        <h1 className="mb-5 text-3xl font-bold tracking-tight">المنتجات</h1>
        <SearchBar defaultValue={currentSearch} />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <ProductFilters
            categories={categories || []}
            currentCategory={currentCategory}
            currentSort={currentSort}
          />
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
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {productsData.items.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <div className="mt-10">
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
              <p className="text-sm text-muted-foreground">لم نتمكن من العثور على منتجات تطابق بحثك</p>
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
