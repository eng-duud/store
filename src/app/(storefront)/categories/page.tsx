"use client";

import Link from "next/link";
import { useCategories } from "@/hooks/use-products";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="mb-10 text-3xl font-bold tracking-tight">الفئات</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse overflow-hidden rounded-2xl border bg-card shadow-card">
              <div className="aspect-video bg-muted" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-1/2 rounded-md bg-muted" />
                <div className="h-3 w-3/4 rounded-md bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat: { id: string; name: string; slug: string; description: string | null; _count: { products: number } }) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group overflow-hidden rounded-2xl border bg-card shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5"
            >
              <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground/20 transition-transform duration-300 group-hover:scale-110">
                  <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
                  <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
                </svg>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                  {cat.name}
                </h3>
                {cat.description && (
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground line-clamp-2">
                    {cat.description}
                  </p>
                )}
                <p className="mt-2 text-xs font-medium text-muted-foreground/60">
                  {cat._count.products} منتج
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-16 text-center shadow-card">
          <p className="text-muted-foreground">لا توجد فئات بعد</p>
        </div>
      )}
    </div>
  );
}
