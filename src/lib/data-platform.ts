/**
 * ENTERPRISE IMPORT, EXPORT, DATA MIGRATION & BACKUP PLATFORM
 */

export interface BackupRecord {
  id: string;
  fileName: string;
  fileSize: string;
  version: string;
  entityCounts: Record<string, number>;
  createdAt: string;
  createdByUserName: string;
  status: "COMPLETED" | "FAILED" | "IN_PROGRESS";
}

export interface ImportJobLog {
  id: string;
  fileName: string;
  entityType: "PRODUCTS" | "CUSTOMERS" | "SUPPLIERS" | "INVENTORY" | "EXPENSES";
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  failedRows: number;
  status: "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED";
  performedBy: string;
  timestamp: string;
}

const MOCK_BACKUPS: BackupRecord[] = [
  {
    id: "BAK-2026-0807",
    fileName: "erp_full_backup_2026-08-07.json",
    fileSize: "4.2 MB",
    version: "v1.5.0",
    entityCounts: {
      Products: 42,
      Orders: 156,
      Customers: 89,
      Suppliers: 12,
      InventoryTransactions: 310,
    },
    createdAt: new Date().toISOString(),
    createdByUserName: "مدير النظام العام",
    status: "COMPLETED",
  },
];

const MOCK_IMPORT_LOGS: ImportJobLog[] = [
  {
    id: "IMP-101",
    fileName: "products_catalog_2026.csv",
    entityType: "PRODUCTS",
    totalRows: 50,
    importedRows: 48,
    skippedRows: 2,
    failedRows: 0,
    status: "SUCCESS",
    performedBy: "مدير المنتجات",
    timestamp: new Date(Date.now() - 86400000).toISOString(),
  },
];

/**
 * Generate System JSON Database Backup Snapshot
 */
export function createSystemBackup(userName: string = "النظام التلقائي"): BackupRecord {
  const newBackup: BackupRecord = {
    id: `BAK-${Date.now().toString().slice(-6)}`,
    fileName: `erp_snapshot_${new Date().toISOString().split("T")[0]}.json`,
    fileSize: "3.8 MB",
    version: "v1.5.0",
    entityCounts: {
      Products: 42,
      Orders: 156,
      Customers: 89,
      Suppliers: 12,
      Expenses: 34,
      AuditLogs: 512,
    },
    createdAt: new Date().toISOString(),
    createdByUserName: userName,
    status: "COMPLETED",
  };

  MOCK_BACKUPS.unshift(newBackup);
  return newBackup;
}

export function getBackupsList(): BackupRecord[] {
  return MOCK_BACKUPS;
}

export function getImportLogsList(): ImportJobLog[] {
  return MOCK_IMPORT_LOGS;
}
