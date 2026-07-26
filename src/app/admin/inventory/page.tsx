"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/hooks/use-settings";

interface InventoryProduct {
  id: string;
  name: string;
  sku: string;
  image?: string;
  categories: string[];
  price: number;
  costPrice?: number;
  stockQuantity: number;
  reservedStock: number;
  availableStock: number;
  lowStockThreshold: number;
  stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  updatedAt: string;
}

interface InventoryOverviewResponse {
  products: InventoryProduct[];
  total: number;
  page: number;
  totalPages: number;
  stats: {
    totalProductsCount: number;
    totalStockCount: number;
    outOfStockCount: number;
    lowStockCount: number;
    totalCostValue: number;
    totalRetailValue: number;
    expectedProfit: number;
  };
}

interface InventoryTransactionItem {
  id: string;
  type: string;
  quantity: number;
  oldQuantity: number;
  newQuantity: number;
  notes?: string;
  performedByName?: string;
  createdAt: string;
  product: { id: string; name: string; sku: string };
}

const TRANSACTION_TYPES: Record<string, string> = {
  PURCHASE: "شراء / توريد (+)",
  SALE: "خصم مبيعات (-)",
  ADJUSTMENT: "تعديل جردي",
  RETURN: "إرجاع مخزون (+)",
  CANCELLATION: "إلغاء طلب (+)",
};

export default function AdminInventoryPage() {
  const { formatCurrency } = useSettings();
  const [activeTab, setActiveTab] = useState<"items" | "history">("items");
  const [data, setData] = useState<InventoryOverviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage] = useState(1);

  // History state
  const [historyItems, setHistoryItems] = useState<InventoryTransactionItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);

  // Adjustment Modal
  const [adjustingProduct, setAdjustingProduct] = useState<InventoryProduct | null>(null);
  const [adjType, setAdjType] = useState<string>("PURCHASE");
  const [adjQty, setAdjQty] = useState<string>("");
  const [adjNotes, setAdjNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adjError, setAdjError] = useState("");

  const searchDebounce = useRef<NodeJS.Timeout | null>(null);

  const fetchOverview = useCallback(async (st: string, q: string, p: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (st && st !== "ALL") params.set("status", st);
      if (q) params.set("q", q);
      params.set("page", String(p));

      const resp = await fetch(`/api/admin/inventory?${params}`);
      const json = await resp.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async (p: number) => {
    setIsHistoryLoading(true);
    try {
      const resp = await fetch(`/api/admin/inventory/transactions?page=${p}`);
      const json = await resp.json();
      if (json.success) {
        setHistoryItems(json.data.items);
        setHistoryTotalPages(json.data.totalPages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "items") fetchOverview(statusFilter, searchQ, page);
    else fetchHistory(historyPage);
  }, [activeTab, statusFilter, searchQ, page, historyPage, fetchOverview, fetchHistory]);

  const handleSearchChange = (val: string) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setSearchQ(val);
      setPage(1);
    }, 400);
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct || !adjQty) return;
    setAdjError("");
    setIsSubmitting(true);
    try {
      const resp = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: adjustingProduct.id,
          type: adjType,
          quantity: Number(adjQty),
          notes: adjNotes,
        }),
      });
      const json = await resp.json();
      if (!json.success) throw new Error(json.error || "فشل تعديل المخزون");

      setAdjustingProduct(null);
      setAdjQty("");
      setAdjNotes("");
      fetchOverview(statusFilter, searchQ, page);
    } catch (err: any) {
      setAdjError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">إدارة المخزون والتخزين</h1>
        <p className="text-sm text-muted-foreground mt-1">متابعة الكميات، المحجوز، التنبيهات وحركات المخزون</p>
      </div>

      {/* KPI Cards */}
      {data?.stats && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border bg-card p-5 shadow-card flex flex-col justify-between">
            <span className="text-xs font-medium text-muted-foreground">إجمالي قطع المخزون</span>
            <span className="text-2xl font-bold text-primary mt-2">{data.stats.totalStockCount} قطعة</span>
            <span className="text-[10px] text-muted-foreground mt-1">{data.stats.totalProductsCount} منتج مختلف</span>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-card flex flex-col justify-between">
            <span className="text-xs font-medium text-muted-foreground">تنبيهات النفاذ والانخفاض</span>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="destructive">{data.stats.outOfStockCount} نافذ</Badge>
              <Badge variant="warning">{data.stats.lowStockCount} منخفض</Badge>
            </div>
            <span className="text-[10px] text-muted-foreground mt-1">يحتاج إلى إعادة طلب</span>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-card flex flex-col justify-between">
            <span className="text-xs font-medium text-muted-foreground">قيمة المخزون بسعر التكلفة</span>
            <span className="text-2xl font-bold text-emerald-600 mt-2">{formatCurrency(data.stats.totalCostValue)}</span>
            <span className="text-[10px] text-muted-foreground mt-1">تكلفة الشراء الأصلية</span>
          </div>

          <div className="rounded-2xl border bg-card p-5 shadow-card flex flex-col justify-between">
            <span className="text-xs font-medium text-muted-foreground">قيمة المخزون بسعر البيع (الربح المتوقع)</span>
            <span className="text-2xl font-bold text-blue-600 mt-2">{formatCurrency(data.stats.totalRetailValue)}</span>
            <span className="text-[10px] font-semibold text-emerald-600 mt-1">ربح متوقع: {formatCurrency(data.stats.expectedProfit)}</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b pb-0">
        <button
          onClick={() => setActiveTab("items")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
            activeTab === "items" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          جرد المنتجات والكميات
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
            activeTab === "history" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          سجل حركات المخزون
        </button>
      </div>

      {activeTab === "items" ? (
        <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 border-b p-4 bg-muted/10">
            <input
              className="h-9 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 flex-1 min-w-48"
              placeholder="بحث باسم المنتج أو SKU..."
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <select
              className="h-9 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="ALL">كل حالات المخزون</option>
              <option value="IN_STOCK">متوفر (&gt; 10)</option>
              <option value="LOW_STOCK">مخزون منخفض (1-10)</option>
              <option value="OUT_OF_STOCK">نافذ (0)</option>
            </select>
          </div>

          {/* Table */}
          {isLoading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse h-12 rounded-xl bg-muted/30" />
              ))}
            </div>
          ) : data && data.products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">المنتج</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">SKU</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">التكلفة / البيع</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">المخزون الكلي</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">محجوز لطلبات</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">المتاح للبيع</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الحالة</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="h-9 w-9 rounded-lg object-cover border" />
                          ) : (
                            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-xs">📦</div>
                          )}
                          <div>
                            <span className="font-medium line-clamp-1">{p.name}</span>
                            <span className="text-[10px] text-muted-foreground">{p.categories.join(", ")}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.sku}</td>
                      <td className="px-4 py-3 text-xs whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{formatCurrency(p.price)}</span>
                          <span className="text-muted-foreground">تكلفة: {p.costPrice ? formatCurrency(p.costPrice) : "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-sm">{p.stockQuantity}</td>
                      <td className="px-4 py-3 text-muted-foreground font-semibold">{p.reservedStock}</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">{p.availableStock}</td>
                      <td className="px-4 py-3">
                        <Badge variant={p.stockStatus === "OUT_OF_STOCK" ? "destructive" : p.stockStatus === "LOW_STOCK" ? "warning" : "success"}>
                          {p.stockStatus === "OUT_OF_STOCK" ? "نافذ" : p.stockStatus === "LOW_STOCK" ? "منخفض" : "متوفر"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setAdjustingProduct(p)}
                          className="h-8 px-3 rounded-lg border bg-background text-xs font-semibold hover:bg-accent transition-colors"
                        >
                          تعديل المخزون
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <span className="text-4xl mb-3">📦</span>
              <p className="text-sm font-medium">لا توجد منتجات مطابقة</p>
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground">
              <span>عرض {data.products.length} من {data.total}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-7 rounded-lg border bg-background px-3 hover:bg-accent disabled:opacity-40"
                >
                  السابق
                </button>
                <span className="flex items-center px-2">{page} / {data.totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages}
                  className="h-7 rounded-lg border bg-background px-3 hover:bg-accent disabled:opacity-40"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* History Tab */
        <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
          {isHistoryLoading ? (
            <div className="p-8 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse h-12 rounded-xl bg-muted/30" />
              ))}
            </div>
          ) : historyItems.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">التاريخ</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">المنتج</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">نوع الحركة</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الكمية السابقة</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الكمية الجديدة</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">المُنفذ</th>
                    <th className="px-4 py-3 text-right font-semibold text-muted-foreground">ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {historyItems.map((item) => (
                    <tr key={item.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleString("ar-SA")}
                      </td>
                      <td className="px-4 py-3 font-medium">{item.product.name}</td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary">{TRANSACTION_TYPES[item.type] || item.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{item.oldQuantity}</td>
                      <td className="px-4 py-3 font-bold">{item.newQuantity}</td>
                      <td className="px-4 py-3 text-xs">{item.performedByName || "النظام"}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{item.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <span className="text-4xl mb-3">📜</span>
              <p className="text-sm font-medium">لا توجد حركات مخزون مسجلة</p>
            </div>
          )}

          {historyTotalPages > 1 && (
            <div className="flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground">
              <span>صفحة {historyPage} من {historyTotalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                  disabled={historyPage === 1}
                  className="h-7 rounded-lg border bg-background px-3 hover:bg-accent disabled:opacity-40"
                >
                  السابق
                </button>
                <button
                  onClick={() => setHistoryPage((p) => Math.min(historyTotalPages, p + 1))}
                  disabled={historyPage === historyTotalPages}
                  className="h-7 rounded-lg border bg-background px-3 hover:bg-accent disabled:opacity-40"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Adjust Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form onSubmit={handleStockSubmit} className="w-full max-w-lg rounded-2xl bg-card p-6 shadow-xl border space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-bold text-lg">تعديل مخزون: {adjustingProduct.name}</h2>
              <button type="button" onClick={() => setAdjustingProduct(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="text-xs bg-muted/40 p-3 rounded-xl flex justify-between">
              <span>المخزون الحالي: <strong>{adjustingProduct.stockQuantity} قطعة</strong></span>
              <span>المتاح للبيع: <strong className="text-emerald-600">{adjustingProduct.availableStock} قطعة</strong></span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">نوع الحركة</label>
              <select
                className="h-10 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={adjType}
                onChange={(e) => setAdjType(e.target.value)}
              >
                <option value="PURCHASE">توريد مخزون جديد (+)</option>
                <option value="ADJUSTMENT">تعديل كمية جردي مباشرة</option>
                <option value="SALE">تنزيل مبيعات يدوية (-)</option>
                <option value="RETURN">إرجاع مخزون (+)</option>
                <option value="CANCELLATION">تعديل إلغاء (+)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">
                {adjType === "ADJUSTMENT" ? "الكمية الكلية الجديدة" : "الكمية المراد إضافتها / خصمها"}
              </label>
              <input
                type="number"
                min="0"
                className="h-10 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                placeholder="أدخل الكمية..."
                value={adjQty}
                onChange={(e) => setAdjQty(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground">ملاحظات / سبب التعديل</label>
              <textarea
                className="rounded-xl border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 h-20 resize-none"
                placeholder="سبب الفحص أو التعديل..."
                value={adjNotes}
                onChange={(e) => setAdjNotes(e.target.value)}
              />
            </div>

            {adjError && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{adjError}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isSubmitting ? "جارٍ التحديث..." : "حفظ حركات المخزون"}
              </button>
              <button
                type="button"
                onClick={() => setAdjustingProduct(null)}
                className="h-10 rounded-xl border bg-background px-4 text-sm font-semibold hover:bg-accent"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
