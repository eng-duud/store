"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { useSettings } from "@/hooks/use-settings";
import { DocumentViewerModal } from "@/components/shared/document-viewer-modal";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateFinancialStatements, CHART_OF_ACCOUNTS } from "@/lib/financial-engine";

type DateRange = "today" | "yesterday" | "week" | "month" | "year" | "all";

interface FinancialSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMarginPercentage: string;
  cashIn: number;
  cashOut: number;
  netCashPosition: number;
  financialTrend: { date: string; revenue: number; expense: number; net: number }[];
  expensesByCategory: { category: string; amount: number }[];
}

interface ExpenseCategory {
  id: string;
  name: string;
  description?: string;
  _count: { expenses: number };
}

interface Expense {
  id: string;
  description: string;
  amount: string;
  date: string;
  receiptUrl?: string;
  expenseCategory: { id: string; name: string };
}

interface ExpenseList {
  items: Expense[];
  total: number;
  page: number;
  totalPages: number;
}

const RANGE_OPTIONS: { label: string; value: DateRange }[] = [
  { label: "اليوم", value: "today" },
  { label: "أمس", value: "yesterday" },
  { label: "آخر 7 أيام", value: "week" },
  { label: "هذا الشهر", value: "month" },
  { label: "هذه السنة", value: "year" },
  { label: "الكل", value: "all" },
];

const CATEGORY_COLORS = [
  "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b",
  "#ef4444", "#6366f1", "#ec4899", "#84cc16", "#0ea5e9",
];

let _fmtCurrency: (n: number) => string = (n) =>
  n.toLocaleString("ar-SA", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
function fmt(n: number) {
  return _fmtCurrency(n);
}

function StatCard({ label, value, sub, icon, color }: { label: string; value: string; sub?: string; icon: string; color: string }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg ${color}`}>{icon}</span>
      </div>
      <div>
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Financial Trend Chart ────────────────────────────────────────────────────
function FinancialTrendChart({ data }: { data: { date: string; revenue: number; expense: number; net: number }[] }) {
  if (!data || data.length === 0) return <div className="flex items-center justify-center h-32 text-xs text-muted-foreground">لا توجد بيانات</div>;

  const maxVal = Math.max(...data.flatMap((d) => [d.revenue, d.expense]), 1);
  const chartH = 100;
  const barW = Math.max(8, Math.floor(560 / data.length) - 3);

  return (
    <div className="overflow-x-auto">
      <div className="flex items-end gap-1 min-w-fit" style={{ height: chartH + 28 }}>
        {data.map((item, i) => {
          const rH = Math.max(2, (item.revenue / maxVal) * chartH);
          const eH = Math.max(2, (item.expense / maxVal) * chartH);
          return (
            <div key={i} className="flex flex-col items-center gap-0.5 group relative">
              <div className="flex items-end gap-0.5" style={{ height: chartH }}>
                <div
                  title={`إيرادات: ${fmt(item.revenue)}`}
                  style={{ height: rH, width: barW / 2 }}
                  className="rounded-t-sm bg-emerald-500/80 hover:bg-emerald-500 transition-colors cursor-pointer"
                />
                <div
                  title={`مصاريف: ${fmt(item.expense)}`}
                  style={{ height: eH, width: barW / 2 }}
                  className="rounded-t-sm bg-red-400/70 hover:bg-red-500 transition-colors cursor-pointer"
                />
              </div>
              <span className="text-[9px] text-muted-foreground rotate-45 origin-left mt-1 whitespace-nowrap">
                {new Date(item.date).toLocaleDateString("ar-SA", { month: "short", day: "numeric" })}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-3 text-xs">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-emerald-500/80" />الإيرادات</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-red-400/70" />المصاريف</span>
      </div>
    </div>
  );
}

// ─── Expense Category Bars ────────────────────────────────────────────────────
function CategoryBars({ data }: { data: { category: string; amount: number }[] }) {
  if (!data || data.length === 0) return <div className="text-xs text-muted-foreground text-center py-4">لا توجد مصاريف</div>;
  const max = Math.max(...data.map((d) => d.amount), 1);
  return (
    <div className="flex flex-col gap-3">
      {data.map((item, i) => (
        <div key={item.category} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium">{item.category}</span>
            <span className="text-muted-foreground">{fmt(item.amount)}</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(item.amount / max) * 100}%`, backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Expense Form ─────────────────────────────────────────────────────────────
interface ExpenseFormProps {
  categories: ExpenseCategory[];
  editData?: Expense | null;
  onSave: () => void;
  onCancel: () => void;
}
function ExpenseForm({ categories, editData, onSave, onCancel }: ExpenseFormProps) {
  const { settings } = useSettings();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    expenseCategoryId: editData?.expenseCategory.id || (categories[0]?.id || ""),
    amount: editData ? String(editData.amount) : "",
    description: editData?.description || "",
    date: editData ? new Date(editData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = editData ? `/api/admin/expenses/${editData.id}` : "/api/admin/expenses";
      const method = editData ? "PUT" : "POST";
      const resp = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await resp.json();
      if (!json.success) throw new Error(json.error || "خطأ");
      onSave();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">التصنيف</label>
          <select
            className="h-10 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={form.expenseCategoryId}
            onChange={(e) => setForm((f) => ({ ...f, expenseCategoryId: e.target.value }))}
            required
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground">المبلغ ({settings.currencySymbol})</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            className="h-10 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="0.00"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">الوصف</label>
        <input
          className="h-10 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="وصف المصروف..."
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-muted-foreground">التاريخ</label>
        <input
          type="date"
          className="h-10 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={form.date}
          onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          required
        />
      </div>

      {error && <p className="text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "جارٍ الحفظ..." : editData ? "حفظ التعديلات" : "إضافة مصروف"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-10 rounded-xl border bg-background px-4 text-sm font-semibold hover:bg-accent transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

// ─── Category Manager ─────────────────────────────────────────────────────────
function CategoryManager({ categories, onRefresh }: { categories: ExpenseCategory[]; onRefresh: () => void }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await fetch("/api/admin/expense-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      setName("");
      onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا التصنيف؟")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/expense-categories?id=${id}`, { method: "DELETE" });
      onRefresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          className="flex-1 h-9 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          placeholder="اسم التصنيف الجديد..."
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading || !name.trim()}
          className="h-9 rounded-xl bg-primary text-primary-foreground px-4 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
        >
          إضافة
        </button>
      </form>
      <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
        {categories.map((cat) => (
          <div key={cat.id} className="flex items-center justify-between rounded-xl border bg-muted/20 px-3 py-2 text-sm">
            <div>
              <span className="font-medium">{cat.name}</span>
              <span className="text-xs text-muted-foreground mr-2">({cat._count.expenses} مصروف)</span>
            </div>
            {cat._count.expenses === 0 && (
              <button
                onClick={() => handleDelete(cat.id)}
                disabled={deletingId === cat.id}
                className="text-xs text-destructive hover:text-destructive/80 transition-colors disabled:opacity-50"
              >
                حذف
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminAccountingPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "coa" | "journals" | "statements">("overview");
  const [range, setRange] = useState<DateRange>("month");
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [expenses, setExpenses] = useState<ExpenseList | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [isExpensesLoading, setIsExpensesLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editExpense, setEditExpense] = useState<Expense | null>(null);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const searchDebounce = useRef<NodeJS.Timeout | null>(null);
  const { formatCurrency: fmtCurrency, settings } = useSettings();
  _fmtCurrency = fmtCurrency;

  const financialStatements = generateFinancialStatements();

  const loadSummary = useCallback(async (r: DateRange) => {
    setIsSummaryLoading(true);
    try {
      const resp = await fetch(`/api/admin/accounting?range=${r}`);
      const json = await resp.json();
      if (json.success) setSummary(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      const resp = await fetch("/api/admin/expense-categories");
      const json = await resp.json();
      if (json.success) setCategories(json.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const loadExpenses = useCallback(async (cat: string, q: string, p: number) => {
    setIsExpensesLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat) params.set("categoryId", cat);
      if (q) params.set("q", q);
      params.set("page", String(p));
      const resp = await fetch(`/api/admin/expenses?${params}`);
      const json = await resp.json();
      if (json.success) setExpenses(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsExpensesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary(range);
    loadCategories();
  }, [range, loadSummary, loadCategories]);

  useEffect(() => {
    loadExpenses(filterCat, searchQ, page);
  }, [filterCat, searchQ, page, loadExpenses]);

  const handleSearchChange = (val: string) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => { setSearchQ(val); setPage(1); }, 400);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذا المصروف؟")) return;
    setDeletingId(id);
    try {
      await fetch(`/api/admin/expenses/${id}`, { method: "DELETE" });
      loadExpenses(filterCat, searchQ, page);
      loadSummary(range);
    } finally {
      setDeletingId(null);
    }
  };

  const handleSaveExpense = () => {
    setShowAddExpense(false);
    setEditExpense(null);
    loadExpenses(filterCat, searchQ, page);
    loadSummary(range);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Print Document Modal */}
      <DocumentViewerModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        payload={{
          title: "تقرير القوائم المالية الحسابية والميزانية",
          documentNumber: `FIN-STMT-${Date.now().toString().slice(-6)}`,
          type: "FINANCIAL_REPORT",
          date: new Date().toLocaleDateString("ar-SA"),
          reportSummary: {
            "إجمالي الأصول": financialStatements.balanceSheet.totalAssets,
            "إجمالي الالتزامات": financialStatements.balanceSheet.totalLiabilities,
            "صافي الأرباح": financialStatements.incomeStatement.netProfit,
            "هامش الربح الإجمالي": `${financialStatements.incomeStatement.grossProfitMargin.toFixed(1)}%`,
          },
          items: CHART_OF_ACCOUNTS.map((a) => ({
            name: `${a.code} - ${a.name} (${a.category})`,
            quantity: 1,
            unitPrice: a.balance,
            total: a.balance,
          })),
          totalAmount: financialStatements.balanceSheet.totalAssets,
        }}
      />

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
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

      {/* Financial KPIs */}
      {isSummaryLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="animate-pulse rounded-2xl border bg-card p-5 shadow-card">
              <div className="h-3 w-20 rounded-md bg-muted mb-4" />
              <div className="h-7 w-28 rounded-md bg-muted" />
            </div>
          ))}
        </div>
      ) : summary && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="إجمالي الإيرادات" value={`${fmt(summary.totalRevenue)}`} icon="💰" color="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
            <StatCard label="إجمالي المصاريف" value={`${fmt(summary.totalExpenses)}`} icon="💸" color="bg-red-500/10 text-red-600 dark:text-red-400" />
            <StatCard label="صافي الربح" value={`${fmt(summary.netProfit)}`} icon={summary.netProfit >= 0 ? "📈" : "📉"} color={summary.netProfit >= 0 ? "bg-blue-500/10 text-blue-600 dark:text-blue-400" : "bg-orange-500/10 text-orange-600 dark:text-orange-400"} sub={`هامش الربح: ${summary.profitMarginPercentage}%`} />
            <StatCard label="المركز النقدي" value={`${fmt(summary.netCashPosition)}`} icon="🏦" color="bg-purple-500/10 text-purple-600 dark:text-purple-400" />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Financial Trend */}
            <div className="lg:col-span-2 rounded-2xl border bg-card shadow-card p-6">
              <h2 className="font-semibold text-base mb-4">الحركة المالية</h2>
              {summary.financialTrend.length > 0 ? (
                <FinancialTrendChart data={summary.financialTrend} />
              ) : (
                <div className="flex items-center justify-center h-24 text-xs text-muted-foreground">لا توجد بيانات للفترة المحددة</div>
              )}
            </div>

            {/* Expenses by Category */}
            <div className="rounded-2xl border bg-card shadow-card p-6">
              <h2 className="font-semibold text-base mb-4">المصاريف بالتصنيف</h2>
              <CategoryBars data={summary.expensesByCategory} />
            </div>
          </div>
        </>
      )}

      {/* Expenses Section */}
      <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
        {/* Expenses Header */}
        <div className="flex flex-col gap-3 border-b px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="font-semibold text-base">سجل المصاريف</h2>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowCategoryManager(!showCategoryManager)}
              className="h-8 rounded-xl border bg-background px-3 text-xs font-semibold hover:bg-accent transition-colors"
            >
              إدارة التصنيفات
            </button>
            <button
              onClick={() => { setShowAddExpense(true); setEditExpense(null); setShowCategoryManager(false); }}
              className="h-8 rounded-xl bg-primary text-primary-foreground px-4 text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              + إضافة مصروف
            </button>
          </div>
        </div>

        {/* Category Manager Panel */}
        {showCategoryManager && (
          <div className="border-b px-6 py-4 bg-muted/20">
            <h3 className="text-sm font-semibold mb-3">إدارة تصنيفات المصاريف</h3>
            <CategoryManager categories={categories} onRefresh={loadCategories} />
          </div>
        )}

        {/* Add / Edit Expense Form */}
        {(showAddExpense || editExpense) && (
          <div className="border-b px-6 py-4 bg-muted/10">
            <h3 className="text-sm font-semibold mb-3">{editExpense ? "تعديل مصروف" : "إضافة مصروف جديد"}</h3>
            <ExpenseForm
              categories={categories}
              editData={editExpense}
              onSave={handleSaveExpense}
              onCancel={() => { setShowAddExpense(false); setEditExpense(null); }}
            />
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 border-b px-6 py-3 bg-muted/5">
          <input
            className="h-9 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 flex-1 min-w-40"
            placeholder="بحث في المصاريف..."
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          <select
            className="h-9 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            value={filterCat}
            onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}
          >
            <option value="">كل التصنيفات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        {isExpensesLoading ? (
          <div className="p-8">
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse h-12 rounded-xl bg-muted/30" />
              ))}
            </div>
          </div>
        ) : expenses && expenses.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">التاريخ</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">التصنيف</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الوصف</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">المبلغ</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {expenses.items.map((exp) => (
                  <tr key={exp.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(exp.date).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary">{exp.expenseCategory.name}</Badge>
                    </td>
                    <td className="px-4 py-3">{exp.description}</td>
                    <td className="px-4 py-3 font-semibold text-red-500 whitespace-nowrap">
                      {fmt(Number(exp.amount))}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditExpense(exp); setShowAddExpense(false); setShowCategoryManager(false); }}
                          className="text-xs text-primary hover:underline transition-colors"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id)}
                          disabled={deletingId === exp.id}
                          className="text-xs text-destructive hover:underline transition-colors disabled:opacity-50"
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <span className="text-4xl mb-3">💼</span>
            <p className="text-sm font-medium">لا توجد مصاريف مسجلة</p>
            <p className="text-xs mt-1">ابدأ بإضافة أول مصروف لمتجرك</p>
          </div>
        )}

        {/* Pagination */}
        {expenses && expenses.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground">
            <span>عرض {expenses.items.length} من {expenses.total}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 rounded-lg border bg-background px-3 hover:bg-accent disabled:opacity-40 transition-colors"
              >
                السابق
              </button>
              <span className="flex items-center px-2">
                {page} / {expenses.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(expenses.totalPages, p + 1))}
                disabled={page === expenses.totalPages}
                className="h-7 rounded-lg border bg-background px-3 hover:bg-accent disabled:opacity-40 transition-colors"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
