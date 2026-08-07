"use client";

import React, { useState, useEffect } from "react";
import {
  GitMerge,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  UserCheck,
  Building2,
  FileText,
  AlertTriangle,
  Send,
  PlusCircle,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Decision {
  id: string;
  stepNumber: number;
  approverName: string;
  approverPositionCode: string;
  action: "APPROVE" | "REJECT" | "RETURN" | "DELEGATE";
  comments?: string;
  createdAt: string;
}

interface ApprovalRequestItem {
  id: string;
  documentType: string;
  documentId: string;
  documentNumber: string;
  amount: number;
  requesterName: string;
  currentStepNumber: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "RETURNED" | "EXPIRED";
  notes?: string;
  createdAt: string;
  decisions: Decision[];
}

export default function AdminApprovalsInboxPage() {
  const [requests, setRequests] = useState<ApprovalRequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "all" | "approved" | "rejected" | "returned">("pending");
  const [selectedReq, setSelectedReq] = useState<ApprovalRequestItem | null>(null);
  const [decisionAction, setDecisionAction] = useState<"APPROVE" | "REJECT" | "RETURN" | null>(null);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/approvals");
      const data = await res.json();
      if (data.success) {
        setRequests(data.requests);
      }
    } catch (err) {
      console.error("Failed to load approval requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcessDecision = async () => {
    if (!selectedReq || !decisionAction) return;
    try {
      setSubmitting(true);
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionType: "DECISION",
          requestId: selectedReq.id,
          approverId: "curr-user-id",
          approverName: "مدير الشؤون المالية",
          approverPositionCode: "FINANCE_MANAGER",
          action: decisionAction,
          comments: commentText || undefined,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedReq(null);
        setDecisionAction(null);
        setCommentText("");
        fetchRequests();
      }
    } catch (err) {
      console.error("Failed to process decision:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (activeTab === "pending") return r.status === "PENDING";
    if (activeTab === "approved") return r.status === "APPROVED";
    if (activeTab === "rejected") return r.status === "REJECTED";
    if (activeTab === "returned") return r.status === "RETURNED";
    return true;
  });

  const getDocTypeBadge = (type: string) => {
    switch (type) {
      case "PURCHASE_ORDER":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/20 font-bold">أمر شراء</Badge>;
      case "EXPENSE_VOUCHER":
        return <Badge className="bg-purple-500/10 text-purple-600 border-purple-500/20 font-bold">سند صرف</Badge>;
      case "INVENTORY_ADJUSTMENT":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold">تسوية مخزنية</Badge>;
      case "SALES_DISCOUNT":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold">خصم مبيعات</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20 font-bold gap-1"><Clock className="w-3 h-3"/> بانتظار الاعتماد</Badge>;
      case "APPROVED":
        return <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold gap-1"><CheckCircle2 className="w-3 h-3"/> معتمد رسمياً</Badge>;
      case "REJECTED":
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20 font-bold gap-1"><XCircle className="w-3 h-3"/> مرفوض</Badge>;
      case "RETURNED":
        return <Badge className="bg-sky-500/10 text-sky-600 border-sky-500/20 font-bold gap-1"><RotateCcw className="w-3 h-3"/> أعيد للمراجعة</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <GitMerge className="w-7 h-7 text-primary" />
            مركز إدارة الموافقات والسلاسل الإدارية (Approval Inbox & Engine)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            متابعة وإقرار طلبات الشراء، سندات المصروفات، التسويات المخزنية والخصومات عبر السلسلة التنظيمية
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs px-3 py-1 font-mono font-bold bg-card">
            معاملات معلقة: {requests.filter((r) => r.status === "PENDING").length}
          </Badge>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border bg-card p-4 shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">طلبات تنتظر اعتمادك</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {requests.filter((r) => r.status === "PENDING").length}
            </h3>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">تمت الموافقة والاعتماد</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {requests.filter((r) => r.status === "APPROVED").length}
            </h3>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-500/10 text-red-600">
            <XCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">طلبات مرفوضة</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {requests.filter((r) => r.status === "REJECTED").length}
            </h3>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4 shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-600">
            <RotateCcw className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold">أعيدت للتعديل والمراجعة</p>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {requests.filter((r) => r.status === "RETURNED").length}
            </h3>
          </div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex gap-2 border-b pb-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "pending"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Clock className="w-4 h-4" />
          بانتظار الاعتماد ({requests.filter((r) => r.status === "PENDING").length})
        </button>

        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "all"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4" />
          كافة المعاملات ({requests.length})
        </button>

        <button
          onClick={() => setActiveTab("approved")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "approved"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          المعتمدة ({requests.filter((r) => r.status === "APPROVED").length})
        </button>

        <button
          onClick={() => setActiveTab("rejected")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer shrink-0 ${
            activeTab === "rejected"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <XCircle className="w-4 h-4" />
          المرفوضة ({requests.filter((r) => r.status === "REJECTED").length})
        </button>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="p-8 text-center text-muted-foreground font-semibold">جاري تحميل سجلات الاعتماد...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border bg-card text-muted-foreground">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="font-bold text-base text-slate-800 dark:text-slate-200">لا يوجد معاملات معلقة في هذا التبويب</h3>
          <p className="text-xs mt-1">كافة الطلبات تم إقرارها وحفظها في السجل التاريخي بنجاح.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="rounded-2xl border bg-card p-5 shadow-card space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                <div className="flex items-center gap-3">
                  {getDocTypeBadge(req.documentType)}
                  <span className="font-bold font-mono text-base text-slate-900 dark:text-white">
                    {req.documentNumber}
                  </span>
                  {getStatusBadge(req.status)}
                </div>
                <div className="text-left font-bold text-base text-primary">
                  {Number(req.amount).toLocaleString("ar-SA")} ر.س
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block mb-0.5 font-semibold">صاحب الطلب:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{req.requesterName}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5 font-semibold">تاريخ التقديم:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {new Date(req.createdAt).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block mb-0.5 font-semibold">ملاحظات / البيان:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                    {req.notes || "لا يوجد ملاحظات إضافية"}
                  </span>
                </div>
              </div>

              {/* History Decisions / Timeline */}
              {req.decisions && req.decisions.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl space-y-2 border">
                  <span className="text-[11px] font-bold text-muted-foreground block">
                    قرارات الاعتماد الموثقة بالسلسلة:
                  </span>
                  <div className="space-y-1.5">
                    {req.decisions.map((d) => (
                      <div key={d.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{d.approverName}</span>
                          <Badge variant="outline" className="text-[10px]">{d.approverPositionCode}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">{d.comments}</span>
                          <Badge className={d.action === "APPROVE" ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}>
                            {d.action === "APPROVE" ? "موافقة" : d.action === "REJECT" ? "رفض" : "مراجعة"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approval Actions bar for PENDING requests */}
              {req.status === "PENDING" && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t justify-end">
                  <button
                    onClick={() => {
                      setSelectedReq(req);
                      setDecisionAction("APPROVE");
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    اعتماد وموافقة
                  </button>

                  <button
                    onClick={() => {
                      setSelectedReq(req);
                      setDecisionAction("RETURN");
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    إعادة للتعديل والمراجعة
                  </button>

                  <button
                    onClick={() => {
                      setSelectedReq(req);
                      setDecisionAction("REJECT");
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-all cursor-pointer shadow-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    رفض الطلب
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Decision Action Modal Dialog */}
      {selectedReq && decisionAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-card border rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4" dir="rtl">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              {decisionAction === "APPROVE" && <CheckCircle2 className="w-6 h-6 text-emerald-500" />}
              {decisionAction === "REJECT" && <XCircle className="w-6 h-6 text-red-500" />}
              {decisionAction === "RETURN" && <RotateCcw className="w-6 h-6 text-sky-500" />}
              تأكيد قرار الاعتماد: {selectedReq.documentNumber}
            </h3>

            <p className="text-xs text-muted-foreground">
              أنت على وشك تنفيذ قرار <strong className="text-foreground">{decisionAction === "APPROVE" ? "الموافقة والاعتماد" : decisionAction === "REJECT" ? "الرفض" : "الإعادة للمراجعة"}</strong> للمعاملة بقيمة <strong>{Number(selectedReq.amount).toLocaleString("ar-SA")} ر.س</strong>.
            </p>

            <div>
              <label className="block text-xs font-bold mb-1">ملاحظات القرار والتعليقات الرسمية:</label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="اكتب ملاحظات الاعتماد أو أسباب الرفض/الإعادة..."
                className="w-full rounded-xl border p-3 text-xs bg-background min-h-[90px] outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                disabled={submitting}
                onClick={() => {
                  setSelectedReq(null);
                  setDecisionAction(null);
                }}
                className="px-4 py-2 rounded-xl border text-xs font-semibold hover:bg-accent cursor-pointer"
              >
                إلغاء
              </button>
              <button
                disabled={submitting}
                onClick={handleProcessDecision}
                className={`px-5 py-2 rounded-xl text-white font-bold text-xs cursor-pointer ${
                  decisionAction === "APPROVE" ? "bg-emerald-600 hover:bg-emerald-700" : decisionAction === "REJECT" ? "bg-red-600 hover:bg-red-700" : "bg-sky-600 hover:bg-sky-700"
                }`}
              >
                {submitting ? "جاري الاعتماد..." : "تأكيد وإرسال القرار"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
