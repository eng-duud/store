"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSettings } from "@/hooks/use-settings";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200",
  CONFIRMED: "bg-blue-50 text-blue-700 border-blue-200",
  PREPARING: "bg-purple-50 text-purple-700 border-purple-200",
  SHIPPED: "bg-indigo-50 text-indigo-700 border-indigo-200",
  DELIVERED: "bg-green-50 text-green-700 border-green-200",
  CANCELLED: "bg-red-50 text-red-700 border-red-200",
  RETURNED: "bg-gray-50 text-gray-700 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "تم التأكيد",
  PREPARING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
  RETURNED: "مرتجع",
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page")) || 1;
  const { formatCurrency } = useSettings();
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/orders?page=${page}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setOrders(data.data.items);
          setTotal(data.data.total);
          setTotalPages(data.data.totalPages);
        }
      })
      .finally(() => setIsLoading(false));
  }, [page]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <h1 className="mb-10 text-3xl font-bold tracking-tight">طلباتي</h1>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border bg-card p-6 shadow-card">
              <div className="h-4 w-1/3 rounded-md bg-muted mb-3" />
              <div className="h-3 w-1/2 rounded-md bg-muted" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border bg-card p-16 text-center shadow-card">
          <p className="mb-4 text-muted-foreground">لا توجد طلبات بعد</p>
          <Link
            href="/products"
            className="inline-flex rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md"
          >
            تصفح المنتجات
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{total} طلب</p>
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block rounded-2xl border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-hover hover:-translate-y-0.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{order.orderNumber}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("ar-SA")} —{" "}
                    {order.items.length} منتج
                  </p>
                </div>
                <div className="text-left">
                  <span
                    className={`inline-block rounded-full border px-3 py-1 text-xs font-semibold ${
                      STATUS_COLORS[order.status] || "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                  <p className="mt-1.5 font-bold">
                    {formatCurrency(order.total)}
                  </p>
                </div>
              </div>
            </Link>
          ))}

          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 pt-6">
              {Array.from({ length: totalPages }, (_, i) => (
                <Link
                  key={i + 1}
                  href={`/orders?page=${i + 1}`}
                  className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                    page === i + 1
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "border bg-card shadow-card hover:shadow-sm hover:bg-accent"
                  }`}
                >
                  {i + 1}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10 lg:px-8"><div className="space-y-3">{Array.from({length:3}).map((_,i)=><div key={i} className="animate-pulse rounded-2xl border bg-card p-6 h-24 shadow-card"/>)}</div></div>}>
      <OrdersContent />
    </Suspense>
  );
}
