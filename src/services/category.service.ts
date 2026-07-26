import prisma from "@/lib/prisma";

const categoryInclude = {
  children: {
    where: { status: "ACTIVE" },
    orderBy: { sortOrder: "asc" as const },
  },
  _count: { select: { products: true } },
};

export type CategoryWithChildren = Awaited<ReturnType<typeof prisma.category.findMany>>[number];

export async function getCategoryTree(): Promise<CategoryWithChildren[]> {
  return prisma.category.findMany({
    where: {
      parentId: null,
      status: "ACTIVE",
      deletedAt: null,
    },
    include: categoryInclude,
    orderBy: { sortOrder: "asc" },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({
    where: { slug },
    include: {
      parent: true,
      children: {
        where: { status: "ACTIVE" },
        orderBy: { sortOrder: "asc" },
        include: { _count: { select: { products: true } } },
      },
      _count: { select: { products: true } },
    },
  });
}

export async function getAllCategories() {
  return prisma.category.findMany({
    where: { status: "ACTIVE", deletedAt: null },
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}

export async function getAdminCategories() {
  return prisma.category.findMany({
    where: { deletedAt: null },
    include: {
      parent: { select: { id: true, name: true } },
      children: true,
      _count: { select: { products: true } },
    },
    orderBy: { sortOrder: "asc" },
  });
}
