"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";

interface TimelineEvent {
  id: string;
  module: string;
  action: string;
  description: string;
  performedBy?: string;
  createdAt: string;
}

const MODULE_BADGES: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" }> = {
  ORDERS: { label: "الطلبات", variant: "info" },
  PRODUCTS: { label: "المنتجات", variant: "secondary" },
  INVENTORY: { label: "المخزون", variant: "warning" },
  ACCOUNTING: { label: "المحاسبة", variant: "success" },
  SETTINGS: { label: "إعدادات", variant: "outline" },
  SYSTEM: { label: "النظام", variant: "default" },
};

export default function AdminActivityPage() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterModule, setFilterModule] = useState("");

  const fetchEvents = useCallback(async (mod: string) => {
    setIsLoading(true);
    try {
      const url = mod ? `/api/admin/activity?module=${mod}` : "/api/admin/activity";
      const resp = await fetch(url);
      const json = await resp.json();
      if (json.success) setEvents(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(filterModule);
  }, [filterModule, fetchEvents]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">سجل النشاط الزمني (Activity Timeline)</h1>
          <p className="text-sm text-muted-foreground mt-1">تتبع أحداث وعمليات المنصة في الوقت الفعلي</p>
        </div>
        <select
          className="h-10 rounded-xl border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
          value={filterModule}
          onChange={(e) => setFilterModule(e.target.value)}
        >
          <option value="">كل الأنشطة</option>
          <option value="ORDERS">أحداث الطلبات</option>
          <option value="INVENTORY">حركات المخزون</option>
          <option value="PRODUCTS">المنتجات</option>
          <option value="ACCOUNTING">المحاسبة والمصاريف</option>
          <option value="SETTINGS">إعدادات المتجر</option>
        </select>
      </div>

      {/* Timeline List */}
      <div className="rounded-2xl border bg-card p-6 shadow-card">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse h-16 rounded-xl bg-muted/30" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="relative border-r border-muted pr-6 space-y-6">
            {events.map((evt) => {
              const badgeInfo = MODULE_BADGES[evt.module] || { label: evt.module, variant: "secondary" };
              return (
                <div key={evt.id} className="relative group">
                  {/* Timeline dot */}
                  <span className="absolute -right-8 top-1 h-4 w-4 rounded-full border-2 border-background bg-primary shadow-sm" />
                  <div className="flex flex-col gap-1 rounded-xl border bg-background/50 p-4 shadow-sm transition-all hover:bg-accent/40">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
                        <span className="font-bold text-sm">{evt.action}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(evt.createdAt).toLocaleString("ar-SA")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{evt.description}</p>
                    {evt.performedBy && (
                      <span className="text-[10px] text-muted-foreground/80 mt-1">
                        بواسطة: <strong>{evt.performedBy}</strong>
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <span className="text-4xl mb-3">🕒</span>
            <p className="text-sm font-medium">لا توجد أنشطة مسجلة للفئة المحددة</p>
          </div>
        )}
      </div>
    </div>
  );
}
