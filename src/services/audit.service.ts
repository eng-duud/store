import prisma from "@/lib/prisma";

export interface CreateAuditLogParams {
  action: string;
  module: string;
  entity?: string;
  entityId?: string;
  oldValues?: any;
  newValues?: any;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  notes?: string;
}

export async function createAuditLog(params: CreateAuditLogParams) {
  try {
    return await prisma.auditLog.create({
      data: {
        action: params.action,
        module: params.module,
        entity: params.entity || null,
        entityId: params.entityId || null,
        oldValues: params.oldValues !== undefined ? params.oldValues : undefined,
        newValues: params.newValues !== undefined ? params.newValues : undefined,
        userId: params.userId || null,
        userName: params.userName || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        notes: params.notes || null,
      },
    });
  } catch (error) {
    console.error("Failed to create audit log:", error);
    return null;
  }
}

export async function getAuditLogs(options?: {
  module?: string;
  action?: string;
  userId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = options?.page || 1;
  const limit = options?.limit || 20;

  const where: any = {};

  if (options?.module) where.module = options.module;
  if (options?.action) where.action = options.action;
  if (options?.userId) where.userId = options.userId;
  if (options?.search) {
    where.OR = [
      { action: { contains: options.search, mode: "insensitive" } },
      { module: { contains: options.search, mode: "insensitive" } },
      { entity: { contains: options.search, mode: "insensitive" } },
      { userName: { contains: options.search, mode: "insensitive" } },
      { notes: { contains: options.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}
