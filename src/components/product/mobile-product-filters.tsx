"use client";

import * as React from "react";
import { Sheet } from "@/components/ui/sheet";
import { ProductFilters } from "./product-filters";

interface MobileProductFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: { name: string; slug: string; _count: { products: number } }[];
  currentCategory?: string;
  currentSort?: string;
}

export function MobileProductFilters({
  open,
  onOpenChange,
  categories,
  currentCategory,
  currentSort,
}: MobileProductFiltersProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="تصفية وترتيب المنتجات" side="right">
      <div className="py-2">
        <ProductFilters
          categories={categories}
          currentCategory={currentCategory}
          currentSort={currentSort}
        />
      </div>
    </Sheet>
  );
}
