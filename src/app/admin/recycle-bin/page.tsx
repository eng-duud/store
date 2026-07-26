"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";

interface RecycleBinItem {
  id: string;
  type: "PRODUCT" | "CATEGORY" | "EXPENSE";
  title: string;
  subtitle?: string;
  deletedAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  PRODUCT: "منتج",
  CATEGORY: "فئة",
  EXPENSE: "مصروف",
};

export default function AdminRecycleBinPage() {
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const resp = await fetch("/api/admin/recycle-bin");
      const json = await resp.json();
      if (json.success) setItems(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleAction = async (action: "RESTORE" | "DELETE", type: string, id: string) => {
    if (action === "DELETE" && !confirm("هل أنت متأكد من الحذف النهائي؟ لا يمكن التراجع عن هذا الإجراء.")) {
      return;
    }
    setActionId(id);
    try {
      await fetch("/api/admin/recycle-bin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, type, id }),
      });
      fetchItems();
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">سلة المحذوفات (Recycle Bin)</h1>
        <p className="text-sm text-muted-foreground mt-1">عرض العناصر المحذوفة مؤقتاً مع إمكانية الاستعادة أو الحذف النهائي</p>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border bg-card shadow-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-12 rounded-xl bg-muted/30" />
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">نوع العنصر</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">العنوان</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">التفاصيل</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">تاريخ الحذف</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <Badge variant="outline">{TYPE_LABELS[item.type] || item.type}</Badge>
                    </td>
                    <td className="px-4 py-3 font-semibold">{item.title}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.subtitle || "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(item.deletedAt).toLocaleString("ar-SA")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAction("RESTORE", item.type, item.id)}
                          disabled={actionId === item.id}
                          className="h-8 px-3 rounded-lg border bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-40"
                        >
                          استعادة
                        </button>
                        <button
                          onClick={() => handleAction("DELETE", item.type, item.id)}
                          disabled={actionId === item.id}
                          className="h-8 px-3 rounded-lg border bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-500/20 transition-colors disabled:opacity-40"
                        >
                          حذف نهائي
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
            <span className="text-4xl mb-3">🗑️</span>
            <p className="text-sm font-medium">سلة المحذوفات فارغة</p>
            <p className="text-xs mt-1">لا توجد منتجات أو فئات أو مصاريف محذوفة مؤقتاً</p>
          </div>
        )}
      </div>
    </div>
  );
}
