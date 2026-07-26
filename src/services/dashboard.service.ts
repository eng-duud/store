import prisma from "@/lib/prisma";

export async function getDashboardStats() {
  const [
    totalRevenue,
    totalOrders,
    totalProducts,
    totalCustomers,
    recentOrders,
    allActiveProducts,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: { status: { notIn: ["CANCELLED", "RETURNED"] } },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.product.count({ where: { deletedAt: null } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        deletedAt: null,
      },
      include: { images: { take: 1 } },
      orderBy: { stockQuantity: "asc" },
    }),
  ]);

  const lowStockProducts = allActiveProducts
    .filter((p) => p.stockQuantity <= (p.lowStockThreshold || 10))
    .slice(0, 10);

  const now = new Date();
  const monthlyRevenue = await Promise.all(
    Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      return prisma.order.aggregate({
        where: {
          createdAt: { gte: date, lt: nextDate },
          status: { notIn: ["CANCELLED", "RETURNED"] },
        },
        _sum: { total: true },
        _count: true,
      });
    })
  );

  const revenueChartData = monthlyRevenue
    .reverse()
    .map((item, i) => ({
      month: new Date(now.getFullYear(), now.getMonth() - 5 + i, 1).toLocaleDateString("ar-SA", { month: "short" }),
      revenue: Number(item._sum.total || 0),
      orders: item._count,
    }));

  return {
    totalRevenue: Number(totalRevenue._sum.total || 0),
    totalOrders,
    totalProducts,
    totalCustomers,
    recentOrders,
    lowStockProducts,
    revenueChartData,
  };
}
