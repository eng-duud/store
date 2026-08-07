"use client";

import React, { useEffect, useState } from "react";
import { useSettings } from "@/hooks/use-settings";
import { ShoppingCart, Truck, FileText, CheckCircle2, Clock, Plus, ArrowDownLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Supplier {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  taxNumber: string;
  paymentTerms: string;
  outstandingBalance: number;
  totalPurchasesCount: number;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierName: string;
  warehouseCode: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "RECEIVED" | "CANCELLED";
  totalAmount: number;
  notes?: string;
  createdByUserName: string;
  createdAt: string;
}

export default function AdminPurchasesPage() {
  const { formatCurrency } = useSettings();
  const [activeTab, setActiveTab] = useState<"orders" | "suppliers">("orders");
  const [isLoading, setIsLoading] = useState(true);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [kpis, setKpis] = useState<any>(null);

  const fetchProcurementData = async () => {
    setIsLoading(true);
    try {
      const resp = await fetch("/api/admin/procurement");
      const json = await resp.json();
      if (json.success) {
        setSuppliers(json.data.suppliers);
        setPurchaseOrders(json.data.purchaseOrders);
        setKpis(json.data.kpis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProcurementData();
  }, []);

  const handleReceiveGoods = async (poId: string) => {
    if (!confirm("هل أنت متأكد من استلام شحنة أمر الشراء وزيادة المخزون تلقائياً؟")) return;
    try {
      const resp = await fetch("/api/admin/procurement", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "RECEIVE", poId }),
      });
      const json = await resp.json();
      if (json.success) {
        alert("تم استلام البضائع وزيادة المخزون وتسجيل القيد المالي بنجاح!");
        fetchProcurementData();
      } else {
        alert(json.error || "حدث خطأ أثناء استلام البضائع");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Truck className="w-7 h-7 text-primary" />
            إدارة المشتريات والتوريد (Procure-to-Pay)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إدارة الموردين، أذونات الشراء، واستلام الشحنات وتحديث المخزون والقيد المالي تلقائياً
          </p>
        </div>
      </div>

      {/* KPI Stat Cards */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border bg-card p-4 shadow-card space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">إجمالي أذونات الشراء</span>
            <p className="text-2xl font-extrabold text-foreground">{kpis.totalPurchaseOrdersCount}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4 shadow-card space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">قيم أوامر الشراء</span>
            <p className="text-2xl font-extrabold text-primary">{formatCurrency(kpis.totalPOValue)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4 shadow-card space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">مستحقات الموردين القائمة</span>
            <p className="text-2xl font-extrabold text-amber-600">{formatCurrency(kpis.totalOutstandingPayable)}</p>
          </div>
          <div className="rounded-2xl border bg-card p-4 shadow-card space-y-1">
            <span className="text-xs text-muted-foreground font-semibold">الموردين النشطين</span>
            <p className="text-2xl font-extrabold text-foreground">{kpis.totalSuppliersCount}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-0">
        <button
          onClick={() => setActiveTab("orders")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "orders"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <FileText className="w-4 h-4" />
          أوامر الشراء ({purchaseOrders.length})
        </button>

        <button
          onClick={() => setActiveTab("suppliers")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "suppliers"
              ? "border-primary text-primary bg-primary/5"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Building2 className="w-4 h-4" />
          دليل الموردين ({suppliers.length})
        </button>
      </div>

      {/* Tab 1: Purchase Orders */}
      {activeTab === "orders" && (
        <div className="rounded-2xl border bg-card overflow-hidden shadow-card">
          <div className="p-4 border-b bg-slate-50 dark:bg-slate-900 flex items-center justify-between">
            <h3 className="font-bold text-sm">سجل أذونات وأوامر التوريد</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 border-b">
                  <th className="p-3 font-bold">رقم الأمر</th>
                  <th className="p-3 font-bold">المورد</th>
                  <th className="p-3 font-bold">المستودع</th>
                  <th className="p-3 font-bold">المبلغ الإجمالي</th>
                  <th className="p-3 font-bold">الحالة</th>
                  <th className="p-3 font-bold">التاريخ</th>
                  <th className="p-3 font-bold text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="p-3 font-bold font-mono text-primary">{po.poNumber}</td>
                    <td className="p-3 font-semibold">{po.supplierName}</td>
                    <td className="p-3 text-muted-foreground">{po.warehouseCode}</td>
                    <td className="p-3 font-black">{formatCurrency(po.totalAmount)}</td>
                    <td className="p-3">
                      {po.status === "RECEIVED" ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 font-bold gap-1">
                          <CheckCircle2 className="w-3 h-3" /> تم الاستلام والتوريد
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 gap-1">
                          <Clock className="w-3 h-3" /> بانتظار الاستلام
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(po.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="p-3 text-left">
                      {po.status !== "RECEIVED" && (
                        <Button
                          size="sm"
                          onClick={() => handleReceiveGoods(po.id)}
                          className="rounded-xl text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                        >
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                          استلام الشحنة (+المخزون)
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Suppliers Directory */}
      {activeTab === "suppliers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suppliers.map((sup) => (
            <div key={sup.id} className="rounded-2xl border bg-card p-5 shadow-card space-y-3">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{sup.name}</h3>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">رمز: {sup.code}</p>
                </div>
                <Badge variant="outline" className="font-bold">
                  {sup.paymentTerms}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                <div>
                  <span className="text-muted-foreground block">مسؤول التواصل:</span>
                  <span className="font-semibold">{sup.contactPerson}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">الهاتف:</span>
                  <span className="font-semibold" dir="ltr">{sup.phone}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">الرقم الضريبي:</span>
                  <span className="font-semibold" dir="ltr">{sup.taxNumber}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">الرصيد المستحق:</span>
                  <span className="font-bold text-amber-600">{formatCurrency(sup.outstandingBalance)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
