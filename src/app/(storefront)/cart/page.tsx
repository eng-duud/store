"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, totalItems, isHydrated } = useCart();
  const { formatCurrency } = useSettings();

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="h-8 w-48 rounded-xl bg-muted animate-pulse mb-8" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-2xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center lg:px-8 animate-fade-in">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-muted/60">
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
            className="text-muted-foreground/40"
          >
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
        </div>
        <h1 className="mb-3 text-2xl font-bold">سلة التسوق فارغة</h1>
        <p className="mb-8 text-muted-foreground">لم تقم بإضافة أي منتجات للسلة بعد</p>
        <Link href="/products">
          <Button size="lg" className="rounded-2xl px-8">
            تصفح المنتجات
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 animate-fade-in">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">
        سلة التسوق ({totalItems})
      </h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 sm:gap-6 rounded-2xl border bg-card p-4 sm:p-5 shadow-card transition-all duration-200 hover:shadow-elevated"
            >
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground/30">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                      <circle cx="9" cy="9" r="2" />
                      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-bold text-base transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => {
                        removeItem(item.id);
                        toast.info(`تم حذف "${item.name}" من السلة`);
                      }}
                      className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title="حذف"
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
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-1 text-sm font-bold text-primary">
                    {formatCurrency(item.price)}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 rounded-xl border bg-background p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-30"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-xs font-bold">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.maxQuantity}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-30"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-bold">
                    الإجمالي: {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border bg-card p-6 h-fit shadow-card lg:sticky lg:top-28">
          <h2 className="mb-5 text-base font-bold">ملخص الطلب</h2>
          <div className="space-y-3.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">المجموع الفرعي</span>
              <span className="font-semibold">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الشحن</span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                مجاني
              </span>
            </div>
            <div className="border-t pt-3.5">
              <div className="flex justify-between text-lg font-bold">
                <span>الإجمالي الكلي</span>
                <span className="text-primary">{formatCurrency(subtotal)}</span>
              </div>
            </div>
          </div>

          <Link href="/checkout" className="block mt-6">
            <Button size="lg" className="w-full text-base rounded-2xl">
              إتمام الطلب
            </Button>
          </Link>

          <Link href="/products" className="block mt-3 text-center">
            <Button variant="ghost" className="w-full text-sm">
              متابعة التسوق
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
