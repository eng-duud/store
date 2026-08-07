"use client";

import React, { useState } from "react";
import { DocumentEngine, DocumentPayload } from "./document-engine";
import { Printer, Download, FileSpreadsheet, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: DocumentPayload;
}

export function DocumentViewerModal({
  isOpen,
  onClose,
  payload,
}: DocumentViewerModalProps) {
  const [layout, setLayout] = useState<"A4_PORTRAIT" | "A4_LANDSCAPE" | "THERMAL">("A4_PORTRAIT");

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!payload.items || payload.items.length === 0) return;
    const headers = ["البند", "الكمية", "سعر الوحدة", "الإجمالي"];
    const rows = payload.items.map((i) => [
      `"${i.name.replace(/"/g, '""')}"`,
      i.quantity,
      i.unitPrice,
      i.total,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `${payload.title}_${payload.documentNumber || "report"}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white">
      {/* Printable Modal Container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-950 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:rounded-none">
        {/* Action Header Bar (Hidden during Print) */}
        <div className="flex items-center justify-between border-b p-4 bg-slate-50 dark:bg-slate-900 print:hidden">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              معاينة المستند والطباعة
            </h3>
            <span className="text-xs bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-semibold">
              {payload.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Format Selector */}
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value as any)}
              className="text-xs font-semibold bg-white dark:bg-slate-800 border rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="A4_PORTRAIT">A4 عمودي</option>
              <option value="A4_LANDSCAPE">A4 أفقي</option>
              <option value="THERMAL">إيصال حراري</option>
            </select>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="rounded-xl text-xs gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              تصدير CSV
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="rounded-xl text-xs gap-1.5 bg-primary"
            >
              <Printer className="w-4 h-4" />
              طباعة / PDF
            </Button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable View Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-100 dark:bg-slate-950 print:p-0 print:bg-white">
          <DocumentEngine payload={payload} layout={layout} />
        </div>
      </div>
    </div>
  );
}
