import prisma from "@/lib/prisma";
import { createAuditLog } from "./audit.service";

export type InventoryTransactionType =
  | "PURCHASE"
  | "SALE"
  | "ADJUSTMENT"
  | "RETURN"
  | "CANCELLATION"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "DAMAGED_GOODS"
  | "EXPIRED_GOODS";

export interface StockAdjustmentInput {
  productId: string;
  variantId?: string;
  type: InventoryTransactionType;
  quantity: number;
  notes?: string;
  reference?: string;
  userId?: string;
  userName?: string;
  warehouseCode?: string;
}

export async function getInventoryOverview(options?: {
  search?: string;
  status?: "ALL" | "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";
  page?: number;
  limit?: number;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;

  const where: any = {
    deletedAt: null,
  };

  if (options?.search) {
    where.OR = [
      { name: { contains: options.search, mode: "insensitive" } },
      { sku: { contains: options.search, mode: "insensitive" } },
    ];
  }

  if (options?.status && options.status !== "ALL") {
    if (options.status === "OUT_OF_STOCK") {
      where.stockQuantity = { lte: 0 };
    } else if (options.status === "LOW_STOCK") {
      where.stockQuantity = { gt: 0, lte: 10 };
    } else if (options.status === "IN_STOCK") {
      where.stockQuantity = { gt: 10 };
    }
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { take: 1 },
        categories: { include: { category: true } },
        variants: true,
        orderItems: {
          where: {
            order: {
              status: { in: ["PENDING", "CONFIRMED", "PREPARING"] },
            },
          },
          select: { quantity: true },
        },
      },
      orderBy: { stockQuantity: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const allProducts = await prisma.product.findMany({
    where: { deletedAt: null },
    select: {
      stockQuantity: true,
      lowStockThreshold: true,
      price: true,
      costPrice: true,
    },
  });

  let totalStockCount = 0;
  let outOfStockCount = 0;
  let lowStockCount = 0;
  let totalCostValue = 0;
  let totalRetailValue = 0;

  allProducts.forEach((p: { stockQuantity: number; lowStockThreshold: number | null; price: any; costPrice: any }) => {
    totalStockCount += p.stockQuantity;
    if (p.stockQuantity <= 0) outOfStockCount++;
    else if (p.stockQuantity <= (p.lowStockThreshold || 10)) lowStockCount++;

    totalCostValue += Number(p.costPrice || 0) * p.stockQuantity;
    totalRetailValue += Number(p.price || 0) * p.stockQuantity;
  });

  const formattedProducts = products.map((p: any) => {
    const reservedStock = p.orderItems.reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0);
    const availableStock = Math.max(0, p.stockQuantity - reservedStock);

    let stockStatus: "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" = "IN_STOCK";
    if (p.stockQuantity <= 0) stockStatus = "OUT_OF_STOCK";
    else if (p.stockQuantity <= (p.lowStockThreshold || 10)) stockStatus = "LOW_STOCK";

    return {
      id: p.id,
      name: p.name,
      sku: p.sku,
      image: p.images[0]?.url || null,
      categories: p.categories.map((c: { category: { name: string } }) => c.category.name),
      price: Number(p.price),
      costPrice: p.costPrice ? Number(p.costPrice) : null,
      stockQuantity: p.stockQuantity,
      reservedStock,
      availableStock,
      lowStockThreshold: p.lowStockThreshold,
      stockStatus,
      warehouseCode: "WH-MAIN",
      updatedAt: p.updatedAt,
    };
  });

  return {
    products: formattedProducts,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    stats: {
      totalProductsCount: allProducts.length,
      totalStockCount,
      outOfStockCount,
      lowStockCount,
      totalCostValue,
      totalRetailValue,
      expectedProfit: totalRetailValue - totalCostValue,
      defaultWarehouse: "المستودع الرئيسي (WH-MAIN)",
    },
  };
}

export async function adjustStock(input: StockAdjustmentInput) {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
  });

  if (!product) {
    throw new Error("المنتج غير موجود");
  }

  const oldQuantity = product.stockQuantity;
  let newQuantity = oldQuantity;

  switch (input.type) {
    case "PURCHASE":
    case "RETURN":
    case "CANCELLATION":
    case "TRANSFER_IN":
      newQuantity = oldQuantity + Math.abs(input.quantity);
      break;

    case "SALE":
    case "DAMAGED_GOODS":
    case "EXPIRED_GOODS":
    case "TRANSFER_OUT":
      newQuantity = Math.max(0, oldQuantity - Math.abs(input.quantity));
      break;

    case "ADJUSTMENT":
      newQuantity = Math.max(0, input.quantity);
      break;
  }

  const diff = newQuantity - oldQuantity;

  const [updatedProduct, transaction] = await prisma.$transaction([
    prisma.product.update({
      where: { id: input.productId },
      data: { stockQuantity: newQuantity },
    }),
    prisma.inventoryTransaction.create({
      data: {
        productId: input.productId,
        variantId: input.variantId || null,
        type: input.type as any,
        quantity: Math.abs(diff),
        oldQuantity,
        newQuantity,
        reference: input.reference || null,
        notes: input.notes || null,
        performedBy: input.userId || null,
        performedByName: input.userName || null,
      },
    }),
  ]);

  await createAuditLog({
    action: `تعديل مخزون: ${input.type}`,
    module: "INVENTORY",
    entity: "Product",
    entityId: input.productId,
    oldValues: { stockQuantity: oldQuantity },
    newValues: { stockQuantity: newQuantity, diff },
    userId: input.userId,
    userName: input.userName,
    notes: input.notes || `تعديل مخزون للمنتج ${product.name}`,
  });

  return { product: updatedProduct, transaction };
}

export async function getInventoryTransactions(options?: {
  productId?: string;
  type?: InventoryTransactionType;
  page?: number;
  limit?: number;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;

  const where: any = {};
  if (options?.productId) where.productId = options.productId;
  if (options?.type) where.type = options.type;

  const [items, total] = await Promise.all([
    prisma.inventoryTransaction.findMany({
      where,
      include: {
        product: { select: { id: true, name: true, sku: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.inventoryTransaction.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
