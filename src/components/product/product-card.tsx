"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { useCartStore } from "@/hooks/use-cart";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { formatCurrency } = useSettings();

  const displayPrice = product.salePrice
    ? Number(product.salePrice)
    : Number(product.price);
  const hasDiscount = product.salePrice && Number(product.salePrice) < Number(product.price);
  const imageUrl = product.images?.[0]?.url || "";
  const isOutOfStock = product.stockQuantity <= 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addItem(product, null, 1);
    toast.success(`تمت إضافة "${product.name}" إلى السلة`);
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-1",
        className
      )}
    >
      <Link href={`/products/${product.slug}`} className="relative aspect-square overflow-hidden bg-muted block">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.images?.[0]?.altText || product.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/40">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-10">
          {hasDiscount && (
            <Badge variant="destructive" className="shadow-sm font-bold">
              -{Math.round(((Number(product.price) - Number(product.salePrice)) / Number(product.price)) * 100)}%
            </Badge>
          )}
        </div>

        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.isFeatured && (
            <Badge
              variant="warning"
              className="shadow-sm font-bold flex items-center gap-1 bg-amber-500 text-white border-amber-600 px-2 py-0.5 text-[10px]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
                stroke="none"
              >
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>مميز</span>
            </Badge>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.brand && (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
            {product.brand.name}
          </p>
        )}

        <Link href={`/products/${product.slug}`}>
          <h3 className="mb-1.5 line-clamp-1 text-sm font-bold transition-colors duration-200 hover:text-primary">
            {product.name}
          </h3>
        </Link>

        {product.shortDescription && (
          <p className="mb-3 line-clamp-1 text-xs text-muted-foreground leading-relaxed">
            {product.shortDescription}
          </p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-between gap-2 border-t border-border/40">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold tracking-tight text-foreground">
                {formatCurrency(displayPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatCurrency(Number(product.price))}
                </span>
              )}
            </div>
            {isOutOfStock && (
              <p className="text-[11px] font-semibold text-destructive mt-0.5">نفدت الكمية</p>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="إضافة للسلة"
            aria-label="إضافة للسلة"
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
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
