import prisma from "@/lib/prisma";
import { ApprovalReqStatus } from "@prisma/client";

export type DocumentWorkflowType =
  | "PURCHASE_ORDER"
  | "EXPENSE_VOUCHER"
  | "INVENTORY_ADJUSTMENT"
  | "SALES_DISCOUNT"
  | "JOURNAL_ENTRY"
  | "REFUND";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED" | "RETURNED" | "EXPIRED";

export interface ApprovalStep {
  stepNumber: number;
  requiredPositionId: string;
  positionName: string;
  status: ApprovalStatus;
  approvedByUserId?: string;
  approvedByUserName?: string;
  comments?: string;
  updatedAt?: Date | string;
}

export interface WorkflowInstance {
  id: string;
  documentType: DocumentWorkflowType;
  documentId: string;
  documentNumber: string;
  amount: number;
  submittedByUserId: string;
  submittedByUserName: string;
  currentStepNumber: number;
  status: ApprovalStatus;
  steps: ApprovalStep[];
  createdAt: Date | string;
}

export const WORKFLOW_CONFIGS: Record<string, { name: string; chain: { positionId: string; name: string }[] }> = {
  PURCHASE_ORDER: {
    name: "سلسلة اعتماد أذونات الشراء",
    chain: [
      { positionId: "PURCHASE_MANAGER", name: "مدير المشتريات" },
      { positionId: "FINANCE_MANAGER", name: "مدير الشؤون المالية" },
      { positionId: "GENERAL_MANAGER", name: "المدير العام" },
    ],
  },
  EXPENSE_VOUCHER: {
    name: "سلسلة اعتماد سندات المصروفات",
    chain: [
      { positionId: "CHIEF_ACCOUNTANT", name: "رئيس المحاسبين" },
      { positionId: "FINANCE_MANAGER", name: "مدير الشؤون المالية" },
    ],
  },
  INVENTORY_ADJUSTMENT: {
    name: "سلسلة اعتماد التسويات المخزنية",
    chain: [
      { positionId: "STOREKEEPER", name: "أمين المخزن" },
      { positionId: "OPERATIONS_MANAGER", name: "مدير العمليات والمخازن" },
    ],
  },
  SALES_DISCOUNT: {
    name: "سلسلة اعتماد الخصومات الاستثنائية",
    chain: [
      { positionId: "SALES_MANAGER", name: "مدير المبيعات" },
      { positionId: "FINANCE_MANAGER", name: "مدير الشؤون المالية" },
    ],
  },
  JOURNAL_ENTRY: {
    name: "سلسلة اعتماد القيود المحاسبية",
    chain: [
      { positionId: "CHIEF_ACCOUNTANT", name: "رئيس المحاسبين" },
      { positionId: "FINANCE_MANAGER", name: "مدير الشؤون المالية" },
    ],
  },
};

/**
 * Initialize a new workflow instance in DB
 */
export async function createDbApprovalRequest(
  documentType: string,
  documentId: string,
  documentNumber: string,
  amount: number,
  requesterId: string,
  requesterName: string,
  notes?: string
) {
  try {
    const request = await prisma.approvalRequest.create({
      data: {
        documentType,
        documentId,
        documentNumber,
        amount,
        requesterId,
        requesterName,
        currentStepNumber: 1,
        status: "PENDING",
        notes,
      },
    });
    return request;
  } catch (err) {
    console.error("Error creating DB approval request:", err);
    return null;
  }
}

/**
 * Process a decision on a DB approval request
 */
export async function processDbApprovalDecision(
  requestId: string,
  approverId: string,
  approverName: string,
  approverPositionCode: string,
  action: "APPROVE" | "REJECT" | "RETURN" | "DELEGATE",
  comments?: string,
  delegatedFromUserId?: string
) {
  const request = await prisma.approvalRequest.findUnique({
    where: { id: requestId },
    include: { decisions: true },
  });

  if (!request || request.status !== "PENDING") {
    throw new Error("طلب الاعتماد غير متاح أو تم التخاذ قرار فيه بالفعل");
  }

  const chain = WORKFLOW_CONFIGS[request.documentType]?.chain || [
    { positionId: "FINANCE_MANAGER", name: "مدير الشؤون المالية" },
    { positionId: "GENERAL_MANAGER", name: "المدير العام" },
  ];

  await prisma.approvalDecision.create({
    data: {
      requestId: request.id,
      stepNumber: request.currentStepNumber,
      approverId,
      approverName,
      approverPositionCode,
      action: action as any,
      comments: comments || (action === "APPROVE" ? "تمت الموافقة" : action === "REJECT" ? "تم الرفض" : "إعادة للمراجعة"),
      delegatedFromUserId,
    },
  });

  let newStatus: ApprovalReqStatus = request.status;
  let nextStep = request.currentStepNumber;

  if (action === "REJECT") {
    newStatus = ApprovalReqStatus.REJECTED;
  } else if (action === "RETURN") {
    newStatus = ApprovalReqStatus.RETURNED;
  } else if (action === "APPROVE") {
    if (request.currentStepNumber < chain.length) {
      nextStep = request.currentStepNumber + 1;
    } else {
      newStatus = ApprovalReqStatus.APPROVED;
    }
  }

  const updated = await prisma.approvalRequest.update({
    where: { id: request.id },
    data: {
      status: newStatus as any,
      currentStepNumber: nextStep,
    },
    include: { decisions: true },
  });

  return updated;
}

/**
 * Legacy in-memory workflow creator
 */
export function createWorkflowInstance(
  documentType: DocumentWorkflowType,
  documentId: string,
  documentNumber: string,
  amount: number,
  submittedByUserId: string,
  submittedByUserName: string
): WorkflowInstance {
  const config = WORKFLOW_CONFIGS[documentType] || WORKFLOW_CONFIGS.PURCHASE_ORDER;
  const steps: ApprovalStep[] = config.chain.map((item, idx) => ({
    stepNumber: idx + 1,
    requiredPositionId: item.positionId,
    positionName: item.name,
    status: "PENDING",
  }));

  return {
    id: `WF-${Date.now()}`,
    documentType,
    documentId,
    documentNumber,
    amount,
    submittedByUserId,
    submittedByUserName,
    currentStepNumber: 1,
    status: "PENDING",
    steps,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Legacy in-memory step processor
 */
export function processWorkflowStep(
  instance: WorkflowInstance,
  approverPositionId: string,
  approverUserId: string,
  approverUserName: string,
  action: "APPROVE" | "REJECT",
  comments?: string
): WorkflowInstance {
  const currentStep = instance.steps.find((s) => s.stepNumber === instance.currentStepNumber);
  if (!currentStep) return instance;

  if (action === "REJECT") {
    currentStep.status = "REJECTED";
    currentStep.approvedByUserId = approverUserId;
    currentStep.approvedByUserName = approverUserName;
    currentStep.comments = comments || "تم الرفض بواسطة معتمد السلسلة";
    currentStep.updatedAt = new Date().toISOString();

    instance.status = "REJECTED";
    return instance;
  }

  currentStep.status = "APPROVED";
  currentStep.approvedByUserId = approverUserId;
  currentStep.approvedByUserName = approverUserName;
  currentStep.comments = comments || "تمت الموافقة والاعتماد بنجاح";
  currentStep.updatedAt = new Date().toISOString();

  if (instance.currentStepNumber < instance.steps.length) {
    instance.currentStepNumber += 1;
  } else {
    instance.status = "APPROVED";
  }

  return instance;
}

