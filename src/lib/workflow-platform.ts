/**
 * ENTERPRISE WORKFLOW AUTOMATION, NOTIFICATION CENTER & BACKGROUND PROCESSING PLATFORM
 */

export type NotificationCategory =
  | "INVENTORY_ALERT"
  | "PURCHASE_ALERT"
  | "SALES_ALERT"
  | "ACCOUNTING_ALERT"
  | "APPROVAL_REQUEST"
  | "SYSTEM";

export type DeliveryChannel = "IN_APP" | "EMAIL" | "SMS" | "WHATSAPP" | "WEBHOOK";

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: "HIGH" | "MEDIUM" | "LOW";
  channels: DeliveryChannel[];
  isRead: boolean;
  referenceId?: string;
  createdAt: string;
}

export interface BackgroundJob {
  id: string;
  taskName: string;
  jobType: "IMAGE_CLEANUP" | "DAILY_REPORT" | "CACHE_REFRESH" | "STATISTICS_RECALC" | "BACKUP";
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  priority: number; // 1 (Highest) - 5 (Lowest)
  retryCount: number;
  maxRetries: number;
  scheduledAt: string;
  completedAt?: string;
  error?: string;
}

const MOCK_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "NOTIF-1",
    title: "تنبيه نقص المخزون",
    message: "المنتج 'سماعات بلوتوث اللاسلكية' قارب على النفاد (الكمية المتبقية: 3 قطع)",
    category: "INVENTORY_ALERT",
    priority: "HIGH",
    channels: ["IN_APP", "EMAIL"],
    isRead: false,
    referenceId: "PROD-102",
    createdAt: new Date().toISOString(),
  },
  {
    id: "NOTIF-2",
    title: "طلب اعتماد أمر شراء جديد",
    message: "أمر الشراء رقم PO-2026-001 بقيمة 45,000 ريال يتطلب اعتماد مدير الشؤون المالية",
    category: "APPROVAL_REQUEST",
    priority: "HIGH",
    channels: ["IN_APP", "EMAIL", "WHATSAPP"],
    isRead: false,
    referenceId: "PO-2026-001",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

const MOCK_BACKGROUND_JOBS: BackgroundJob[] = [
  {
    id: "JOB-101",
    taskName: "تنظيف وسائط الصور المؤقتة (Cloudinary Media Cleanup)",
    jobType: "IMAGE_CLEANUP",
    status: "COMPLETED",
    priority: 3,
    retryCount: 0,
    maxRetries: 3,
    scheduledAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date(Date.now() - 86350000).toISOString(),
  },
  {
    id: "JOB-102",
    taskName: "إعادة التجميع الإحصائي اليومي للمبيعات والمخزون",
    jobType: "STATISTICS_RECALC",
    status: "COMPLETED",
    priority: 2,
    retryCount: 0,
    maxRetries: 3,
    scheduledAt: new Date(Date.now() - 43200000).toISOString(),
    completedAt: new Date(Date.now() - 43190000).toISOString(),
  },
];

/**
 * Dispatch & Broadcast Notifications
 */
export function pushNotification(data: Omit<SystemNotification, "id" | "isRead" | "createdAt">): SystemNotification {
  const newNotif: SystemNotification = {
    ...data,
    id: `NOTIF-${Date.now()}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };

  MOCK_NOTIFICATIONS.unshift(newNotif);
  return newNotif;
}

export function getNotifications(): SystemNotification[] {
  return MOCK_NOTIFICATIONS;
}

export function markNotificationAsRead(id: string): boolean {
  const n = MOCK_NOTIFICATIONS.find((item) => item.id === id);
  if (n) {
    n.isRead = true;
    return true;
  }
  return false;
}

/**
 * Queue & Background Processing Engine
 */
export function queueBackgroundJob(data: Omit<BackgroundJob, "id" | "status" | "retryCount" | "scheduledAt">): BackgroundJob {
  const newJob: BackgroundJob = {
    ...data,
    id: `JOB-${Date.now()}`,
    status: "QUEUED",
    retryCount: 0,
    scheduledAt: new Date().toISOString(),
  };

  MOCK_BACKGROUND_JOBS.unshift(newJob);

  // Simulate immediate async processing queue
  setTimeout(() => {
    newJob.status = "COMPLETED";
    newJob.completedAt = new Date().toISOString();
  }, 1500);

  return newJob;
}

export function getBackgroundJobs(): BackgroundJob[] {
  return MOCK_BACKGROUND_JOBS;
}

/**
 * Business Rules Engine Evaluation
 */
export function evaluateBusinessRules(event: {
  type: "LOW_STOCK" | "OVERDUE_PAYMENT" | "LARGE_PURCHASE";
  payload: any;
}) {
  if (event.type === "LOW_STOCK") {
    pushNotification({
      title: "تنبيه انخفاض المخزون الذاتي",
      message: `المنتج ${event.payload.name} انخفض تحت حد الأمان المطلوب.`,
      category: "INVENTORY_ALERT",
      priority: "HIGH",
      channels: ["IN_APP", "EMAIL"],
    });
  } else if (event.type === "LARGE_PURCHASE") {
    pushNotification({
      title: "طلب شراء مرتفع القيمة يتطلب موافقة",
      message: `أمر الشراء بقيمة ${event.payload.amount} يتطلب اعتماد الإدارة العامة.`,
      category: "APPROVAL_REQUEST",
      priority: "HIGH",
      channels: ["IN_APP", "EMAIL", "WHATSAPP"],
    });
  }
}
