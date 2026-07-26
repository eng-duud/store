"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, isHydrated } = useCart();
  const { settings, formatCurrency, isLoading: settingsLoading } = useSettings();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH_ON_DELIVERY");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

  useEffect(() => {
    fetch("/api/addresses")
      .then((r) => r.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setAddresses(data.data);
          const defaultAddr = data.data.find((a: Address) => a.isDefault) || data.data[0];
          if (defaultAddr) {
            setSelectedAddress(defaultAddr.id);
          }
        }
      })
      .catch(() => toast.error("فشل في تحميل العناوين"))
      .finally(() => setIsLoadingAddresses(false));
  }, []);

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="h-8 w-48 rounded-xl bg-muted animate-pulse mb-8" />
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
          <div className="h-96 rounded-2xl bg-muted animate-pulse" />
          <div className="h-96 rounded-2xl bg-muted animate-pulse" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center lg:px-8 animate-fade-in">
        <h1 className="mb-4 text-2xl font-bold">سلة التسوق فارغة</h1>
        <p className="mb-8 text-muted-foreground">أضف بعض المنتجات لسلتك قبل إتمام الطلب</p>
        <Link href="/products">
          <Button size="lg" className="rounded-2xl px-8">
            تصفح المنتجات
          </Button>
        </Link>
      </div>
    );
  }

  const taxPercentage = parseFloat(settings.taxPercentage) || 0;
  const shippingCost = 0;
  const tax = subtotal * (taxPercentage / 100);
  const total = subtotal + shippingCost + tax;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedAddress) {
      toast.error("يرجى اختيار عنوان التوصيل لمتابعة الطلب");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: selectedAddress,
          paymentMethod,
          notes,
          cartItems: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        clearCart();
        toast.success("تم تأكيد الطلب بنجاح!");
        router.push(`/orders/${data.data.id}`);
      } else {
        toast.error(data.error || "حدث خطأ أثناء إنشاء الطلب");
      }
    } catch {
      toast.error("حدث خطأ غير متوقع أثناء إنشاء الطلب");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8 animate-fade-in">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">إتمام الشراء والطلب</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px]">
          <div className="space-y-6">
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">عنوان التوصيل</h2>
                <Link
                  href="/account/addresses"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  + إدارة العناوين
                </Link>
              </div>

              {isLoadingAddresses ? (
                <div className="space-y-2">
                  <div className="h-16 rounded-xl bg-muted animate-pulse" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="py-6 text-center border border-dashed rounded-xl bg-background">
                  <p className="mb-3 text-sm text-muted-foreground">لم تقم بإضافة عنوان توصيل بعد</p>
                  <Link href="/account/addresses">
                    <Button variant="outline" size="sm">
                      + إضافة عنوان جديد
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-all duration-200 ${
                        selectedAddress === addr.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                          : "hover:bg-accent/50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={(e) => setSelectedAddress(e.target.value)}
                        className="mt-1 accent-primary"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm">{addr.label}</p>
                          {addr.isDefault && (
                            <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-md">
                              افتراضي
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {addr.street}، {addr.city}، {addr.state} ({addr.country})
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <h2 className="mb-5 text-lg font-bold">طريقة الدفع</h2>
              <div className="space-y-3">
                <label
                  className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition-all duration-200 ${
                    paymentMethod === "CASH_ON_DELIVERY"
                      ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="CASH_ON_DELIVERY"
                    checked={paymentMethod === "CASH_ON_DELIVERY"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-primary"
                  />
                  <div>
                    <p className="font-bold text-sm">الدفع عند الاستلام</p>
                    <p className="text-xs text-muted-foreground">ادفع نقداً أو بالبطاقة عند وصول المندوب</p>
                  </div>
                </label>

                <label
                  className={`flex cursor-pointer items-center gap-3.5 rounded-xl border p-4 transition-all duration-200 ${
                    paymentMethod === "BANK_TRANSFER"
                      ? "border-primary bg-primary/5 ring-1 ring-primary shadow-sm"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="BANK_TRANSFER"
                    checked={paymentMethod === "BANK_TRANSFER"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="accent-primary"
                  />
                  <div>
                    <p className="font-bold text-sm">تحويل بنكي مباشر</p>
                    <p className="text-xs text-muted-foreground">قم بنقل المبلغ لحسابنا المالي وتأكيد الطلب</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <h2 className="mb-4 text-lg font-bold">ملاحظات إضافية</h2>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف أي تعليمات خاصة بالتوصيل أو التغليف (اختياري)"
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                rows={3}
              />
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 h-fit shadow-card lg:sticky lg:top-28">
            <h2 className="mb-4 text-lg font-bold">ملخص المنتجات</h2>
            <div className="space-y-3 max-h-56 overflow-y-auto border-b pb-4 pr-1 scrollbar-thin">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs bg-muted px-2 py-0.5 rounded-md">
                      {item.quantity}x
                    </span>
                    <span className="line-clamp-1 text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-bold text-xs">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-3 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">رسوم الشحن</span>
                <span className="font-semibold">{formatCurrency(shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الضريبة ({taxPercentage}%)</span>
                <span className="font-semibold">{formatCurrency(tax)}</span>
              </div>

              <div className="border-t pt-3.5">
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي الكلي</span>
                  <span className="text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              isLoading={isSubmitting}
              disabled={!selectedAddress}
              className="mt-6 w-full text-base rounded-2xl"
            >
              تأكيد الطلب الآن
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
