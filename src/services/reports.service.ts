import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type DateRangePreset = "today" | "yesterday" | "week" | "month" | "year" | "all";

export function getDateRangeBounds(preset: DateRangePreset, customStart?: string, customEnd?: string) {
  const now = new Date();
  let start = new Date(0); // Beginning of time default
  let end = new Date();

  switch (preset) {
    case "today": {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      break;
    }
    case "yesterday": {
      const y = new Date(now);
      y.setDate(y.getDate() - 1);
      start = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 0, 0, 0);
      end = new Date(y.getFullYear(), y.getMonth(), y.getDate(), 23, 59, 59);
      break;
    }
    case "week": {
      const w = new Date(now);
      w.setDate(w.getDate() - 7);
      start = new Date(w.getFullYear(), w.getMonth(), w.getDate(), 0, 0, 0);
      break;
    }
    case "month": {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
      break;
    }
    case "year": {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
      break;
    }
    case "all":
    default: {
      if (customStart) start = new Date(customStart);
      if (customEnd) end = new Date(customEnd);
      break;
    }
  }

  return { start, end };
}

export async function getReportsSummary(preset: DateRangePreset = "month") {
  const { start, end } = getDateRangeBounds(preset);

  const orderWhere: Prisma.OrderWhereInput = {
    createdAt: { gte: start, lte: end },
    status: { notIn: ["CANCELLED", "RETURNED"] },
  };

  const [
    deliveredOrders,
    pendingOrdersCount,
    cancelledOrdersCount,
    allOrdersCount,
    totalExpensesResult,
    totalCustomersCount,
    totalProductsCount,
    lowStockCount,
    recentOrders,
    topProductsRaw,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: orderWhere,
      _sum: { total: true },
      _count: { id: true },
      _avg: { total: true },
    }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.order.count({ where: { createdAt: { gte: start, lte: end } } }),
    prisma.expense.aggregate({
      where: { date: { gte: start, lte: end } },
      _sum: { amount: true },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.product.count({ where: { deletedAt: null, stockQuantity: { lte: 10 } } }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.orderItem.groupBy({
      by: ["productId", "name"],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const totalRevenue = Number(deliveredOrders._sum.total || 0);
  const totalExpenses = Number(totalExpensesResult._sum.amount || 0);
  const estimatedProfit = totalRevenue - totalExpenses;
  const averageOrderValue = Number(deliveredOrders._avg.total || 0);

  return {
    totalRevenue,
    totalExpenses,
    estimatedProfit,
    averageOrderValue,
    completedOrdersCount: deliveredOrders._count.id || 0,
    pendingOrdersCount,
    cancelledOrdersCount,
    allOrdersCount,
    totalCustomersCount,
    totalProductsCount,
    lowStockCount,
    recentOrders,
    topProducts: topProductsRaw.map((p) => ({
      productId: p.productId,
      name: p.name,
      totalQuantity: p._sum.quantity || 0,
      totalSales: Number(p._sum.price || 0) * (p._sum.quantity || 0),
    })),
  };
}

export async function getSalesReport(preset: DateRangePreset = "month") {
  const { start, end } = getDateRangeBounds(preset);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: start, lte: end },
      status: { notIn: ["CANCELLED", "RETURNED"] },
    },
    include: {
      items: true,
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Sales trend by date
  const salesByDateMap: Record<string, { revenue: number; ordersCount: number }> = {};
  orders.forEach((o) => {
    const dateStr = new Date(o.createdAt).toISOString().split("T")[0];
    if (!salesByDateMap[dateStr]) {
      salesByDateMap[dateStr] = { revenue: 0, ordersCount: 0 };
    }
    salesByDateMap[dateStr].revenue += Number(o.total);
    salesByDateMap[dateStr].ordersCount += 1;
  });

  const salesTrend = Object.entries(salesByDateMap).map(([date, val]) => ({
    date,
    revenue: val.revenue,
    ordersCount: val.ordersCount,
  }));

  // Sales by payment method
  const paymentMap: Record<string, number> = {};
  orders.forEach((o) => {
    paymentMap[o.paymentMethod] = (paymentMap[o.paymentMethod] || 0) + Number(o.total);
  });

  // Sales by status
  const statusMap: Record<string, number> = {};
  orders.forEach((o) => {
    statusMap[o.status] = (statusMap[o.status] || 0) + 1;
  });

  return {
    totalSales: orders.reduce((sum, o) => sum + Number(o.total), 0),
    totalOrders: orders.length,
    salesTrend,
    salesByPaymentMethod: Object.entries(paymentMap).map(([method, amount]) => ({ method, amount })),
    salesByStatus: Object.entries(statusMap).map(([status, count]) => ({ status, count })),
  };
}

export async function getProductReport() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    include: {
      categories: { include: { category: true } },
      images: { take: 1 },
      _count: { select: { orderItems: true } },
    },
  });

  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.status === "ACTIVE").length;
  const inactiveProducts = products.filter((p) => p.status === "DRAFT" || p.status === "ARCHIVED").length;
  const featuredProducts = products.filter((p) => p.isFeatured).length;
  const outOfStock = products.filter((p) => p.stockQuantity <= 0).length;
  const lowStock = products.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 10).length;

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + Number(p.price) * p.stockQuantity,
    0
  );

  return {
    totalProducts,
    activeProducts,
    inactiveProducts,
    featuredProducts,
    outOfStock,
    lowStock,
    totalInventoryValue,
    topProducts: products
      .sort((a, b) => b._count.orderItems - a._count.orderItems)
      .slice(0, 10)
      .map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: Number(p.price),
        stockQuantity: p.stockQuantity,
        ordersCount: p._count.orderItems,
      })),
  };
}

export async function getCustomerReport() {
  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      orders: {
        where: { status: { notIn: ["CANCELLED", "RETURNED"] } },
        select: { total: true },
      },
    },
  });

  const totalCustomers = customers.length;
  const customerStats = customers.map((c) => {
    const totalSpent = c.orders.reduce((sum, o) => sum + Number(o.total), 0);
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      ordersCount: c.orders.length,
      totalSpent,
    };
  });

  customerStats.sort((a, b) => b.totalSpent - a.totalSpent);

  return {
    totalCustomers,
    topSpenders: customerStats.slice(0, 10),
  };
}
