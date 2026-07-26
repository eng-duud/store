import prisma from "@/lib/prisma";

export async function getUserAddresses(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });
}

export async function createAddress(
  userId: string,
  data: {
    label: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    isDefault?: boolean;
  }
) {
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.address.create({
    data: { ...data, userId },
  });
}

export async function updateAddress(
  addressId: string,
  userId: string,
  data: {
    label?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    isDefault?: boolean;
  }
) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) throw new Error("Address not found");

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  return prisma.address.update({
    where: { id: addressId },
    data,
  });
}

export async function deleteAddress(addressId: string, userId: string) {
  const address = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });

  if (!address) throw new Error("Address not found");

  return prisma.address.delete({ where: { id: addressId } });
}

export async function getUserProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true, addresses: true } },
    },
  });
}

export async function updateUserProfile(
  userId: string,
  data: { name?: string; phone?: string }
) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  });
}

export async function getAllCustomers(filters: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = filters.page || 1;
  const limit = filters.limit || 20;

  const where = {
    role: "CUSTOMER" as const,
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" as const } },
            { email: { contains: filters.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: {
          select: { total: true, status: true },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
