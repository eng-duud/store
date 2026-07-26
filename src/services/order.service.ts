import prisma from "@/lib/prisma";
import { generateOrderNumber } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import { getStoreSettings } from "./settings.service";
import { createAuditLog } from "./audit.service";

export async function createOrder(data: {
  userId: string;
  addressId: string;
  paymentMethod: "CASH_ON_DELIVERY" | "BANK_TRANSFER";
  notes?: string;
  cartItems: { productId: string; variantId?: string; quantity: number }[];
}) {
  const [address, settings] = await Promise.all([
    prisma.address.findFirst({
      where: { id: data.addressId, userId: data.userId },
    }),
    getStoreSettings(),
  ]);

  if (!address) throw new Error("Address not found");

  const shippingAddress = {
    label: address.label,
    street: address.street,
    city: address.city,
    state: address.state,
    zipCode: address.zipCode,
    country: address.country,
  };

  let subtotal = new Prisma.Decimal(0);
  const orderItemsData: {
    productId: string;
    variantId?: string;
    name: string;
    price: Prisma.Decimal;
    quantity: number;
  }[] = [];

  const stockUpdates: {
    type: "product" | "variant";
    id: string;
    quantity: number;
    productId: string;
  }[] = [];

  for (const item of data.cartItems) {
    if (item.variantId) {
      const variant = await prisma.productVariant.findUnique({
        where: { id: item.variantId },
        include: { product: true },
      });

      if (!variant || variant.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${variant?.name || "product"}`);
      }

      const price = variant.price || variant.product.price;
      const name = `${variant.product.name} - ${variant.name}`;

      orderItemsData.push({
        productId: item.productId,
        variantId: item.variantId,
        name,
        price,
        quantity: item.quantity,
      });

      subtotal = subtotal.add(new Prisma.Decimal(price).mul(item.quantity));
      stockUpdates.push({
        type: "variant",
        id: item.variantId,
        quantity: item.quantity,
        productId: item.productId,
      });
    } else {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.stockQuantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product?.name || "product"}`);
      }

      const price = product.salePrice || product.price;

      orderItemsData.push({
        productId: item.productId,
        name: product.name,
        price,
        quantity: item.quantity,
      });

      subtotal = subtotal.add(new Prisma.Decimal(price).mul(item.quantity));
      stockUpdates.push({
        type: "product",
        id: item.productId,
        quantity: item.quantity,
        productId: item.productId,
      });
    }
  }

  const taxPercentage = parseFloat(settings.taxPercentage) || 0;
  const taxRate = new Prisma.Decimal(taxPercentage / 100);
  const shippingCost = new Prisma.Decimal(0);
  const tax = subtotal.mul(taxRate);
  const total = subtotal.add(shippingCost).add(tax);
  const orderNumber = generateOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    for (const update of stockUpdates) {
      if (update.type === "variant") {
        await tx.productVariant.update({
          where: { id: update.id },
          data: { stockQuantity: { decrement: update.quantity } },
        });
        await tx.inventoryTransaction.create({
          data: {
            productId: update.productId,
            variantId: update.id,
            type: "SALE",
            quantity: -update.quantity,
            reference: orderNumber,
            notes: `خصم مخزون تلقائي - طلب ${orderNumber}`,
          },
        });
      } else {
        await tx.product.update({
          where: { id: update.id },
          data: { stockQuantity: { decrement: update.quantity } },
        });
        await tx.inventoryTransaction.create({
          data: {
            productId: update.productId,
            type: "SALE",
            quantity: -update.quantity,
            reference: orderNumber,
            notes: `خصم مخزون تلقائي - طلب ${orderNumber}`,
          },
        });
      }
    }

    const createdOrder = await tx.order.create({
      data: {
        userId: data.userId,
        orderNumber,
        status: "PENDING",
        subtotal,
        shippingCost,
        tax,
        total,
        shippingAddress,
        paymentMethod: data.paymentMethod,
        paymentStatus: "PENDING",
        notes: data.notes,
        items: {
          create: orderItemsData,
        },
        timeline: {
          create: { status: "PENDING", note: "تم استلام الطلب" },
        },
      },
      include: {
        items: true,
        timeline: true,
      },
    });

    return createdOrder;
  });

  await createAuditLog({
    action: "إنشاء طلب جديد",
    module: "ORDERS",
    entity: "Order",
    entityId: order.id,
    newValues: {
      orderNumber: order.orderNumber,
      total: Number(order.total),
      itemsCount: order.items.length,
      paymentMethod: order.paymentMethod,
    },
    userId: data.userId,
    notes: `طلب جديد رقم ${orderNumber} بقيمة ${Number(total)} (${settings.currencySymbol})`,
  });

  return order;
}

export async function getOrderById(orderId: string, userId?: string) {
  const where: Prisma.OrderWhereInput = { id: orderId };
  if (userId) where.userId = userId;

  return prisma.order.findFirst({
    where,
    include: {
      items: {
        include: { product: { include: { images: { take: 1 } } } },
      },
      timeline: { orderBy: { createdAt: "desc" } },
      user: { select: { name: true, email: true, phone: true } },
    },
  });
}

export async function getUserOrders(userId: string, page = 1, limit = 10) {
  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      include: {
        items: { select: { name: true, quantity: true, price: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where: { userId } }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
  note?: string,
  userId?: string,
  userName?: string
) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found");

  const oldStatus = order.status;

  if ((status === "CANCELLED" || status === "RETURNED") && oldStatus !== "CANCELLED" && oldStatus !== "RETURNED") {
    for (const item of await prisma.orderItem.findMany({
      where: { orderId },
    })) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stockQuantity: { increment: item.quantity } },
        });
        await prisma.inventoryTransaction.create({
          data: {
            productId: item.productId,
            variantId: item.variantId,
            type: status === "CANCELLED" ? "CANCELLATION" : "RETURN",
            quantity: item.quantity,
            reference: `Order ${order.orderNumber} ${status === "CANCELLED" ? "cancelled" : "returned"}`,
            notes: `${status === "CANCELLED" ? "إلغاء" : "استرجاع"} الطلب ${order.orderNumber}`,
            performedBy: userId || null,
            performedByName: userName || null,
          },
        });
      } else {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
        await prisma.inventoryTransaction.create({
          data: {
            productId: item.productId,
            type: status === "CANCELLED" ? "CANCELLATION" : "RETURN",
            quantity: item.quantity,
            reference: `Order ${order.orderNumber} ${status === "CANCELLED" ? "cancelled" : "returned"}`,
            notes: `${status === "CANCELLED" ? "إلغاء" : "استرجاع"} الطلب ${order.orderNumber}`,
            performedBy: userId || null,
            performedByName: userName || null,
          },
        });
      }
    }
  }

  const orderStatus = status as "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";

  const [updatedOrder] = await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: {
        status: orderStatus,
        paymentStatus:
          status === "DELIVERED"
            ? "PAID"
            : status === "CANCELLED"
              ? "FAILED"
              : undefined,
      },
    }),
    prisma.orderTimeline.create({
      data: {
        orderId,
        status: orderStatus,
        note,
      },
    }),
  ]);

  await createAuditLog({
    action: `تغيير حالة الطلب إلى ${status}`,
    module: "ORDERS",
    entity: "Order",
    entityId: orderId,
    oldValues: { status: oldStatus },
    newValues: { status },
    userId,
    userName,
    notes: `تحديث حالة الطلب ${order.orderNumber} من ${oldStatus} إلى ${status}`,
  });

  return updatedOrder;
}

export async function getAllOrders(filters: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;

  const where: Prisma.OrderWhereInput = {};

  if (filters.search) {
    where.OR = [
      { orderNumber: { contains: filters.search, mode: "insensitive" } },
      { user: { name: { contains: filters.search, mode: "insensitive" } } },
      { user: { email: { contains: filters.search, mode: "insensitive" } } },
    ];
  }

  if (filters.status) {
    where.status = filters.status as "PENDING" | "CONFIRMED" | "PREPARING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "RETURNED";
  }

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: { select: { name: true, quantity: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
