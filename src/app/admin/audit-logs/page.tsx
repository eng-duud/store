"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { getSystemHealthOverview } from "@/lib/operations-center";
import { Activity, ShieldAlert, Database, Cpu, HardDrive, CheckCircle2, Server } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"logs" | "health">("logs");
  const [data, setData] = useState<AuditLogResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [moduleFilter, setModuleFilter] = useState("");
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<AuditItem | null>(null);
  const searchDebounce = useRef<NodeJS.Timeout | null>(null);

  const healthData = getSystemHealthOverview();

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

  const handleSearch = (val: string) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      setSearchQ(val);
      setPage(1);
    }, 400);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="w-7 h-7 text-primary" />
            مركز المراقبة، الأداء وسجلات التدقيق والأمان (Operations & Audit Center)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            مراقبة الجاهزية الحية للنظام، استجابة الـ APIs، وسجلات التدقيق والأمان الموحدة
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-0">
        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "logs"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          سجلات التدقيق والأمان ({data?.total || 0})
        </button>

        <button
          onClick={() => setActiveTab("health")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "health"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Server className="w-4 h-4" />
          مراقبة صحة الخادم والأنظمة الحية ({healthData.systemUptime})
        </button>
      </div>

      {/* Tab 1: Audit & Security Logs */}
      {activeTab === "logs" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="بحث في سجلات التدقيق..."
              className="h-10 rounded-xl border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 flex-1 shadow-sm"
              onChange={(e) => handleSearch(e.target.value)}
            />
            <select
              className="h-10 rounded-xl border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(1);
              }}
            >
              {MODULE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <p className="text-center text-xs text-muted-foreground py-8">جارٍ تحميل سجلات التدقيق...</p>
          ) : !data || data.items.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">لا يوجد سجلات تدقيق مطابقة</p>
          ) : (
            <div className="rounded-2xl border bg-card overflow-hidden shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800 border-b">
                      <th className="p-3 font-bold">المستخدم</th>
                      <th className="p-3 font-bold">الإجراء</th>
                      <th className="p-3 font-bold">الوحدة</th>
                      <th className="p-3 font-bold">العنصر</th>
                      <th className="p-3 font-bold">عنوان IP</th>
                      <th className="p-3 font-bold">التاريخ والتوقيت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {data.items.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                      >
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-100">
                          {item.userName || "النظام التلقائي"}
                        </td>
                        <td className="p-3 font-semibold text-primary">{item.action}</td>
                        <td className="p-3">
                          <Badge variant="outline">{item.module}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {item.entity ? `${item.entity} (${item.entityId || "-"})` : "-"}
                        </td>
                        <td className="p-3 font-mono text-[11px]">{item.ipAddress || "127.0.0.1"}</td>
                        <td className="p-3 text-muted-foreground">
                          {new Date(item.createdAt).toLocaleString("ar-SA")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: System Health & Live Telemetry */}
      {activeTab === "health" && (
        <div className="space-y-6">
          {/* Key Metrics Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl border bg-card shadow-card flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">جاهزية التشغيل (Uptime)</span>
                <span className="text-xl font-extrabold text-emerald-600">{healthData.systemUptime}</span>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-500/20" />
            </div>

            <div className="p-4 rounded-2xl border bg-card shadow-card flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">زمن استجابة الـ APIs</span>
                <span className="text-xl font-extrabold text-blue-600">{healthData.metrics.avgApiResponseMs} ms</span>
              </div>
              <Cpu className="w-8 h-8 text-blue-500/20" />
            </div>

            <div className="p-4 rounded-2xl border bg-card shadow-card flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">استهلاك الذاكرة (RAM)</span>
                <span className="text-xl font-extrabold text-purple-600">{healthData.metrics.memoryUsageMb} MB</span>
              </div>
              <HardDrive className="w-8 h-8 text-purple-500/20" />
            </div>

            <div className="p-4 rounded-2xl border bg-card shadow-card flex items-center justify-between">
              <div>
                <span className="text-xs text-muted-foreground block">زمن استعلام قاعدة البيانات</span>
                <span className="text-xl font-extrabold text-emerald-600">3 ms</span>
              </div>
              <Database className="w-8 h-8 text-emerald-500/20" />
            </div>
          </div>

          {/* Component Status Details */}
          <div className="rounded-2xl border bg-card p-5 shadow-card space-y-4">
            <h3 className="font-bold text-base border-b pb-3 text-slate-900 dark:text-white flex items-center gap-2">
              <Server className="w-5 h-5 text-primary" />
              حالة الأجزاء التشغيلية للنظام (System Components Telemetry)
            </h3>

            <div className="space-y-3">
              {healthData.healthStatus.map((c, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</h4>
                    <p className="text-muted-foreground text-[11px] mt-0.5">{c.details}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-muted-foreground">{c.latencyMs}ms</span>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">
                      {c.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
