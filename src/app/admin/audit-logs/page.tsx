"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";

interface AuditItem {
  id: string;
  action: string;
  module: string;
  entity?: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  userName?: string;
  ipAddress?: string;
  notes?: string;
  createdAt: string;
}

interface AuditLogResponse {
  items: AuditItem[];
  total: number;
  page: number;
  totalPages: number;
}

const MODULE_OPTIONS = [
  { label: "كل الوحدات", value: "" },
  { label: "المنتجات", value: "PRODUCTS" },
  { label: "الفئات", value: "CATEGORIES" },
  { label: "الطلبات", value: "ORDERS" },
  { label: "المخزون", value: "INVENTORY" },
  { label: "المحاسبة", value: "ACCOUNTING" },
  { label: "إعدادات المتجر", value: "SETTINGS" },
];

export default function AdminAuditLogsPage() {
  const [data, setData] = useState<AuditLogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<AuditItem | null>(null);
  const searchDebounce = useRef<NodeJS.Timeout | null>(null);

  const fetchLogs = useCallback(async (mod: string, q: string, p: number) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (mod) params.set("module", mod);
      if (q) params.set("q", q);
      params.set("page", String(p));

      const resp = await fetch(`/api/admin/audit-logs?${params}`);
      const json = await resp.json();
      if (json.success) setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(moduleFilter, searchQ, page);
  }, [moduleFilter, searchQ, page, fetchLogs]);

  const handleSearchChange = (val: string) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setSearchQ(val);
      setPage(1);
    }, 400);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">سجل التغييرات والعمليات (Audit Log)</h1>
        <p className="text-sm text-muted-foreground mt-1">تتبع كافة الإجراءات والعمليات المنفذة في لوحة التحكم والمتجر</p>
      </div>

      {/* Filter Bar */}
      <div className="rounded-2xl border bg-card p-4 shadow-card flex flex-wrap items-center gap-3">
        <input
          className="h-9 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 flex-1 min-w-48"
          placeholder="بحث في الإجراءات والمستخدمين والملاحظات..."
          onChange={(e) => handleSearchChange(e.target.value)}
        />
        <select
          className="h-9 rounded-xl border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          value={moduleFilter}
          onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
        >
          {MODULE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-12 rounded-xl bg-muted/30" />
            ))}
          </div>
        ) : data && data.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">التاريخ</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الموديل</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">الإجراء</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">المستخدم</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">ملاحظات</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">تفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((log) => (
                  <tr key={log.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("ar-SA")}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline">{log.module}</Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold">{log.action}</td>
                    <td className="px-4 py-3 text-xs">{log.userName || "النظام / مجهول"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{log.notes || "—"}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedItem(log)}
                        className="text-xs text-primary hover:underline"
                      >
                        عرض التغييرات
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <span className="text-4xl mb-3">📋</span>
            <p className="text-sm font-medium">لا توجد سجلات تطابق البحث</p>
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between border-t px-6 py-3 text-xs text-muted-foreground">
            <span>عرض {data.items.length} من {data.total}</span>
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

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-card p-6 shadow-xl border space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="font-bold text-lg">تفاصيل الإجراء: {selectedItem.action}</h2>
              <button onClick={() => setSelectedItem(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div><span className="text-muted-foreground">الموديل:</span> <strong>{selectedItem.module}</strong></div>
              <div><span className="text-muted-foreground">المستخدم:</span> <strong>{selectedItem.userName || "غير محدد"}</strong></div>
              <div><span className="text-muted-foreground">التاريخ:</span> <strong>{new Date(selectedItem.createdAt).toLocaleString("ar-SA")}</strong></div>
              <div><span className="text-muted-foreground">عنوان IP:</span> <strong>{selectedItem.ipAddress || "—"}</strong></div>
            </div>

            {selectedItem.notes && (
              <div className="text-xs bg-muted/40 p-3 rounded-xl">
                <span className="text-muted-foreground">ملاحظات:</span> {selectedItem.notes}
              </div>
            )}

            {selectedItem.oldValues && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-red-500">القيم السابقة (Old Values):</span>
                <pre className="p-3 rounded-xl bg-muted text-[11px] font-mono overflow-x-auto">
                  {JSON.stringify(selectedItem.oldValues, null, 2)}
                </pre>
              </div>
            )}

            {selectedItem.newValues && (
              <div className="space-y-1">
                <span className="text-xs font-semibold text-emerald-600">القيم الجديدة (New Values):</span>
                <pre className="p-3 rounded-xl bg-muted text-[11px] font-mono overflow-x-auto">
                  {JSON.stringify(selectedItem.newValues, null, 2)}
                </pre>
              </div>
            )}

            <div className="pt-2 text-left">
              <button
                onClick={() => setSelectedItem(null)}
                className="h-9 px-4 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
