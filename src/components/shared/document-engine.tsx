"use client";

import * as React from "react";
import { useSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";

export type DocumentType =
  | "INVOICE"
  | "PURCHASE_ORDER"
  | "QUOTATION"
  | "RECEIPT_VOUCHER"
  | "EXPENSE_REPORT"
  | "INVENTORY_VALUATION"
  | "SALES_REPORT"
  | "CUSTOMER_STATEMENT"
  | "FINANCIAL_REPORT";

export interface DocumentLineItem {
  id?: string;
  code?: string;
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

export interface DocumentPayload {
  title: string;
  documentNumber: string;
  type: DocumentType;
  date: Date | string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  supplierName?: string;
  status?: string;
  items?: DocumentLineItem[];
  subtotal?: number;
  taxAmount?: number;
  discountAmount?: number;
  totalAmount?: number;
  notes?: string;
  reportSummary?: Record<string, string | number>;
}

interface DocumentEngineProps {
  payload: DocumentPayload;
  className?: string;
  layout?: "A4_PORTRAIT" | "A4_LANDSCAPE" | "THERMAL";
}

export function DocumentEngine({
  payload,
  className,
  layout = "A4_PORTRAIT",
}: DocumentEngineProps) {
  const { settings, formatCurrency } = useSettings();

  const formattedDate = new Date(payload.date).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={cn(
        "mx-auto bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-8 shadow-card border rounded-2xl print:shadow-none print:border-none print:p-0 print:m-0 print:w-full print:bg-white print:text-black",
        layout === "A4_PORTRAIT" && "max-w-[800px]",
        layout === "A4_LANDSCAPE" && "max-w-[1100px]",
        layout === "THERMAL" && "max-w-[320px] text-xs p-4",
        className
      )}
      dir="rtl"
    >
      {/* Printable Header with Single Source of Truth Store Settings */}
      <div className="flex items-start justify-between border-b pb-6 mb-6 print:pb-4 print:mb-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt={settings.name}
                className="h-10 max-w-[150px] object-contain print:h-8"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg print:border">
                {settings.name ? settings.name.charAt(0) : "م"}
              </div>
            )}
            <div>
              <h1 className="text-xl font-extrabold tracking-tight print:text-lg">
                {settings.name}
              </h1>
              {settings.taxNumber && (
                <p className="text-xs text-muted-foreground print:text-black">
                  الرقم الضريبي: <span dir="ltr">{settings.taxNumber}</span>
                </p>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground print:text-black leading-relaxed">
            {settings.address && <span>{settings.address} • </span>}
            {settings.phone && <span dir="ltr">{settings.phone} • </span>}
            {settings.email && <span>{settings.email}</span>}
          </p>
        </div>

        {/* Document Metadata Block */}
        <div className="text-left space-y-1">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary font-bold text-xs rounded-full print:border print:border-black print:text-black">
            {payload.title}
          </span>
          <p className="text-sm font-black tracking-tight text-foreground print:text-black">
            #{payload.documentNumber}
          </p>
          <p className="text-xs text-muted-foreground print:text-black">
            التاريخ: {formattedDate}
          </p>
          {payload.status && (
            <p className="text-xs font-semibold text-emerald-600 print:text-black">
              الحالة: {payload.status}
            </p>
          )}
        </div>
      </div>

      {/* Customer / Supplier Info Card if available */}
      {(payload.customerName || payload.supplierName) && (
        <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border print:border print:bg-white print:text-black">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 print:text-black">
            معلومات {payload.customerName ? "العميل" : "المورد"}:
          </h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="font-bold text-sm">
                {payload.customerName || payload.supplierName}
              </p>
              {payload.customerPhone && (
                <p className="text-muted-foreground print:text-black" dir="ltr">
                  هاتف: {payload.customerPhone}
                </p>
              )}
            </div>
            {payload.customerAddress && (
              <div>
                <p className="text-muted-foreground print:text-black">
                  العنوان: {payload.customerAddress}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Summary KPI Cards for Reports */}
      {payload.reportSummary && (
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3 print:grid-cols-4">
          {Object.entries(payload.reportSummary).map(([key, val]) => (
            <div
              key={key}
              className="p-3 rounded-xl border bg-slate-50 dark:bg-slate-800/50 text-center print:border print:bg-white"
            >
              <p className="text-[11px] text-muted-foreground print:text-black font-semibold mb-1">
                {key}
              </p>
              <p className="text-sm font-black text-foreground print:text-black">
                {typeof val === "number" ? formatCurrency(val) : val}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Table of Items / Report Data */}
      {payload.items && payload.items.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-xl border print:border-black">
          <table className="w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800 border-b print:bg-gray-200 print:text-black">
                <th className="p-3 font-bold">#</th>
                <th className="p-3 font-bold">الوصف / البند</th>
                <th className="p-3 font-bold text-center">الكمية</th>
                <th className="p-3 font-bold text-center">سعر الوحدة</th>
                <th className="p-3 font-bold text-left">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payload.items.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 print:hover:bg-transparent"
                >
                  <td className="p-3 text-muted-foreground print:text-black font-mono">
                    {idx + 1}
                  </td>
                  <td className="p-3 font-semibold text-foreground print:text-black">
                    {item.name}
                  </td>
                  <td className="p-3 text-center font-bold">{item.quantity}</td>
                  <td className="p-3 text-center">
                    {formatCurrency(item.unitPrice)}
                  </td>
                  <td className="p-3 text-left font-black text-foreground print:text-black">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Financial Totals Reconciliation Block */}
      {payload.totalAmount !== undefined && (
        <div className="mb-6 flex justify-end">
          <div className="w-64 space-y-2 text-xs border-t pt-3 print:border-black">
            {payload.subtotal !== undefined && (
              <div className="flex justify-between text-muted-foreground print:text-black">
                <span>المجموع الفرعي:</span>
                <span className="font-semibold">{formatCurrency(payload.subtotal)}</span>
              </div>
            )}
            {payload.discountAmount !== undefined && payload.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-600 print:text-black">
                <span>الخصم:</span>
                <span className="font-semibold">-{formatCurrency(payload.discountAmount)}</span>
              </div>
            )}
            {payload.taxAmount !== undefined && payload.taxAmount > 0 && (
              <div className="flex justify-between text-muted-foreground print:text-black">
                <span>ضريبة القيمة المضافة:</span>
                <span className="font-semibold">{formatCurrency(payload.taxAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold border-t pt-2 text-primary print:text-black">
              <span>الإجمالي الكلي:</span>
              <span className="text-base">{formatCurrency(payload.totalAmount)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Notes & Terms */}
      {payload.notes && (
        <div className="mb-6 text-xs text-muted-foreground print:text-black border-t pt-3">
          <span className="font-bold text-foreground print:text-black block mb-1">
            ملاحظات وشروط:
          </span>
          <p className="leading-relaxed whitespace-pre-line">{payload.notes}</p>
        </div>
      )}

      {/* Footer Branding & Audit Stamp */}
      <div className="border-t pt-4 text-center text-[10px] text-muted-foreground print:text-black flex items-center justify-between">
        <p>تم إصدار هذا المستند عبر نظام {settings.name} الرقمي ERP</p>
        <p dir="ltr">Printed: {new Date().toLocaleString("en-US")}</p>
      </div>
    </div>
  );
}
