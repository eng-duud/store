/**
 * ENTERPRISE SYSTEM OPERATIONS, MONITORING, OBSERVABILITY & HEALTH CENTER
 */

export interface ComponentHealthStatus {
  component: "DATABASE" | "API_GATEWAY" | "CLOUDINARY" | "BACKGROUND_WORKER" | "AUTH_SERVICE";
  name: string;
  status: "HEALTHY" | "DEGRADED" | "DOWN";
  latencyMs: number;
  uptimePercentage: string;
  details: string;
}

export interface OperationalAlert {
  id: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  title: string;
  message: string;
  component: string;
  timestamp: string;
  isAcknowledged: boolean;
}

export interface SystemMetrics {
  activeSessions: number;
  avgApiResponseMs: number;
  apiRequestsPerMin: number;
  dbPoolUtilization: string;
  memoryUsageMb: number;
  queueBacklog: number;
}

const MOCK_HEALTH_STATUS: ComponentHealthStatus[] = [
  {
    component: "DATABASE",
    name: "قاعدة البيانات الرئسية (PostgreSQL / Prisma)",
    status: "HEALTHY",
    latencyMs: 3,
    uptimePercentage: "99.99%",
    details: "الاتصالات نشطة والزمن المستغرق للاستعلام < 5ms",
  },
  {
    component: "API_GATEWAY",
    name: "بوابة الربط والـ APIs المركزية",
    status: "HEALTHY",
    latencyMs: 42,
    uptimePercentage: "99.95%",
    details: "معدل الخطأ 0.01% والاستجابة ضمن الحد المثالي",
  },
  {
    component: "CLOUDINARY",
    name: "خدمة تخزين الوسائط والصور (Cloudinary)",
    status: "HEALTHY",
    latencyMs: 120,
    uptimePercentage: "99.90%",
    details: "المساحة المستخدمة 14% والرفع يعمل بكفاءة",
  },
  {
    component: "BACKGROUND_WORKER",
    name: "معالج المهام الخلفية والطوابير",
    status: "HEALTHY",
    latencyMs: 15,
    uptimePercentage: "100.00%",
    details: "طابور المهام فارغ والسرعة 120 عملية/دقيقة",
  },
  {
    component: "AUTH_SERVICE",
    name: "خدمة المصادقة والأمان (NextAuth JWT)",
    status: "HEALTHY",
    latencyMs: 18,
    uptimePercentage: "99.99%",
    details: "18 جلسة نشطة وتشفير الجلسات يعمل بشكل سليم",
  },
];

const MOCK_ALERTS: OperationalAlert[] = [
  {
    id: "ALT-101",
    severity: "INFO",
    title: "اكتمل البناء وتحديث النظام",
    message: "تم تحديث بيئة الإنتاج إلى الإصدار v1.5.0 بنجاح دون أي توقف في الخدمة.",
    component: "SYSTEM",
    timestamp: new Date().toISOString(),
    isAcknowledged: true,
  },
];

export function getSystemHealthOverview() {
  const metrics: SystemMetrics = {
    activeSessions: 18,
    avgApiResponseMs: 42,
    apiRequestsPerMin: 145,
    dbPoolUtilization: "12%",
    memoryUsageMb: 248,
    queueBacklog: 0,
  };

  return {
    healthStatus: MOCK_HEALTH_STATUS,
    alerts: MOCK_ALERTS,
    metrics,
    systemUptime: "99.98%",
    lastCheckTime: new Date().toISOString(),
  };
}
