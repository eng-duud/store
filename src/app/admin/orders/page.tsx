"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/hooks/use-settings";

interface AdminOrder {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  paymentMethod: string;
  createdAt: string;
  user: { name: string; email: string };
  items: { name: string; quantity: number }[];
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "تم التأكيد",
  PREPARING: "قيد التجهيز",
  SHIPPED: "تم الشحن",
  DELIVERED: "تم التوصيل",
  CANCELLED: "ملغي",
  RETURNED: "مرتجع",
};

const STATUS_OPTIONS = ["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const { formatCurrency } = useSettings();

  function fetchOrders(status?: string) {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    fetch(`/api/admin/orders?${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) { setOrders(d.data.items); setTotal(d.data.total); } })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { fetchOrders(); }, []);

  async function handleStatusChange(orderId: string, newStatus: string) {
    await fetch("/api/admin/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: newStatus }),
    });
    fetchOrders(statusFilter);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">الطلبات ({total})</h1>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setStatusFilter(""); fetchOrders(); }}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${!statusFilter ? "bg-primary text-primary-foreground shadow-sm" : "border bg-card shadow-card hover:bg-accent"}`}
        >
          الكل
        </button>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); fetchOrders(s); }}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${statusFilter === s ? "bg-primary text-primary-foreground shadow-sm" : "border bg-card shadow-card hover:bg-accent"}`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border bg-card p-4 h-20 shadow-card" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border bg-card p-16 text-center shadow-card">
          <p className="text-muted-foreground">لا توجد طلبات</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {orders.map((order) => (
            <div key={order.id} className="rounded-2xl border bg-card p-5 shadow-card transition-shadow duration-200 hover:shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold">{order.orderNumber}</p>
                    <span className="text-xs text-muted-foreground/50">
                      {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {order.user.name} — {order.items.length} منتج
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-bold">{formatCurrency(Number(order.total))}</p>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="rounded-xl border bg-background px-3 py-1.5 text-sm shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
