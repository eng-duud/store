import prisma from "@/lib/prisma";

export interface TimelineEvent {
  id: string;
  module: "ORDERS" | "PRODUCTS" | "INVENTORY" | "ACCOUNTING" | "SETTINGS" | "SYSTEM";
  action: string;
  description: string;
  performedBy?: string;
  createdAt: Date;
}

export async function getActivityTimeline(options?: {
  module?: string;
  limit?: number;
}): Promise<TimelineEvent[]> {
  const limit = options?.limit || 30;

  const where: any = {};
  if (options?.module) where.module = options.module;

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return logs.map((log) => ({
    id: log.id,
    module: (log.module as any) || "SYSTEM",
    action: log.action,
    description: log.notes || log.action,
    performedBy: log.userName || undefined,
    createdAt: log.createdAt,
  }));
}
