export type ErpStatus = "UNDER_REVIEW" | "APPROVED" | "REQUEST_INFORMATION" | "PAYMENT_PENDING";

export interface ErpApplication {
  application_no: string;
  beneficiary_id: string;
  dept_code: string;
  status: ErpStatus;
  officer_note: string;
  updated_at: string;
}

export interface GovFixErpApplication {
  applicationId: string;
  citizenId: string;
  department: "EDUCATION";
  status: "PROCESSING" | "APPROVED" | "ACTION_REQUIRED" | "PAYMENT_PENDING";
  source: "MOCK_DEPARTMENT_ERP";
  officerNote: string;
  updatedAt: string;
}

const erpApplications = new Map<string, ErpApplication>();

export function registerErpApplication(applicationId: string, citizenId: string) {
  const record: ErpApplication = {
    application_no: applicationId,
    beneficiary_id: citizenId,
    dept_code: "EDU",
    status: "UNDER_REVIEW",
    officer_note: "Queued for departmental officer review.",
    updated_at: new Date().toISOString(),
  };
  erpApplications.set(applicationId, record);
  return mapErpApplication(record);
}

export function getErpApplications() {
  return Array.from(erpApplications.values()).map(mapErpApplication);
}

export function getErpApplication(applicationId: string) {
  const record = erpApplications.get(applicationId);
  return record ? mapErpApplication(record) : undefined;
}

export function updateErpApplication(
  applicationId: string,
  status: ErpStatus,
  officerNote?: string
) {
  const record = erpApplications.get(applicationId);
  if (!record) return undefined;
  record.status = status;
  record.officer_note = officerNote || record.officer_note;
  record.updated_at = new Date().toISOString();
  return mapErpApplication(record);
}

function mapErpApplication(record: ErpApplication): GovFixErpApplication {
  const statusMap: Record<ErpStatus, GovFixErpApplication["status"]> = {
    UNDER_REVIEW: "PROCESSING",
    APPROVED: "APPROVED",
    REQUEST_INFORMATION: "ACTION_REQUIRED",
    PAYMENT_PENDING: "PAYMENT_PENDING",
  };

  return {
    applicationId: record.application_no,
    citizenId: record.beneficiary_id,
    department: "EDUCATION",
    status: statusMap[record.status],
    source: "MOCK_DEPARTMENT_ERP",
    officerNote: record.officer_note,
    updatedAt: record.updated_at,
  };
}

export function getErpHealth() {
  return {
    system: "Mock Department ERP",
    status: "healthy",
    apiVersion: "v1",
    modules: ["Application Management", "Officer Approval", "Finance / Payment", "Audit"],
  };
}
