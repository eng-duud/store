/**
 * ENTERPRISE MULTI-STEP APPROVAL WORKFLOW ENGINE
 */

export type DocumentWorkflowType =
  | "PURCHASE_ORDER"
  | "EXPENSE_VOUCHER"
  | "INVENTORY_ADJUSTMENT"
  | "SALES_DISCOUNT";

export type ApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

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

export const WORKFLOW_CONFIGS: Record<DocumentWorkflowType, { name: string; chain: { positionId: string; name: string }[] }> = {
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
};

/**
 * Initialize a new workflow instance for a document
 */
export function createWorkflowInstance(
  documentType: DocumentWorkflowType,
  documentId: string,
  documentNumber: string,
  amount: number,
  submittedByUserId: string,
  submittedByUserName: string
): WorkflowInstance {
  const config = WORKFLOW_CONFIGS[documentType];
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
 * Process approval or rejection for the current workflow step
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
