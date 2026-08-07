/**
 * ENTERPRISE TEMPORARY DELEGATION SYSTEM
 */

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
