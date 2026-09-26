import { DEMO_APPLICATION, DEMO_CITIZEN } from "../config/demoData";

export type WorkflowStep =
  | "IDENTITY_VERIFICATION"
  | "INCOME_VERIFICATION"
  | "DOCUMENT_VERIFICATION"
  | "ELIGIBILITY_CHECK"
  | "COMPLETED";

export interface WorkflowLog {
  applicationId: string;
  service: string;
  event: string;
  status: "success" | "retrying" | "recovered" | "failed";
  timestamp: string;
  details?: string;
}

export interface MockApplication {
  applicationId: string;
  citizenId: string;
  currentStep: WorkflowStep;
  status: "PROCESSING" | "PAUSED" | "COMPLETED";
  createdAt: string;
  updatedAt: string;
  recovered: boolean;
  logs: WorkflowLog[];
}

const applications = new Map<string, MockApplication>();
const incomeFailures = new Set<string>();

function createLog(
  applicationId: string,
  service: string,
  event: string,
  status: WorkflowLog["status"],
  details?: string
): WorkflowLog {
  return {
    applicationId,
    service,
    event,
    status,
    timestamp: new Date().toISOString(),
    details,
  };
}

function createApplication(citizenId: string): MockApplication {
  const now = new Date().toISOString();
  const application: MockApplication = {
    applicationId: DEMO_APPLICATION.id,
    citizenId,
    currentStep: "IDENTITY_VERIFICATION",
    status: "PROCESSING",
    createdAt: now,
    updatedAt: now,
    recovered: false,
    logs: [],
  };
  applications.set(application.applicationId, application);
  return application;
}

function updateApplication(
  application: MockApplication,
  service: string,
  event: string,
  status: WorkflowLog["status"],
  details?: string
) {
  application.updatedAt = new Date().toISOString();
  application.logs.push(createLog(application.applicationId, service, event, status, details));
}

export function mockIdentity(citizenId: string) {
  return {
    citizenId,
    status: "verified",
    name: DEMO_CITIZEN.name,
  };
}

export function mockIncome(citizenId: string, shouldFail = false) {
  if (shouldFail && !incomeFailures.has(citizenId)) {
    incomeFailures.add(citizenId);
    throw new Error("INCOME_TIMEOUT");
  }

  const governmentFormat = {
    beneficiary_id: citizenId,
    income_value: 250000,
  };

  return {
    citizenId: governmentFormat.beneficiary_id,
    incomeStatus: "verified",
    annualIncome: governmentFormat.income_value,
  };
}

export function mockDocuments(citizenId: string) {
  return {
    citizenId,
    documentsStatus: "verified",
    documents: ["identity-proof", "address-proof"],
  };
}

export function mockEligibility(citizenId: string) {
  return {
    citizenId,
    eligible: true,
    reason: "All required verifications passed",
  };
}

export async function submitMockApplication(
  citizenId: string,
  simulateFailure = true
): Promise<MockApplication> {
  const application = createApplication(citizenId);

  mockIdentity(citizenId);
  updateApplication(application, "Identity API", "Identity verified", "success");

  application.currentStep = "INCOME_VERIFICATION";
  try {
    mockIncome(citizenId, simulateFailure);
    updateApplication(application, "Income API", "Income verified", "success");
  } catch (error) {
    application.status = "PAUSED";
    updateApplication(
      application,
      "Income API",
      "Income service timeout detected",
      "retrying",
      "AI diagnosis: SERVICE_TIMEOUT; recovery action: CONTROLLED_RETRY"
    );
    updateApplication(application, "Recovery Engine", "Application state preserved", "recovered");
    application.recovered = true;

    mockIncome(citizenId, false);
    updateApplication(application, "Income API", "Income verification recovered", "recovered");
    application.status = "PROCESSING";
  }

  application.currentStep = "DOCUMENT_VERIFICATION";
  mockDocuments(citizenId);
  updateApplication(application, "Document API", "Documents verified", "success");

  application.currentStep = "ELIGIBILITY_CHECK";
  mockEligibility(citizenId);
  updateApplication(application, "Eligibility API", "Eligibility confirmed", "success");

  application.currentStep = "COMPLETED";
  application.status = "COMPLETED";
  updateApplication(application, "Workflow Orchestrator", "Application completed", "success");
  return application;
}

export function getMockApplication(applicationId: string) {
  return applications.get(applicationId);
}

export function getMockApplications() {
  return Array.from(applications.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getMockHealth() {
  return [
    { service: "Identity API", status: "healthy", mode: "mock" },
    { service: "Income API", status: "healthy", mode: "mock", recoverySimulation: "timeout-on-first-attempt" },
    { service: "Document API", status: "healthy", mode: "mock" },
    { service: "Eligibility API", status: "healthy", mode: "mock" },
  ];
}
