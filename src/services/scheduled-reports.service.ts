export type ScheduledReportFrequency = "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
export type ScheduledReportFormat = "PDF" | "CSV" | "EXCEL" | "SUMMARY_EMAIL";

export interface ScheduledReportTask {
  id: string;
  title: string;
  frequency: ScheduledReportFrequency;
  format: ScheduledReportFormat;
  recipients: string[];
  lastRunAt?: Date;
  nextRunAt: Date;
  isActive: boolean;
}

export const DEMO_SCHEDULED_REPORTS: ScheduledReportTask[] = [
  {
    id: "rep-1",
    title: "تقرير المبيعات والربحية اليومي",
    frequency: "DAILY",
    format: "SUMMARY_EMAIL",
    recipients: ["admin@store.com"],
    nextRunAt: new Date(Date.now() + 86400000),
    isActive: true,
  },
  {
    id: "rep-2",
    title: "تقرير حركات المخزون والنفاذ الأسبوعي",
    frequency: "WEEKLY",
    format: "CSV",
    recipients: ["inventory@store.com"],
    nextRunAt: new Date(Date.now() + 86400000 * 7),
    isActive: true,
  },
  {
    id: "rep-3",
    title: "القوائم المالية الجردية الشهرية",
    frequency: "MONTHLY",
    format: "PDF",
    recipients: ["accounting@store.com"],
    nextRunAt: new Date(Date.now() + 86400000 * 30),
    isActive: true,
  },
];

export async function getScheduledReportTasks(): Promise<ScheduledReportTask[]> {
  // Future scalable hook: can read from Database table `ScheduledReportJob`
  return DEMO_SCHEDULED_REPORTS;
}

export async function executeScheduledReport(taskId: string): Promise<{ success: boolean; message: string }> {
  console.log(`Executing scheduled report task ${taskId}...`);
  // Architecture stub: integrates with cron worker / Resend email / PDF generation engine
  return {
    success: true,
    message: `تم توليد التقرير بنجاح وإرساله للمستلمين المسجلين للمهمة ${taskId}`,
  };
}
