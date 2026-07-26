"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface ProductFiltersProps {
  categories: { name: string; slug: string; _count: { products: number } }[];
  currentCategory?: string;
  currentSort?: string;
}

const SORT_OPTIONS = [
  { value: "newest", label: "الأحدث" },
  { value: "price_asc", label: "السعر: من الأقل" },
  { value: "price_desc", label: "السعر: من الأعلى" },
  { value: "name_asc", label: "الاسم" },
];

export function ProductFilters({
  categories,
  currentCategory,
  currentSort,
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    router.push(`/products?${params.toString()}`);
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">ترتيب حسب</h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => updateFilter("sort", option.value === "newest" ? null : option.value)}
              className={`block w-full text-right rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                (currentSort || "newest") === option.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground/70">الفئات</h3>
        <div className="space-y-1">
          <button
            onClick={() => updateFilter("category", null)}
            className={`block w-full text-right rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
              !currentCategory
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            جميع الفئات
          </button>
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => updateFilter("category", cat.slug)}
              className={`block w-full text-right rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200 ${
                currentCategory === cat.slug
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {cat.name}
              <span className="mr-1.5 text-xs opacity-50">({cat._count.products})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
