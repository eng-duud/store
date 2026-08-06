import prisma from "@/lib/prisma";
import type { ProductFilters, PaginatedResponse } from "@/types";
import type { Prisma } from "@prisma/client";
import { deleteFromCloudinary } from "@/lib/cloudinary";
import { slugify } from "@/lib/utils";

function buildProductWhere(filters: ProductFilters): any {
  const where: any = {
    status: "ACTIVE",
    deletedAt: null,
  };

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { description: { contains: filters.search, mode: "insensitive" } },
      { sku: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.categorySlug) {
    where.categories = {
      some: {
        category: { slug: filters.categorySlug },
      },
    };
  }

  if (filters.isFeatured) {
    where.isFeatured = true;
  }

  if (filters.minPrice || filters.maxPrice) {
    where.price = {};
    if (filters.minPrice) where.price.gte = filters.minPrice;
    if (filters.maxPrice) where.price.lte = filters.maxPrice;
  }

  return where;
}

function buildProductOrderBy(
  sort?: ProductFilters["sort"]
): any {
  switch (sort) {
    case "price_asc":
      return { price: "asc" };
    case "price_desc":
      return { price: "desc" };
    case "name_asc":
      return { name: "asc" };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

const productInclude = {
  images: { orderBy: { sortOrder: "asc" as const } },
  categories: {
    include: { category: true },
  },
  brand: true,
  variants: true,
};

export async function getProducts(
  filters: ProductFilters
): Promise<PaginatedResponse<any>> {
  const page = filters.page || 1;
  const limit = filters.limit || 12;
  const where = buildProductWhere(filters);
  const orderBy = buildProductOrderBy(filters.sort);

  const execute = async () => {
    const [items, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  };

  try {
    return await execute();
  } catch (err) {
    console.warn("Retrying database query due to connection attempt:", err);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return await execute();
  }
}

export async function getFeaturedProducts() {
  const fetchFn = () =>
    prisma.product.findMany({
      where: {
        status: "ACTIVE",
        isFeatured: true,
        deletedAt: null,
      },
      include: productInclude,
      orderBy: { createdAt: "desc" },
      take: 8,
    });

  try {
    return await fetchFn();
  } catch (err) {
    console.warn("Retrying getFeaturedProducts due to connection attempt:", err);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return await fetchFn();
  }
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      ...productInclude,
      orderItems: false,
      cartItems: false,
      inventoryTransactions: false,
    },
  });
}

export async function getProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: productInclude,
  });
}

export async function searchProducts(query: string, limit = 10) {
  return prisma.product.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { sku: { contains: query, mode: "insensitive" } },
      ],
    },
    include: {
      images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
    },
    take: limit,
  });
}

export async function getLowStockProducts(threshold?: number) {
  return prisma.product.findMany({
    where: {
      status: "ACTIVE",
      deletedAt: null,
      stockQuantity: { lte: threshold ?? 10 },
    },
    include: { images: { take: 1 } },
    orderBy: { stockQuantity: "asc" },
  });
}

export async function getAdminProducts(filters: {
  search?: string;
  status?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;

  const where: Prisma.ProductWhereInput = {
    deletedAt: null,
  };

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { sku: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.status) {
    where.status = filters.status as "DRAFT" | "ACTIVE" | "ARCHIVED";
  }

  if (filters.categoryId) {
    where.categories = {
      some: { categoryId: filters.categoryId },
    };
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { sortOrder: "asc" as const } },
        categories: { include: { category: true } },
        brand: true,
        _count: { select: { orderItems: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export interface CreateProductInput {
  name: string;
  description?: string;
  shortDescription?: string;
  sku: string;
  price: number;
  salePrice?: number | null;
  costPrice?: number | null;
  stockQuantity: number;
  status?: "DRAFT" | "ACTIVE" | "ARCHIVED";
  isFeatured?: boolean;
  categoryIds?: string[];
  imageUrls?: string[];
  images?: { url: string; publicId?: string; altText?: string; isPrimary?: boolean; sortOrder?: number }[];
  brandId?: string;
  lowStockThreshold?: number;
}

export async function createProduct(data: CreateProductInput) {
  const slug = `${slugify(data.name)}-${Date.now().toString().slice(-4)}`;

  const imageData = data.images
    ? data.images.map((img, i) => ({
        url: img.url,
        publicId: img.publicId || null,
        altText: img.altText || null,
        isPrimary: img.isPrimary ?? i === 0,
        sortOrder: img.sortOrder ?? i,
      }))
    : data.imageUrls
    ? data.imageUrls.map((url, i) => ({
        url,
        publicId: null,
        altText: null,
        isPrimary: i === 0,
        sortOrder: i,
      }))
    : undefined;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      shortDescription: data.shortDescription || null,
      sku: data.sku,
      price: data.price,
      salePrice: data.salePrice || null,
      costPrice: data.costPrice || null,
      stockQuantity: data.stockQuantity,
      lowStockThreshold: data.lowStockThreshold || 10,
      status: data.status || "ACTIVE",
      isFeatured: data.isFeatured || false,
      brandId: data.brandId || null,
      categories: data.categoryIds && data.categoryIds.length > 0
        ? {
            create: data.categoryIds.map((categoryId) => ({ categoryId })),
          }
        : undefined,
      images: imageData
        ? {
            create: imageData,
          }
        : undefined,
    },
    include: productInclude,
  });

  return product;
}

export async function updateProduct(id: string, data: Partial<CreateProductInput>) {
  if (data.categoryIds) {
    await prisma.productCategory.deleteMany({ where: { productId: id } });
  }

  let imageData: { url: string; publicId: string | null; altText: string | null; isPrimary: boolean; sortOrder: number }[] | undefined;

  if (data.images) {
    const existingImages = await prisma.productImage.findMany({ where: { productId: id } });

    if (data.images.length === 0) {
      for (const img of existingImages) {
        if (img.publicId) {
          try { await deleteFromCloudinary(img.publicId); } catch {}
        }
      }
      await prisma.productImage.deleteMany({ where: { productId: id } });
      imageData = undefined;
    } else {
      const newUrl = data.images[0]?.url;
      const hasImageChanged = existingImages.length === 0 || existingImages[0]?.url !== newUrl;

      if (hasImageChanged) {
        for (const img of existingImages) {
          if (img.publicId) {
            try { await deleteFromCloudinary(img.publicId); } catch {}
          }
        }
        await prisma.productImage.deleteMany({ where: { productId: id } });

        imageData = data.images.map((img, i) => ({
          url: img.url,
          publicId: img.publicId || null,
          altText: img.altText || null,
          isPrimary: img.isPrimary ?? i === 0,
          sortOrder: img.sortOrder ?? i,
        }));
      } else {
        imageData = undefined;
      }
    }
  }

  return prisma.product.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      shortDescription: data.shortDescription,
      sku: data.sku,
      price: data.price,
      salePrice: data.salePrice,
      costPrice: data.costPrice,
      stockQuantity: data.stockQuantity,
      lowStockThreshold: data.lowStockThreshold,
      status: data.status,
      isFeatured: data.isFeatured,
      brandId: data.brandId,
      categories: data.categoryIds
        ? {
            create: data.categoryIds.map((categoryId) => ({ categoryId })),
          }
        : undefined,
      images: imageData
        ? {
            create: imageData,
          }
        : undefined,
    },
    include: productInclude,
  });
}

export async function deleteProduct(id: string) {
  return prisma.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function duplicateProduct(id: string) {
  const original = await getProductById(id);
  if (!original) throw new Error("المنتج غير موجود");

  const newSku = `${original.sku}-COPY-${Math.floor(Math.random() * 1000)}`;
  const newName = `${original.name} (نسخة)`;

  return createProduct({
    name: newName,
    sku: newSku,
    description: original.description || undefined,
    shortDescription: original.shortDescription || undefined,
    price: Number(original.price),
    salePrice: original.salePrice ? Number(original.salePrice) : null,
    costPrice: original.costPrice ? Number(original.costPrice) : null,
    stockQuantity: original.stockQuantity,
    status: "DRAFT",
    isFeatured: false,
    brandId: original.brandId || undefined,
    categoryIds: original.categories.map((c: any) => c.categoryId),
    images: original.images.map((img: any) => ({
      url: img.url,
      publicId: img.publicId || undefined,
      altText: img.altText || undefined,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
    })),
  });
}
