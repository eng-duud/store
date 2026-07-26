"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/hooks/use-settings";

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  recentOrders: { id: string; orderNumber: string; status: string; total: number; createdAt: string; user: { name: string } }[];
  lowStockProducts: { id: string; name: string; stockQuantity: number }[];
  revenueChartData: { month: string; revenue: number; orders: number }[];
}

const STATUS_VARIANTS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  PENDING: { label: "قيد الانتظار", variant: "warning" },
  CONFIRMED: { label: "تم التأكيد", variant: "info" },
  PREPARING: { label: "قيد التجهيز", variant: "info" },
  SHIPPED: { label: "تم الشحن", variant: "secondary" },
  DELIVERED: { label: "تم التوصيل", variant: "success" },
  CANCELLED: { label: "ملغي", variant: "destructive" },
  RETURNED: { label: "مرتجع", variant: "outline" },
};

interface WidgetConfig {
  id: string;
  title: string;
  enabled: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: "stats", title: "بطاقات الإحصائيات الرئيسية", enabled: true },
  { id: "chart", title: "رسم بياني للإيرادات الشهرية", enabled: true },
  { id: "orders", title: "قائمة الطلبات الأخيرة", enabled: true },
  { id: "stock", title: "تنبيهات المخزون المنخفض", enabled: true },
];

export default function AdminDashboardPage() {
  const { formatCurrency } = useSettings();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    // Load saved widget order from localStorage
    const saved = localStorage.getItem("admin_dashboard_widgets");
    if (saved) {
      try {
        setWidgets(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const saveWidgets = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    localStorage.setItem("admin_dashboard_widgets", JSON.stringify(newWidgets));
  };

  const moveWidget = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;
    const copy = [...widgets];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;
    saveWidgets(copy);
  };

  const toggleWidget = (id: string) => {
    const copy = widgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w));
    saveWidgets(copy);
  };

  const resetWidgets = () => {
    saveWidgets(DEFAULT_WIDGETS);
  };

  if (isLoading) {
    return (
      <div className="space-y-6" dir="rtl">
        <h1 className="text-2xl font-bold tracking-tight">لوحة التحكم الإدارية</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border bg-card p-6 shadow-card">
              <div className="h-4 w-20 rounded-md bg-muted mb-3" />
              <div className="h-8 w-32 rounded-md bg-muted" />
            </div>
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-muted animate-pulse" />
      </div>
    );
  }

  if (!data) return <p className="text-muted-foreground" dir="rtl">حدث خطأ أثناء تحميل بيانات اللوحة</p>;

  const stats = [
    { label: "إجمالي الإيرادات", value: formatCurrency(data.totalRevenue), icon: "💰", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
    { label: "إجمالي الطلبات", value: String(data.totalOrders), icon: "📦", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
    { label: "إجمالي المنتجات", value: String(data.totalProducts), icon: "🏷️", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
    { label: "إجمالي العملاء", value: String(data.totalCustomers), icon: "👥", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  ];

  const maxRevenue = Math.max(...data.revenueChartData.map((d) => d.revenue), 1);

  return (
    <div className="space-y-6 animate-fade-in" dir="rtl">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ملخص لوحة التحكم</h1>
          <p className="text-xs text-muted-foreground mt-1">مرحباً بك في لوحة الإدارة المتكاملة</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="h-9 px-3.5 rounded-xl border bg-card text-xs font-semibold hover:bg-accent transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>⚙️</span> تخصيص الودجات
          </button>
          <Badge variant="info">محدث مباشرة</Badge>
        </div>
      </div>

      {/* Customize Drawer / Panel */}
      {showConfig && (
        <div className="rounded-2xl border bg-card p-5 shadow-card space-y-3 bg-muted/20">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-sm">إدارة وتنسيق ودجات لوحة التحكم</h3>
            <button onClick={resetWidgets} className="text-xs text-primary hover:underline">إعادة الضبط الافتراضي</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {widgets.map((w, idx) => (
              <div key={w.id} className="flex items-center justify-between rounded-xl border bg-background px-3 py-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={w.enabled}
                    onChange={() => toggleWidget(w.id)}
                    className="rounded border-muted text-primary focus:ring-primary"
                  />
                  <span className="font-medium">{w.title}</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveWidget(idx, "up")}
                    disabled={idx === 0}
                    className="px-1.5 py-0.5 rounded hover:bg-accent disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveWidget(idx, "down")}
                    disabled={idx === widgets.length - 1}
                    className="px-1.5 py-0.5 rounded hover:bg-accent disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Render Dynamic Widgets */}
      {widgets.map((widget) => {
        if (!widget.enabled) return null;

        switch (widget.id) {
          case "stats":
            return (
              <div key="stats" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                        <span className="text-lg">{stat.icon}</span>
                      </div>
                    </div>
                    <p className="mt-3 text-2xl font-extrabold tracking-tight">{stat.value}</p>
                  </div>
                ))}
              </div>
            );

          case "chart":
            return (
              <div key="chart" className="rounded-2xl border bg-card p-6 shadow-card">
                <h2 className="mb-5 text-base font-bold">الإيرادات الشهرية</h2>
                <div className="flex items-end gap-3 h-48 pt-4">
                  {data.revenueChartData.map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {item.revenue > 0 ? formatCurrency(item.revenue) : ""}
                      </span>
                      <div
                        className="w-full rounded-t-xl bg-primary/15 transition-all duration-500 hover:bg-primary/25 relative group"
                        style={{ height: `${(item.revenue / maxRevenue) * 100}%`, minHeight: item.revenue > 0 ? "6px" : "2px" }}
                      >
                        <div className="w-full rounded-t-xl bg-primary h-full transition-all duration-500" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground/80">{item.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            );

          case "orders":
            return (
              <div key="orders" className="rounded-2xl border bg-card p-6 shadow-card">
                <h2 className="mb-5 text-base font-bold">الطلبات الأخيرة</h2>
                {data.recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">لا توجد طلبات حديثة</p>
                ) : (
                  <div className="space-y-3">
                    {data.recentOrders.map((order) => {
                      const statusInfo = STATUS_VARIANTS[order.status] || { label: order.status, variant: "outline" };
                      return (
                        <div
                          key={order.id}
                          className="flex items-center justify-between rounded-xl p-3 border bg-background/50 transition-colors hover:bg-accent/50"
                        >
                          <div>
                            <p className="font-bold text-sm">{order.orderNumber}</p>
                            <p className="text-xs text-muted-foreground">{order.user.name}</p>
                          </div>
                          <div className="text-left flex flex-col items-end gap-1">
                            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                            <p className="font-bold text-xs">{formatCurrency(order.total)}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );

          case "stock":
            return (
              <div key="stock" className="rounded-2xl border bg-card p-6 shadow-card">
                <h2 className="mb-5 text-base font-bold">تنبيهات المخزون المنخفض</h2>
                {data.lowStockProducts.length === 0 ? (
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-semibold">
                    <span>✓</span> جميع المنتجات متوفرة بمخزون جيد
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.lowStockProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between rounded-xl p-3 border bg-background/50 transition-colors hover:bg-accent/50"
                      >
                        <p className="font-bold text-sm">{product.name}</p>
                        <Badge variant={product.stockQuantity === 0 ? "destructive" : "warning"}>
                          {product.stockQuantity === 0 ? "نفذ المخزون" : `متبقي ${product.stockQuantity}`}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );

          default:
            return null;
        }
      })}
    </div>
  );
}
