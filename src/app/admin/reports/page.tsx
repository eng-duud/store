"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/hooks/use-settings";

type DateRange = "today" | "yesterday" | "week" | "month" | "year" | "all";

interface SummaryData {
  totalRevenue: number;
  totalExpenses: number;
  estimatedProfit: number;
  averageOrderValue: number;
  completedOrdersCount: number;
  pendingOrdersCount: number;
  cancelledOrdersCount: number;
  allOrdersCount: number;
  totalCustomersCount: number;
  totalProductsCount: number;
  lowStockCount: number;
  topProducts: { productId: string; name: string; totalQuantity: number; totalSales: number }[];
}

interface SalesData {
  totalSales: number;
  totalOrders: number;
  salesTrend: { date: string; revenue: number; ordersCount: number }[];
  salesByPaymentMethod: { method: string; amount: number }[];
  salesByStatus: { status: string; count: number }[];
}

interface ProductData {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  featuredProducts: number;
  outOfStock: number;
  lowStock: number;
  totalInventoryValue: number;
  topProducts: { id: string; name: string; sku: string; price: number; stockQuantity: number; ordersCount: number }[];
}

interface CustomerData {
  totalCustomers: number;
  topSpenders: { id: string; name: string; email: string; ordersCount: number; totalSpent: number }[];
}

const RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: "اليوم", value: "today" },
  { label: "أمس", value: "yesterday" },
  { label: "آخر 7 أيام", value: "week" },
  { label: "هذا الشهر", value: "month" },
  { label: "هذه السنة", value: "year" },
  { label: "الكل", value: "all" },
];

const REPORT_TABS = [
  { id: "summary", label: "ملخص عام" },
  { id: "sales", label: "تقرير المبيعات" },
  { id: "products", label: "تقرير المنتجات" },
  { id: "customers", label: "تقرير العملاء" },
];

const STATUS_MAP: Record<string, string> = {
  PENDING: "قيد الانتظار",
  CONFIRMED: "مؤكد",
  PREPARING: "قيد التجهيز",
  SHIPPED: "مشحون",
  DELIVERED: "مسلم",
  CANCELLED: "ملغي",
  RETURNED: "مرتجع",
};

const PAYMENT_MAP: Record<string, string> = {
  CASH_ON_DELIVERY: "الدفع عند الاستلام",
  BANK_TRANSFER: "تحويل بنكي",
};

function fmtFallback(n: number) {
  return n.toLocaleString("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ─── Mini Bar Chart Component ─────────────────────────────────────────────────
function MiniBarChart({
  data,
  valueKey,
  color = "#8b5cf6",
  height = 80,
}: {
  data: Record<string, number | string>[];
  valueKey: string;
  color?: string;
  height?: number;
}) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">لا توجد بيانات</div>;

  const values = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(...values, 1);
  const barW = Math.max(4, Math.floor(300 / data.length) - 2);

  return (
    <div className="overflow-x-auto">
      <svg width={data.length * (barW + 2)} height={height} className="min-w-full">
        {data.map((item, i) => {
          const val = Number(item[valueKey]) || 0;
          const barH = Math.max(2, (val / max) * (height - 20));
          return (
            <g key={i}>
              <rect
                x={i * (barW + 2)}
                y={height - 20 - barH}
                width={barW}
                height={barH}
                rx={3}
                fill={color}
                fillOpacity={0.85}
              />
              <title>{String(item.date || item.name || i)}: {val}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ segments, formatValue }: { segments: { label: string; value: number; color: string }[]; formatValue?: (n: number) => string }) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) return <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">لا توجد بيانات</div>;

  let cumulative = 0;
  const radius = 50;
  const cx = 60;
  const cy = 60;
  const size = 120;

  function polarToCartesian(angle: number, r: number) {
    const rad = (angle - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  const arcs = segments.map((seg) => {
    const start = cumulative;
    const pct = seg.value / total;
    cumulative += pct * 360;
    const end = cumulative;
    const s = polarToCartesian(start, radius);
    const e = polarToCartesian(end, radius);
    const large = end - start > 180 ? 1 : 0;
    return { ...seg, path: `M ${cx} ${cy} L ${s.x} ${s.y} A ${radius} ${radius} 0 ${large} 1 ${e.x} ${e.y} Z` };
  });

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {arcs.map((arc, i) => (
          <path key={i} d={arc.path} fill={arc.color} stroke="var(--background)" strokeWidth={2}>
            <title>{arc.label}: {formatValue ? formatValue(arc.value) : fmtFallback(arc.value)}</title>
          </path>
        ))}
        <circle cx={cx} cy={cy} r={30} fill="var(--card)" />
      </svg>
      <div className="flex flex-col gap-1.5">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
            <span className="text-muted-foreground">{seg.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, color }: { label: string; value: string; sub?: string; icon: string; color: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${color}`}>{icon}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {sub && <span className="text-xs text-muted-foreground mt-0.5">{sub}</span>}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminReportsPage() {
  const { formatCurrency: fmtCurrency, settings } = useSettings();
  const fmt = (n: number) => fmtCurrency(n);
  const [activeTab, setActiveTab] = useState("summary");
  const [range, setRange] = useState<DateRange>("month");
  const [isLoading, setIsLoading] = useState(true);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);

  const loadData = useCallback(async (tab: string, r: DateRange) => {
    setIsLoading(true);
    try {
      const resp = await fetch(`/api/admin/reports?type=${tab}&range=${r}`);
      const json = await resp.json();
      if (!json.success) return;
      switch (tab) {
        case "summary": setSummaryData(json.data); break;
        case "sales": setSalesData(json.data); break;
        case "products": setProductData(json.data); break;
        case "customers": setCustomerData(json.data); break;
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(activeTab, range);
  }, [activeTab, range, loadData]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">التقارير والتحليلات</h1>
          <p className="text-sm text-muted-foreground mt-1">بيانات حية لأداء متجرك</p>
        </div>
        {/* Date Range Selector */}
        <div className="flex flex-wrap gap-1.5 bg-muted/50 rounded-xl p-1">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRange(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150 ${
                range === opt.value
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b pb-0">
        {REPORT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all duration-150 -mb-px ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border bg-card p-5 shadow-card">
              <div className="h-3 w-20 rounded-md bg-muted mb-4" />
              <div className="h-7 w-28 rounded-md bg-muted" />
            </div>
          ))}
        </div>
      )}

      {/* Summary Tab */}
      {!isLoading && activeTab === "summary" && summaryData && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="إجمالي الإيرادات" value={`${fmt(summaryData.totalRevenue)} ر.س`} icon="💰" color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" sub={`متوسط الطلب: ${fmt(summaryData.averageOrderValue)} ر.س`} />
            <StatCard label="إجمالي المصاريف" value={`${fmt(summaryData.totalExpenses)} ر.س`} icon="📉" color="bg-red-500/10 text-red-600 dark:text-red-400" />
            <StatCard label="صافي الربح" value={`${fmt(summaryData.estimatedProfit)} ر.س`} icon="📊" color={summaryData.estimatedProfit >= 0 ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-orange-500/10 text-orange-600 dark:text-orange-400"} />
            <StatCard label="إجمالي الطلبات" value={String(summaryData.allOrdersCount)} icon="📦" color="bg-purple-500/10 text-purple-600 dark:text-purple-400" sub={`مكتملة: ${summaryData.completedOrdersCount} | معلقة: ${summaryData.pendingOrdersCount}`} />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="العملاء" value={String(summaryData.totalCustomersCount)} icon="👥" color="bg-sky-500/10 text-sky-600 dark:text-sky-400" />
            <StatCard label="المنتجات" value={String(summaryData.totalProductsCount)} icon="🏪" color="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
            <StatCard label="مخزون منخفض" value={String(summaryData.lowStockCount)} icon="⚠️" color="bg-orange-500/10 text-orange-600 dark:text-orange-400" />
            <StatCard label="الطلبات الملغاة" value={String(summaryData.cancelledOrdersCount)} icon="❌" color="bg-red-500/10 text-red-600 dark:text-red-400" />
          </div>

          {/* Top Products Table */}
          {summaryData.topProducts.length > 0 && (
            <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
              <div className="px-6 py-4 border-b">
                <h2 className="font-semibold text-base">أكثر المنتجات مبيعاً</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground">#</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground">المنتج</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الكمية المباعة</th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground">المبيعات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryData.topProducts.map((p, i) => (
                      <tr key={p.productId} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3">{p.totalQuantity}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-600">{fmt(p.totalSales)} ر.س</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Sales Tab */}
      {!isLoading && activeTab === "sales" && salesData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="إجمالي المبيعات" value={`${fmt(salesData.totalSales)} ر.س`} icon="💵" color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
            <StatCard label="عدد الطلبات" value={String(salesData.totalOrders)} icon="📦" color="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
            <StatCard label="متوسط قيمة الطلب" value={salesData.totalOrders > 0 ? `${fmt(salesData.totalSales / salesData.totalOrders)} ر.س` : "—"} icon="📐" color="bg-purple-500/10 text-purple-600 dark:text-purple-400" />
          </div>

          {/* Sales Trend */}
          {salesData.salesTrend.length > 0 && (
            <div className="rounded-2xl border bg-card shadow-card p-6">
              <h2 className="font-semibold text-base mb-4">مسار المبيعات</h2>
              <MiniBarChart data={salesData.salesTrend} valueKey="revenue" color="#8b5cf6" height={120} />
              <div className="grid grid-cols-2 gap-2 mt-4">
                {salesData.salesTrend.slice(-6).map((item) => (
                  <div key={item.date} className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2 text-xs">
                    <span className="text-muted-foreground">{new Date(item.date).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}</span>
                    <span className="font-semibold">{fmt(item.revenue)} ر.س</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* By Payment Method */}
            <div className="rounded-2xl border bg-card shadow-card p-6">
              <h2 className="font-semibold text-base mb-4">المبيعات بطريقة الدفع</h2>
              <DonutChart
                formatValue={fmt}
                segments={salesData.salesByPaymentMethod.map((pm, i) => ({
                  label: PAYMENT_MAP[pm.method] || pm.method,
                  value: pm.amount,
                  color: ["#8b5cf6", "#06b6d4", "#10b981", "#f59e0b"][i % 4],
                }))}
              />
            </div>

            {/* By Status */}
            <div className="rounded-2xl border bg-card shadow-card p-6">
              <h2 className="font-semibold text-base mb-4">الطلبات بالحالة</h2>
              <div className="flex flex-col gap-2">
                {salesData.salesByStatus.map((s) => (
                  <div key={s.status} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{STATUS_MAP[s.status] || s.status}</span>
                    <Badge variant="secondary">{s.count}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {!isLoading && activeTab === "products" && productData && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="إجمالي المنتجات" value={String(productData.totalProducts)} icon="📦" color="bg-blue-500/10 text-blue-600 dark:text-blue-400" />
            <StatCard label="المنتجات النشطة" value={String(productData.activeProducts)} icon="✅" color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
            <StatCard label="نفاذ المخزون" value={String(productData.outOfStock)} icon="❗" color="bg-red-500/10 text-red-600 dark:text-red-400" />
            <StatCard label="قيمة المخزون" value={`${fmt(productData.totalInventoryValue)} ر.س`} icon="🏦" color="bg-amber-500/10 text-amber-600 dark:text-amber-400" />
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            <StatCard label="غير نشط/مؤرشف" value={String(productData.inactiveProducts)} icon="📂" color="bg-muted text-muted-foreground" />
            <StatCard label="مميز" value={String(productData.featuredProducts)} icon="⭐" color="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" />
            <StatCard label="مخزون منخفض (≤10)" value={String(productData.lowStock)} icon="⚠️" color="bg-orange-500/10 text-orange-600 dark:text-orange-400" />
          </div>

          {/* Top Products */}
          <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="font-semibold text-base">أفضل المنتجات أداءً</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">المنتج</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">SKU</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">السعر</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">المخزون</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الطلبات</th>
                  </tr>
                </thead>
                <tbody>
                  {productData.topProducts.map((p, i) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{p.sku}</td>
                      <td className="px-4 py-3">{fmt(p.price)} ر.س</td>
                      <td className="px-4 py-3">
                        <Badge variant={p.stockQuantity <= 0 ? "destructive" : p.stockQuantity <= 10 ? "warning" : "success"}>
                          {p.stockQuantity}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold">{p.ordersCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Customers Tab */}
      {!isLoading && activeTab === "customers" && customerData && (
        <div className="space-y-6">
          <StatCard label="إجمالي العملاء" value={String(customerData.totalCustomers)} icon="👥" color="bg-sky-500/10 text-sky-600 dark:text-sky-400" />

          <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b">
              <h2 className="font-semibold text-base">أعلى العملاء إنفاقاً</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">#</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الاسم</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">البريد</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الطلبات</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">إجمالي الإنفاق</th>
                  </tr>
                </thead>
                <tbody>
                  {customerData.topSpenders.map((c, i) => (
                    <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{c.name}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{c.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{c.ordersCount}</Badge>
                      </td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">{fmt(c.totalSpent)} ر.س</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
