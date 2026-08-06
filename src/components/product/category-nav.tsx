"use client";

import * as React from "react";
import { useCategories } from "@/hooks/use-products";
import { cn } from "@/lib/utils";

interface CategoryNavProps {
  selectedCategorySlug?: string;
  selectedSubcategorySlug?: string;
  onSelectCategory?: (categorySlug?: string, subcategorySlug?: string) => void;
  onOpenMobileFilters?: () => void;
  className?: string;
}

export function CategoryNav({
  selectedCategorySlug,
  selectedSubcategorySlug,
  onSelectCategory,
  onOpenMobileFilters,
  className,
}: CategoryNavProps) {
  const { data: categories, isLoading } = useCategories();

  const rootCategories = React.useMemo(() => {
    if (!categories) return [];
    return categories.filter((cat: any) => !cat.parentId);
  }, [categories]);

  const activeCategory = React.useMemo(() => {
    if (!selectedCategorySlug || !categories) return null;
    return categories.find((cat: any) => cat.slug === selectedCategorySlug);
  }, [selectedCategorySlug, categories]);

  const subcategories = React.useMemo(() => {
    if (!activeCategory) return [];
    return activeCategory.children || [];
  }, [activeCategory]);

  if (isLoading) {
    return (
      <div className={cn("w-full py-6 space-y-4", className)}>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[90px] animate-pulse">
              <div className="h-16 w-16 rounded-full bg-muted shadow-sm" />
              <div className="h-3 w-14 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!rootCategories || rootCategories.length === 0) return null;

  return (
    <div className={cn("w-full py-4 space-y-5", className)}>
      <div className="relative">
        <div className="flex items-center gap-4 overflow-x-auto pb-3 pt-1 px-1 scrollbar-thin scroll-smooth">
          {/* Mobile Filter Button directly next to All Chip */}
          {onOpenMobileFilters && (
            <button
              onClick={onOpenMobileFilters}
              className="group flex flex-col items-center gap-2 min-w-[70px] cursor-pointer transition-all duration-300 focus:outline-none lg:hidden"
              title="تصفية وفلترة"
              aria-label="تصفية وفلترة"
            >
              <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 border-primary/40 bg-accent text-primary transition-all duration-300 shadow-sm hover:border-primary hover:scale-105">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-xs font-bold text-primary">تصفية</span>
                <span className="text-[10px] text-muted-foreground font-medium">خيارات</span>
              </div>
            </button>
          )}

          {/* "All" Categories Button */}
          <button
            onClick={() => onSelectCategory?.(undefined, undefined)}
            className={cn(
              "group flex flex-col items-center gap-2 min-w-[84px] sm:min-w-[96px] cursor-pointer transition-all duration-300 focus:outline-none",
              !selectedCategorySlug && "scale-105"
            )}
          >
            <div
              className={cn(
                "relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-sm group-hover:shadow-md",
                !selectedCategorySlug
                  ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg scale-105"
                  : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-accent"
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-transform duration-300 group-hover:scale-110"
              >
                <rect width="7" height="7" x="3" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="3" rx="1" />
                <rect width="7" height="7" x="14" y="14" rx="1" />
                <rect width="7" height="7" x="3" y="14" rx="1" />
              </svg>
            </div>
            <div className="flex flex-col items-center text-center">
              <span
                className={cn(
                  "text-xs font-bold transition-colors line-clamp-1",
                  !selectedCategorySlug ? "text-primary" : "text-foreground group-hover:text-primary"
                )}
              >
                الكل
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">جميع التشكيلات</span>
            </div>
          </button>

          {rootCategories.map((cat: any) => {
            const isSelected = selectedCategorySlug === cat.slug;
            const productCount = cat._count?.products || 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory?.(cat.slug, undefined)}
                className={cn(
                  "group flex flex-col items-center gap-2 min-w-[84px] sm:min-w-[96px] cursor-pointer transition-all duration-300 focus:outline-none",
                  isSelected && "scale-105"
                )}
              >
                <div
                  className={cn(
                    "relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full border-2 transition-all duration-300 shadow-sm group-hover:shadow-md overflow-hidden",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg scale-105"
                      : "border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-accent"
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-transform duration-300 group-hover:scale-110"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <line x1="3" x2="21" y1="6" y2="6" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                  {productCount > 0 && (
                    <span
                      className={cn(
                        "absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold shadow-sm",
                        isSelected
                          ? "bg-amber-500 text-white"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      {productCount}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center text-center">
                  <span
                    className={cn(
                      "text-xs font-bold transition-colors line-clamp-1",
                      isSelected ? "text-primary" : "text-foreground group-hover:text-primary"
                    )}
                  >
                    {cat.name}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {productCount} منتج
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Subcategory Chips Filter Bar */}
      {subcategories.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-2 px-1 scrollbar-thin animate-fade-in border-t border-border/60">
          <span className="text-xs font-semibold text-muted-foreground whitespace-nowrap ml-2">
            التصنيفات الفرعية:
          </span>
          <button
            onClick={() => onSelectCategory?.(selectedCategorySlug, undefined)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 shadow-sm border cursor-pointer",
              !selectedSubcategorySlug
                ? "bg-primary text-primary-foreground border-primary shadow-md"
                : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground"
            )}
          >
            الكل في {activeCategory?.name}
          </button>
          {subcategories.map((sub: any) => {
            const isSubSelected = selectedSubcategorySlug === sub.slug;
            return (
              <button
                key={sub.id}
                onClick={() => onSelectCategory?.(selectedCategorySlug, sub.slug)}
                className={cn(
                  "rounded-full px-4 py-1.5 text-xs font-bold transition-all duration-200 shadow-sm border whitespace-nowrap cursor-pointer",
                  isSubSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-md"
                    : "bg-card text-muted-foreground border-border hover:bg-accent hover:text-foreground"
                )}
              >
                {sub.name}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
