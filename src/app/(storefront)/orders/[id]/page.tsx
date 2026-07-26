"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useSettings } from "@/hooks/use-settings";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "تم التأكيد",
  PREPARING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
  RETURNED: "مرتجع",
};

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  notes: string | null;
  shippingAddress: { label: string; street: string; city: string; state: string; zipCode: string; country: string };
  items: { id: string; name: string; price: number; quantity: number; product?: { images: { url: string }[] } }[];
  timeline: { id: string; status: string; note: string | null; createdAt: string }[];
  createdAt: string;
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { formatCurrency } = useSettings();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setOrder(data.data);
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded-md bg-muted" />
          <div className="h-64 rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center lg:px-8">
        <h1 className="text-2xl font-bold">الطلب غير موجود</h1>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/orders" className="transition-colors hover:text-foreground">طلباتي</Link>
        <span className="text-muted-foreground/40">/</span>
        <span className="font-medium text-foreground">{order.orderNumber}</span>
      </nav>

      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{order.orderNumber}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString("ar-SA")}
          </p>
        </div>
        <span className="inline-flex w-fit rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
          {STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="mb-5 font-bold">المنتجات</h2>
            <div className="divide-y divide-border/50">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
                    {item.product?.images[0]?.url && (
                      <img src={item.product.images[0].url} alt={item.name} className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-muted-foreground">الكمية: {item.quantity}</p>
                  </div>
                  <p className="font-bold">{formatCurrency(Number(item.price) * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="mb-5 font-bold">تتبع الطلب</h2>
            <div className="relative space-y-4">
              {order.timeline.map((event, i) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`h-3 w-3 rounded-full ${i === 0 ? "bg-primary shadow-sm shadow-primary/30" : "bg-muted"}`} />
                    {i < order.timeline.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                  </div>
                  <div className="pb-4">
                    <p className="font-semibold">{STATUS_LABELS[event.status] || event.status}</p>
                    {event.note && <p className="mt-0.5 text-sm text-muted-foreground">{event.note}</p>}
                    <p className="mt-0.5 text-xs text-muted-foreground/60">
                      {new Date(event.createdAt).toLocaleDateString("ar-SA")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="mb-5 font-bold">ملخص الطلب</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-medium">{formatCurrency(Number(order.subtotal))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الشحن</span>
                <span className="font-medium">{formatCurrency(Number(order.shippingCost))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">الضريبة</span>
                <span className="font-medium">{formatCurrency(Number(order.tax))}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span>{formatCurrency(Number(order.total))}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="mb-4 font-bold">عنوان التوصيل</h2>
            <p className="text-sm font-medium">{order.shippingAddress.label}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state}
            </p>
          </div>

          <div className="rounded-2xl border bg-card p-6 shadow-card">
            <h2 className="mb-4 font-bold">طريقة الدفع</h2>
            <p className="text-sm font-medium">
              {order.paymentMethod === "CASH_ON_DELIVERY" ? "الدفع عند الاستلام" : "تحويل بنكي"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
