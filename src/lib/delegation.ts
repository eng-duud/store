import prisma from "@/lib/prisma";

export interface DelegationRecord {
  id: string;
  delegatorUserId: string;
  delegatorUserName: string;
  delegatorPositionId: string;
  delegateeUserId: string;
  delegateeUserName: string;
  delegateePositionId: string;
  module: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "REVOKED";
  reason: string;
  createdAt: string;
}

const MOCK_DELEGATIONS: DelegationRecord[] = [
  {
    id: "DEL-1",
    delegatorUserId: "u-fin-mgr",
    delegatorUserName: "مدير الشؤون المالية",
    delegatorPositionId: "FINANCE_MANAGER",
    delegateeUserId: "u-chief-acc",
    delegateeUserName: "رئيس المحاسبين",
    delegateePositionId: "CHIEF_ACCOUNTANT",
    module: "APPROVALS",
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000 * 7).toISOString(),
    status: "ACTIVE",
    reason: "تفويض مؤقت أثناء الإجازة السنوية لمراجعة وإقرار السندات الشراء والمصروفات",
    createdAt: new Date().toISOString(),
  },
];

export function getActiveDelegations(): DelegationRecord[] {
  const now = new Date().toISOString();
  return MOCK_DELEGATIONS.filter(
    (d) => d.status === "ACTIVE" && d.startDate <= now && d.endDate >= now
  );
}

export async function fetchActiveDbDelegations() {
  const now = new Date();
  try {
    const records = await prisma.delegationRecord.findMany({
      where: {
        status: "ACTIVE",
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: { createdAt: "desc" },
    });
    return records;
  } catch {
    return MOCK_DELEGATIONS;
  }
}

export async function resolveEffectiveApproverUserIds(targetPositionCode: string): Promise<string[]> {
  // Find users holding targetPositionCode or users with active delegations from delegators holding targetPositionCode
  try {
    const directUsers = await prisma.user.findMany({
      where: { positionCode: targetPositionCode, isActive: true },
      select: { id: true },
    });
    const directUserIds = directUsers.map((u) => u.id);

    const now = new Date();
    const activeDelegations = await prisma.delegationRecord.findMany({
      where: {
        delegatorPositionCode: targetPositionCode,
        status: "ACTIVE",
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: { delegateeUserId: true },
    });

    const delegateeIds = activeDelegations.map((d) => d.delegateeUserId);
    return Array.from(new Set([...directUserIds, ...delegateeIds]));
  } catch {
    return [];
  }
}

export function createDelegation(data: Omit<DelegationRecord, "id" | "status" | "createdAt">): DelegationRecord {
  const newDelegation: DelegationRecord = {
    ...data,
    id: `DEL-${Date.now()}`,
    status: "ACTIVE",
    createdAt: new Date().toISOString(),
  };

  MOCK_DELEGATIONS.unshift(newDelegation);
  return newDelegation;
}

export function revokeDelegation(id: string): boolean {
  const del = MOCK_DELEGATIONS.find((d) => d.id === id);
  if (del) {
    del.status = "REVOKED";
    return true;
  }
  return false;
}

