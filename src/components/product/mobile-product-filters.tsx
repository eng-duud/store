"use client";

import * as React from "react";
import { Sheet } from "@/components/ui/sheet";
import { ProductFilters } from "./product-filters";
import { Button } from "@/components/ui/button";

interface MobileProductFiltersProps {
  categories: { name: string; slug: string; _count: { products: number } }[];
  currentCategory?: string;
  currentSort?: string;
}

export function MobileProductFilters({
  categories,
  currentCategory,
  currentSort,
}: MobileProductFiltersProps) {
  const [open, setOpen] = React.useState(false);

  const activeFiltersCount = (currentCategory ? 1 : 0) + (currentSort && currentSort !== "newest" ? 1 : 0);

  return (
    <>
      {/* Floating Bottom Mobile Filter Trigger Button */}
      <div className="fixed bottom-6 right-1/2 translate-x-1/2 z-40 lg:hidden">
        <Button
          onClick={() => setOpen(true)}
          size="lg"
          className="rounded-full shadow-elevated border border-primary/30 px-6 py-3 font-bold flex items-center gap-2 text-sm bg-primary text-primary-foreground backdrop-blur-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          <span>تصفية وترتيب المنتجات</span>
          {activeFiltersCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-extrabold">
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Mobile Sheet Drawer */}
      <Sheet open={open} onOpenChange={setOpen} title="تصفية وترتيب المنتجات" side="right">
        <div className="py-2">
          <ProductFilters
            categories={categories}
            currentCategory={currentCategory}
            currentSort={currentSort}
          />
        </div>
      </Sheet>
    </>
  );
}
