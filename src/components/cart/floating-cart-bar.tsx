"use client";

import * as React from "react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { useSettings } from "@/hooks/use-settings";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function FloatingCartBar() {
  const { items, totalItems, subtotal, isHydrated, updateQuantity, removeItem } = useCart();
  const { formatCurrency } = useSettings();
  const [open, setOpen] = React.useState(false);
  const [animatePulse, setAnimatePulse] = React.useState(false);

  // Trigger smooth pulse micro-animation when items are added
  React.useEffect(() => {
    if (totalItems > 0) {
      setAnimatePulse(true);
      const timer = setTimeout(() => setAnimatePulse(false), 400);
      return () => clearTimeout(timer);
    }
  }, [totalItems]);

  if (!isHydrated || totalItems === 0) return null;

  return (
    <>
      {/* Floating Bottom Smooth Animated Cart Bar */}
      <div className="fixed bottom-5 right-1/2 translate-x-1/2 z-50 w-[92%] max-w-lg">
        <div
          onClick={() => setOpen(true)}
          className={`group flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/95 text-primary-foreground p-3.5 shadow-elevated backdrop-blur-xl transition-all duration-300 cursor-pointer hover:bg-primary hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] ${
            animatePulse ? "scale-105 ring-4 ring-primary/40" : ""
          }`}
        >
          {/* Cart Icon & Count */}
          <div className="flex items-center gap-3">
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white shadow-inner">
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
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              <span className="absolute -top-1.5 -right-1.5 flex h-5.5 min-w-[22px] items-center justify-center rounded-full bg-accent px-1 text-xs font-black text-accent-foreground shadow-md animate-bounce">
                {totalItems}
              </span>
            </div>

            <div className="flex flex-col text-right">
              <span className="text-xs font-medium text-white/80">سلة التسوق</span>
              <span className="text-sm font-black tracking-tight text-white">
                {formatCurrency(subtotal)}
              </span>
            </div>
          </div>

          {/* Quick Preview Button */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold bg-white/20 hover:bg-white/30 text-white px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm">
              <span>عرض السلة</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Quick Cart Sheet Drawer */}
      <Sheet open={open} onOpenChange={setOpen} title={`سلة التسوق (${totalItems} منتجات)`} side="bottom">
        <div className="py-2 space-y-4 max-h-[75vh] flex flex-col">
          {/* Cart Items List */}
          <div className="overflow-y-auto space-y-3 pr-1 max-h-[45vh] scrollbar-thin">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-sm transition-all hover:border-primary/40"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-14 w-14 rounded-lg border bg-muted overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground/30 text-xs">
                        لا صورة
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold truncate text-foreground">{item.name}</h4>
                    <p className="text-xs font-semibold text-primary mt-0.5">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Remove */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center rounded-lg border bg-background p-0.5">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                    >
                      -
                    </button>
                    <span className="w-6 text-center text-xs font-extrabold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-7 w-7 rounded-md flex items-center justify-center text-xs font-bold text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="h-8 w-8 rounded-lg flex items-center justify-center text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                    title="حذف"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
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
              </div>
            ))}
          </div>

          {/* Subtotal & Action Buttons */}
          <div className="border-t pt-3 space-y-3 bg-background">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-muted-foreground">الإجمالي الفرعي:</span>
              <span className="font-black text-lg text-primary">{formatCurrency(subtotal)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Link href="/cart" onClick={() => setOpen(false)}>
                <Button variant="outline" className="w-full rounded-xl font-bold text-xs py-2.5">
                  عرض السلة الكاملة
                </Button>
              </Link>
              <Link href="/checkout" onClick={() => setOpen(false)}>
                <Button className="w-full rounded-xl font-extrabold text-xs py-2.5 shadow-md">
                  إتمام الشراء والدفع &rarr;
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Sheet>
    </>
  );
}
