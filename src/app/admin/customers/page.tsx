"use client";

import { useEffect, useState } from "react";
import { useSettings } from "@/hooks/use-settings";

interface AdminCustomer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
  orders: { total: number; status: string }[];
}

export default function AdminCustomersPage() {
  const { formatCurrency } = useSettings();
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  function fetchCustomers(q?: string) {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    fetch(`/api/admin/customers?${params}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) { setCustomers(d.data.items); setTotal(d.data.total); } })
      .finally(() => setIsLoading(false));
  }

  useEffect(() => { fetchCustomers(); }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">العملاء ({total})</h1>

      <form onSubmit={(e) => { e.preventDefault(); fetchCustomers(search); }} className="flex gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو البريد..."
          className="h-11 flex-1 rounded-xl border border-input bg-card px-4 text-sm shadow-card transition-all duration-200 placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 hover:border-ring/50"
        />
        <button type="submit" className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98]">
          بحث
        </button>
      </form>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border bg-card p-4 h-16 shadow-card" />
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="rounded-2xl border bg-card p-16 text-center shadow-card">
          <p className="text-muted-foreground">لا يوجد عملاء</p>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card overflow-x-auto shadow-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-surface">
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">العميل</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">الهاتف</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">الطلبات</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">آخر طلب</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">الحالة</th>
                <th className="px-5 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground/60">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {customers.map((customer) => (
                <tr key={customer.id} className="transition-colors hover:bg-accent/30">
                  <td className="px-5 py-3.5">
                    <div>
                      <p className="font-semibold">{customer.name}</p>
                      <p className="text-xs text-muted-foreground/60">{customer.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground/70">{customer.phone || "—"}</td>
                  <td className="px-5 py-3.5 font-medium">{customer._count.orders}</td>
                  <td className="px-5 py-3.5 text-muted-foreground/70 font-medium">
                    {customer.orders[0]
                      ? formatCurrency(Number(customer.orders[0].total))
                      : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${customer.isActive ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
                      {customer.isActive ? "نشط" : "غير نشط"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground/70">
                    {new Date(customer.createdAt).toLocaleDateString("ar-SA")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
