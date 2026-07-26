import prisma from "@/lib/prisma";
import { createAuditLog } from "./audit.service";
import { adjustStock } from "./inventory.service";
import { getStoreSettings, formatCurrency } from "./settings.service";

export async function onOrderCreated(orderId: string, userId?: string, userName?: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });

  if (!order) return;

  const settings = await getStoreSettings();

  for (const item of order.items) {
    try {
      await adjustStock({
        productId: item.productId,
        variantId: item.variantId || undefined,
        type: "SALE",
        quantity: item.quantity,
        reference: order.orderNumber,
        notes: `خصم مخزون تلقائي للطلب رقم ${order.orderNumber}`,
        userId,
        userName,
      });
    } catch (e) {
      console.error(`Failed to adjust stock for product ${item.productId} on order ${order.orderNumber}:`, e);
    }
  }

  await createAuditLog({
    action: "إنشاء طلب جديد",
    module: "ORDERS",
    entity: "Order",
    entityId: order.id,
    newValues: { orderNumber: order.orderNumber, total: Number(order.total), itemsCount: order.items.length },
    userId: userId || order.userId,
    userName: userName || order.user?.name,
    notes: `طلب جديد رقم ${order.orderNumber} بقيمة ${formatCurrency(Number(order.total), settings)}`,
  });
}

export async function onOrderStatusChanged(
  orderId: string,
  oldStatus: string,
  newStatus: string,
  userId?: string,
  userName?: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true, user: true },
  });

  if (!order) return;

  if (
    (newStatus === "CANCELLED" || newStatus === "RETURNED") &&
    oldStatus !== "CANCELLED" &&
    oldStatus !== "RETURNED"
  ) {
    for (const item of order.items) {
      try {
        await adjustStock({
          productId: item.productId,
          variantId: item.variantId || undefined,
          type: newStatus === "CANCELLED" ? "CANCELLATION" : "RETURN",
          quantity: item.quantity,
          reference: order.orderNumber,
          notes: `إرجاع مخزون تلقائي بسبب ${newStatus === "CANCELLED" ? "إلغاء الطلب" : "استرجاع الطلب"} رقم ${order.orderNumber}`,
          userId,
          userName,
        });
      } catch (e) {
        console.error(`Failed to restore stock for product ${item.productId}:`, e);
      }
    }
  }

  await createAuditLog({
    action: `تغيير حالة الطلب إلى ${newStatus}`,
    module: "ORDERS",
    entity: "Order",
    entityId: order.id,
    oldValues: { status: oldStatus },
    newValues: { status: newStatus },
    userId,
    userName,
    notes: `تحديث حالة الطلب ${order.orderNumber} من ${oldStatus} إلى ${newStatus}`,
  });
}
