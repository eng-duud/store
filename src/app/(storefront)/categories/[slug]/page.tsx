"use client";

import { use } from "react";
import Link from "next/link";
import { useCategory } from "@/hooks/use-products";
import { useProducts } from "@/hooks/use-products";
import { ProductCard } from "@/components/product/product-card";
import { ProductGridSkeleton } from "@/components/shared/skeletons";
import { Pagination } from "@/components/shared/pagination";
import { useSearchParams } from "next/navigation";

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: category, isLoading: categoryLoading } = useCategory(slug);
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const { data: productsData, isLoading: productsLoading } = useProducts({
    categorySlug: slug,
    page: currentPage,
    limit: 12,
  });

  if (categoryLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-10">
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        </div>
        <ProductGridSkeleton />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
        <h1 className="text-2xl font-bold">الفئة غير موجودة</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">الرئيسية</Link>
        <span className="text-muted-foreground/40">/</span>
        <Link href="/categories" className="transition-colors hover:text-foreground">الفئات</Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-medium text-foreground">{category.name}</span>
      </nav>

      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-muted-foreground leading-relaxed">{category.description}</p>
        )}
        {productsData && (
          <p className="mt-1.5 text-sm text-muted-foreground/70">
            {productsData.total} منتج
          </p>
        )}
      </div>

      {category.children && category.children.length > 0 && (
        <div className="mb-10">
          <h2 className="mb-4 text-base font-bold">الفئات الفرعية</h2>
          <div className="flex flex-wrap gap-2">
            {category.children.map((child: { id: string; name: string; slug: string; _count: { products: number } }) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="rounded-xl border bg-card px-4 py-2 text-sm font-medium shadow-card transition-all duration-200 hover:shadow-sm hover:bg-accent"
              >
                {child.name}
                <span className="mr-1.5 text-xs text-muted-foreground/50">
                  ({child._count.products})
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {productsLoading ? (
        <ProductGridSkeleton />
      ) : productsData && productsData.items.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {productsData.items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-10">
            <Pagination
              currentPage={productsData.page}
              totalPages={productsData.totalPages}
              basePath={`/categories/${slug}`}
            />
          </div>
        </>
      ) : (
        <div className="rounded-2xl border bg-card p-16 text-center shadow-card">
          <p className="text-muted-foreground">لا توجد منتجات في هذه الفئة</p>
        </div>
      )}
    </div>
  );
}
