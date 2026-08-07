"use client";

import { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { getNotifications, getBackgroundJobs, SystemNotification, BackgroundJob } from "@/lib/workflow-platform";
import { Bell, Cpu, GitBranch, History, CheckCircle2, Clock, AlertTriangle } from "lucide-react";

interface TimelineEvent {
  id: string;
  module: string;
  action: string;
  description: string;
  performedBy?: string;
  createdAt: string;
}

export default function AdminActivityPage() {
  const [activeTab, setActiveTab] = useState<"notifs" | "jobs" | "rules" | "activity">("notifs");
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [backgroundJobs, setBackgroundJobs] = useState<BackgroundJob[]>([]);
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
    setNotifications(getNotifications());
    setBackgroundJobs(getBackgroundJobs());
  }, [filterModule, fetchEvents]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-7 h-7 text-primary" />
            مركز الأتمتة، الإشعارات والمعالجة الخلفية (Workflow & Automation Platform)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة التنبيهات الحية، طوابير المهام المؤجلة، محرك قواعد الأعمال والسجلات الزمنية
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab("notifs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "notifs"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bell className="w-4 h-4" />
          مركز الإشعارات والتنبيهات ({notifications.length})
        </button>

        <button
          onClick={() => setActiveTab("jobs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "jobs"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Cpu className="w-4 h-4" />
          معالجة المهام الخلفية ({backgroundJobs.length})
        </button>

        <button
          onClick={() => setActiveTab("rules")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "rules"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <GitBranch className="w-4 h-4" />
          محرك قواعد الأعمال والمصادقة التلقائية
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "activity"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="w-4 h-4" />
          سجل الأنشطة الزمني ({events.length})
        </button>
      </div>

      {/* Tab 1: Live Notification Center */}
      {activeTab === "notifs" && (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                notif.isRead
                  ? "bg-card opacity-75"
                  : "bg-primary/5 border-primary/30 shadow-card"
              }`}
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {notif.title}
                  </h3>
                  <Badge variant={notif.priority === "HIGH" ? "destructive" : "secondary"}>
                    {notif.priority}
                  </Badge>
                  <span className="text-[11px] text-muted-foreground">
                    ({notif.category})
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {notif.message}
                </p>
                <div className="flex gap-1.5 pt-1">
                  {notif.channels.map((ch, idx) => (
                    <Badge key={idx} variant="outline" className="text-[10px] font-mono">
                      {ch}
                    </Badge>
                  ))}
                </div>
              </div>

              {!notif.isRead && (
                <button
                  onClick={() => handleMarkAsRead(notif.id)}
                  className="text-xs font-bold text-primary hover:underline cursor-pointer shrink-0"
                >
                  تعيين كقروء
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Background Jobs Queue */}
      {activeTab === "jobs" && (
        <div className="rounded-2xl border bg-card p-5 shadow-card space-y-4">
          <h3 className="font-bold text-base border-b pb-3 text-slate-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            طابور معالجة المهام المؤجلة والخلفية (Async Job Processing Queue)
          </h3>

          <div className="space-y-3">
            {backgroundJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono font-bold text-primary">{job.id}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                      {job.taskName}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-[11px]">
                    المحاولات: {job.retryCount} / {job.maxRetries}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {job.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Business Rules Engine */}
      {activeTab === "rules" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl border bg-card shadow-card space-y-3">
            <h3 className="font-bold text-sm border-b pb-2 flex items-center gap-2 text-slate-900 dark:text-white">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              قاعدة: تنبيه انخفاض المخزون التلقائي
            </h3>
            <p className="text-xs text-muted-foreground">
              عند انخفاض كمية أي منتج في أي مستودع عن حد الأمان المحسوب تلقائياً، يتم تشغيل تنبيه فوري لمسؤول المستودع وإدراج أمر إعادة طلب.
            </p>
            <Badge variant="outline" className="text-emerald-600 font-bold">مفعلة وتعمل</Badge>
          </div>

          <div className="p-5 rounded-2xl border bg-card shadow-card space-y-3">
            <h3 className="font-bold text-sm border-b pb-2 flex items-center gap-2 text-slate-900 dark:text-white">
              <Clock className="w-4 h-4 text-blue-500" />
              قاعدة: التذكير والإنذار بالمعاملات المعلقة
            </h3>
            <p className="text-xs text-muted-foreground">
              توجيه تذكيرات أوتوماتيكية لأوامر الشراء أو المصروفات المعلقة لأكثر من 24 ساعة لتصعيدها إلى مدير القسم تلقائياً.
            </p>
            <Badge variant="outline" className="text-emerald-600 font-bold">مفعلة وتعمل</Badge>
          </div>
        </div>
      )}

      {/* Tab 4: System Activity Timeline */}
      {activeTab === "activity" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <select
              className="h-10 rounded-xl border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
              value={filterModule}
              onChange={(e) => setFilterModule(e.target.value)}
            >
              <option value="">كل الأنشطة</option>
              <option value="ORDERS">الطلبات</option>
              <option value="PRODUCTS">المنتجات</option>
              <option value="INVENTORY">المخزون</option>
              <option value="ACCOUNTING">المحاسبة</option>
              <option value="SETTINGS">الإعدادات</option>
              <option value="SYSTEM">النظام</option>
            </select>
          </div>

          {isLoading ? (
            <p className="text-center text-xs text-muted-foreground py-8">جارٍ تحميل سجل الأحداث...</p>
          ) : events.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">لا يوجد أنشطة مسجلة حالياً</p>
          ) : (
            <div className="space-y-3">
              {events.map((evt) => (
                <div key={evt.id} className="p-4 rounded-xl border bg-card shadow-sm space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">{evt.action}</span>
                    <Badge variant="secondary">{evt.module}</Badge>
                  </div>
                  <p className="text-muted-foreground">{evt.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>بواسطة: {evt.performedBy || "النظام التلقائي"}</span>
                    <span>{new Date(evt.createdAt).toLocaleString("ar-SA")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
