import prisma from "@/lib/prisma";
import { createAuditLog } from "./audit.service";

export interface QuotationItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface QuotationInput {
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  validUntil: string;
  items: QuotationItemInput[];
  notes?: string;
  userId?: string;
  userName?: string;
}

export interface QuotationRecord {
  id: string;
  quotationNumber: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  validUntil: string;
  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "CONVERTED";
  items: QuotationItemInput[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  createdByUserName: string;
  createdAt: string;
}

const MOCK_QUOTATIONS: QuotationRecord[] = [
  {
    id: "QUO-1",
    quotationNumber: "QUO-2026-001",
    customerName: "شركة الوفاق للاستشارات والتطوير",
    customerPhone: "+966551122334",
    customerEmail: "info@wefaq.com",
    validUntil: new Date(Date.now() + 86400000 * 15).toISOString(),
    status: "SENT",
    items: [
      { productId: "p-1", productName: "شاشة ذكية Ultra HD 55", quantity: 5, unitPrice: 1800, total: 9000 },
    ],
    subtotal: 9000,
    taxAmount: 1350,
    totalAmount: 10350,
    notes: "عرض سعر خاص شاملاً التوصيل والتركيب خلال 3 أيام عمل",
    createdByUserName: "مسؤول المبيعات",
    createdAt: new Date().toISOString(),
  },
];

export async function getQuotationsOverview() {
  return {
    quotations: MOCK_QUOTATIONS,
    stats: {
      totalCount: MOCK_QUOTATIONS.length,
      sentCount: MOCK_QUOTATIONS.filter((q) => q.status === "SENT").length,
      totalQuotationValue: MOCK_QUOTATIONS.reduce((sum, q) => sum + q.totalAmount, 0),
    },
  };
}

export async function createQuotation(input: QuotationInput) {
  const quotationNumber = `QUO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  const subtotal = input.items.reduce((sum, i) => sum + i.total, 0);
  const taxAmount = subtotal * 0.15; // 15% VAT
  const totalAmount = subtotal + taxAmount;

  const newQuotation: QuotationRecord = {
    id: `QUO-${Date.now()}`,
    quotationNumber,
    customerName: input.customerName,
    customerPhone: input.customerPhone,
    customerEmail: input.customerEmail,
    validUntil: input.validUntil,
    status: "SENT",
    items: input.items,
    subtotal,
    taxAmount,
    totalAmount,
    notes: input.notes,
    createdByUserName: input.userName || "ممثل المبيعات",
    createdAt: new Date().toISOString(),
  };

  MOCK_QUOTATIONS.unshift(newQuotation);

  await createAuditLog({
    action: "إنشاء عرض سعر جديد",
    module: "ORDERS",
    entity: "Quotation",
    entityId: newQuotation.id,
    newValues: { quotationNumber, totalAmount, customerName: input.customerName },
    userId: input.userId,
    userName: input.userName,
    notes: `عرض سعر رقم ${quotationNumber} للعميل ${input.customerName}`,
  });

  return newQuotation;
}
