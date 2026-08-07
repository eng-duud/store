"use client";

import { useCart } from "@/hooks/use-cart";
import { useSettings } from "@/hooks/use-settings";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function CartSidebar() {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, clearCart, subtotal, isHydrated } = useCart();
  const { formatCurrency } = useSettings();

  if (!isHydrated || !isCartOpen) return null;

  return (
    <>
      {/* Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Sidebar Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col transform transition-transform animate-slide-in-right"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <ShoppingBag className="w-5 h-5 text-primary" />
            سلة الطلبات
          </h2>
          <div className="flex items-center gap-2">
            {cartItems.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("هل أنت متأكد من إفراغ السلة؟")) {
                    clearCart();
                  }
                }}
                className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                إفراغ السلة
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 py-12">
              <ShoppingBag className="w-16 h-16 mb-4 opacity-40 text-primary" />
              <p className="font-bold text-slate-700 dark:text-slate-300">السلة فارغة حالياً</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-4 text-primary font-bold text-sm hover:underline cursor-pointer"
              >
                تصفح المنتجات
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 transition-all hover:border-primary/40 shadow-sm"
              >
                <div className="w-20 h-20 relative bg-white dark:bg-slate-900 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill className="object-cover p-1" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                      لا صورة
                    </div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-xs font-black text-primary mt-1">
                        {formatCurrency(item.price)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-600 p-1.5 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-black w-5 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-primary hover:text-white transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-xs font-black text-slate-700 dark:text-slate-300">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Action */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-500 dark:text-slate-400">الإجمالي الفرعي:</span>
              <span className="font-black text-xl text-primary">{formatCurrency(subtotal)}</span>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="w-full py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl font-bold text-sm flex items-center justify-center transition-all shadow-lg gap-2 cursor-pointer active:scale-[0.98]"
            >
              إتمام الطلب والدفع &rarr;
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
