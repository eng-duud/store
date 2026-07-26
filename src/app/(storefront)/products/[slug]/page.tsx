"use client";

import { use } from "react";
import { useProduct } from "@/hooks/use-products";
import { useCartStore } from "@/hooks/use-cart";
import { useSettings } from "@/hooks/use-settings";
import { ProductDetailSkeleton } from "@/components/shared/skeletons";
import { toast } from "sonner";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: product, isLoading } = useProduct(slug);
  const addItem = useCartStore((s) => s.addItem);
  const { formatCurrency } = useSettings();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <ProductDetailSkeleton />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
        <h1 className="text-2xl font-bold">المنتج غير موجود</h1>
      </div>
    );
  }

  const displayPrice = product.salePrice
    ? Number(product.salePrice)
    : Number(product.price);
  const hasDiscount =
    product.salePrice && Number(product.salePrice) < Number(product.price);

  function handleAddToCart() {
    if (!product) return;
    addItem(product);
    toast.success("تمت الإضافة إلى السلة", {
      description: product.name,
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="space-y-3">
          <div className="aspect-square overflow-hidden rounded-2xl bg-muted shadow-card">
            {product.images[0]?.url ? (
              <img
                src={product.images[0].url}
                alt={product.images[0].altText || product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground/30">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2.5">
              {product.images.map((img, i) => (
                <div
                  key={img.id}
                  className="aspect-square overflow-hidden rounded-xl border bg-muted shadow-sm transition-shadow hover:shadow-card"
                >
                  <img
                    src={img.url}
                    alt={img.altText || `${product.name} ${i + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {product.brand && (
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60">
              {product.brand.name}
            </p>
          )}

          <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">{product.name}</h1>

          {product.categories.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {product.categories.map((pc) => pc.category.name).join(" / ")}
            </p>
          )}

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold tracking-tight">
              {formatCurrency(displayPrice)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-lg text-muted-foreground line-through">
                  {formatCurrency(Number(product.price))}
                </span>
                <span className="rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-bold text-destructive">
                  -
                  {Math.round(
                    ((Number(product.price) - Number(product.salePrice!)) /
                      Number(product.price)) *
                      100
                  )}
                  %
                </span>
              </>
            )}
          </div>

          {product.shortDescription && (
            <p className="text-sm leading-relaxed text-muted-foreground">{product.shortDescription}</p>
          )}

          <div>
            {product.stockQuantity > 0 ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                متوفر في المخزون ({product.stockQuantity} قطعة)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive">
                نفذ من المخزون
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stockQuantity <= 0}
            className="w-full rounded-2xl bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            أضف إلى السلة
          </button>

          {product.description && (
            <div className="border-t pt-6">
              <h2 className="mb-3 text-base font-bold">الوصف</h2>
              <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </div>
            </div>
          )}

          <div className="rounded-2xl border bg-surface p-5">
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <dt className="text-muted-foreground">رمز المنتج</dt>
              <dd className="font-medium">{product.sku}</dd>
              {product.brand && (
                <>
                  <dt className="text-muted-foreground">العلامة التجارية</dt>
                  <dd className="font-medium">{product.brand.name}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
