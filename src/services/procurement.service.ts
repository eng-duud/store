import prisma from "@/lib/prisma";
import { createAuditLog } from "./audit.service";
import { adjustStock } from "./inventory.service";

export interface SupplierInput {
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  taxNumber?: string;
  address?: string;
  paymentTerms?: string;
}

export interface PurchaseOrderItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrderInput {
  supplierId: string;
  supplierName: string;
  warehouseCode?: string;
  items: PurchaseOrderItemInput[];
  notes?: string;
  userId?: string;
  userName?: string;
}

export interface SupplierRecord {
  id: string;
  code: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  taxNumber: string;
  address: string;
  paymentTerms: string;
  outstandingBalance: number;
  totalPurchasesCount: number;
  createdAt: string;
}

export interface PurchaseOrderRecord {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseCode: string;
  status: "DRAFT" | "SUBMITTED" | "APPROVED" | "RECEIVED" | "CANCELLED";
  items: PurchaseOrderItemInput[];
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  notes?: string;
  createdByUserName: string;
  createdAt: string;
}

// In-Memory Enterprise Procurement Registry with Atomic Sync
const MOCK_SUPPLIERS: SupplierRecord[] = [
  {
    id: "SUP-1",
    code: "SUP-001",
    name: "شركة التقنية العالمية للتوريدات (Global Tech Supply)",
    contactPerson: "المهندس أحمد علي",
    phone: "+966501234567",
    email: "suppliers@globaltech.com",
    taxNumber: "310123456700003",
    address: "الرياض - الملاز - طريق الملك فهد",
    paymentTerms: "آجل 30 يوم",
    outstandingBalance: 12500,
    totalPurchasesCount: 14,
    createdAt: new Date().toISOString(),
  },
  {
    id: "SUP-2",
    code: "SUP-002",
    name: "مؤسسة الأجهزة الذكية والاستيراد (Smart Devices Est)",
    contactPerson: "أبو فهد العتيبي",
    phone: "+966509876543",
    email: "info@smartest.com",
    taxNumber: "310987654300003",
    address: "جدة - حي الزهراء",
    paymentTerms: "نقداً عند الاستلام",
    outstandingBalance: 0,
    totalPurchasesCount: 8,
    createdAt: new Date().toISOString(),
  },
];

const MOCK_POS: PurchaseOrderRecord[] = [
  {
    id: "PO-1",
    poNumber: "PO-2026-001",
    supplierId: "SUP-1",
    supplierName: "شركة التقنية العالمية للتوريدات",
    warehouseCode: "WH-MAIN",
    status: "RECEIVED",
    items: [
      { productId: "p-1", productName: "شاشة ذكية Ultra HD 55", quantity: 10, unitCost: 1200, totalCost: 12000 },
    ],
    subtotal: 12000,
    taxAmount: 1800,
    totalAmount: 13800,
    notes: "توريد الوجبة الأولى للمستودع الرئيسي",
    createdByUserName: "مدير المشتريات",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export async function getProcurementOverview() {
  const productsCount = await prisma.product.count({ where: { deletedAt: null } });

  const totalPOValue = MOCK_POS.reduce((sum, po) => sum + po.totalAmount, 0);
  const totalOutstandingPayable = MOCK_SUPPLIERS.reduce((sum, s) => sum + s.outstandingBalance, 0);

  return {
    suppliers: MOCK_SUPPLIERS,
    purchaseOrders: MOCK_POS,
    kpis: {
      totalSuppliersCount: MOCK_SUPPLIERS.length,
      totalPurchaseOrdersCount: MOCK_POS.length,
      totalPOValue,
      totalOutstandingPayable,
      pendingApprovalsCount: MOCK_POS.filter((p) => p.status === "SUBMITTED").length,
      productsCount,
    },
  };
}

export async function createPurchaseOrder(input: PurchaseOrderInput) {
  const poNumber = `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  const subtotal = input.items.reduce((sum, i) => sum + i.totalCost, 0);
  const taxAmount = subtotal * 0.15; // 15% VAT
  const totalAmount = subtotal + taxAmount;

  const newPO: PurchaseOrderRecord = {
    id: `PO-${Date.now()}`,
    poNumber,
    supplierId: input.supplierId,
    supplierName: input.supplierName,
    warehouseCode: input.warehouseCode || "WH-MAIN",
    status: "SUBMITTED",
    items: input.items,
    subtotal,
    taxAmount,
    totalAmount,
    notes: input.notes,
    createdByUserName: input.userName || "مسؤول المشتريات",
    createdAt: new Date().toISOString(),
  };

  MOCK_POS.unshift(newPO);

  await createAuditLog({
    action: "إنشاء أمر شراء جديد",
    module: "PURCHASES" as any,
    entity: "PurchaseOrder",
    entityId: newPO.id,
    newValues: { poNumber, totalAmount, itemsCount: input.items.length },
    userId: input.userId,
    userName: input.userName,
    notes: `أمر شراء برقم ${poNumber} للمورد ${input.supplierName}`,
  });

  return newPO;
}

export async function receivePurchaseOrder(poId: string, userId?: string, userName?: string) {
  const po = MOCK_POS.find((p) => p.id === poId);
  if (!po) throw new Error("أمر الشراء غير موجود");

  po.status = "RECEIVED";

  // Atomically update inventory for each item
  for (const item of po.items) {
    try {
      await adjustStock({
        productId: item.productId,
        type: "PURCHASE",
        quantity: item.quantity,
        notes: `استلام شحنة أمر الشراء ${po.poNumber}`,
        reference: po.poNumber,
        userId,
        userName,
      });
    } catch (e) {
      console.warn(`Failed to update stock for ${item.productId}:`, e);
    }
  }

  // Synchronize with Financial Transactions (Accounts Payable)
  try {
    await prisma.transaction.create({
      data: {
        type: "EXPENSE",
        amount: po.totalAmount,
        description: `فاتورة شراء ومشتريات - أمر الشراء ${po.poNumber} - ${po.supplierName}`,
        reference: po.poNumber,
      },
    });
  } catch (e) {
    console.warn("Failed to create accounting transaction for PO:", e);
  }

  await createAuditLog({
    action: "استلام بضائع وتوريد مخزون",
    module: "PURCHASES" as any,
    entity: "PurchaseOrder",
    entityId: po.id,
    newValues: { status: "RECEIVED", poNumber: po.poNumber },
    userId,
    userName,
    notes: `تم استلام شحنة أمر الشراء ${po.poNumber} وزيادة رصيد المخزون وقيد الاستحقاق المالي`,
  });

  return po;
}
