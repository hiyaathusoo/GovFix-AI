// src/services/crossDepartmentErpService.ts
// GovFix AI - Cross-Department ERP & Government Portal Interoperability Engine
// Secure interoperability and workflow orchestration layer connecting independent government systems

export interface DepartmentSystem {
  id: string;
  name: string;
  code: "EDUCATION" | "REVENUE" | "FINANCE" | "IDENTITY";
  portalName: string;
  portalUrl: string;
  erpName: string;
  erpEndpoint: string;
  protocol: "REST / HTTPS" | "SOAP / XML" | "Kafka Event Stream" | "gRPC / Protobuf";
  authMode: "Mutual TLS 1.3" | "Gov OAuth2 + PKCE" | "HMAC SHA-256" | "State SSO SAML";
  status: "HEALTHY" | "DEGRADED" | "WARNING" | "DOWN";
  latencyMs: number;
  requestsPerMin: number;
  errorRatePct: number;
  lastSync: string;
  functions: string[];
}

export interface RawRevenueErpPayload {
  beneficiary_id: string;
  applicant_pan_masked: string;
  annual_income_inr: number;
  tax_assessment_yr: string;
  income_category: string;
  revenue_officer_sign: string;
  certificate_no: string;
}

export interface RawEducationErpPayload {
  student_ref: string;
  institution_code: string;
  program_name: string;
  merit_percentile: number;
  verification_status: "VALID" | "IN_REVIEW" | "REJECTED";
  dept_officer_id: string;
  approval_timestamp?: string;
}

export interface RawFinanceErpPayload {
  customer_code: string;
  bank_ifsc: string;
  account_masked: string;
  pfms_scheme_code: string;
  disbursement_amount_inr: number;
  transaction_status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED";
  utr_reference?: string;
}

export interface RawCitizenServicesErpPayload {
  uid_token: string;
  aadhaar_masked: string;
  full_name: string;
  dob: string;
  kyc_status: "AUTHENTICATED" | "PENDING";
  address_state: string;
}

// GovFix Common Data Model (CDM)
export interface GovFixCommonDataModel {
  applicationId: string;
  citizenId: string;
  citizenName: string;
  aadhaarMasked: string;
  identityVerified: boolean;
  annualIncome: number;
  incomeBracket: string;
  taxAssessmentYear: string;
  incomeVerified: boolean;
  studentRef: string;
  institution: string;
  educationStatus: "VERIFIED" | "IN_REVIEW" | "REJECTED";
  departmentApproval: "UNDER_REVIEW" | "APPROVED" | "REQUEST_INFORMATION" | "REJECTED";
  approvingOfficer: string;
  paymentStatus: "PENDING" | "PROCESSING" | "DISBURSED" | "FAILED";
  disbursementAmount: string;
  utrNumber?: string;
  lastUpdated: string;
}

export interface CrossDeptWorkflowStep {
  id: string;
  title: string;
  department: string;
  systemName: string;
  systemType: "PORTAL" | "GATEWAY" | "ERP";
  status: "COMPLETED" | "IN_PROGRESS" | "PENDING" | "DELAYED" | "FAILED";
  completedAt?: string;
  description: string;
  citizenFriendlyStatus: string;
}

export interface CrossDeptApplication {
  id: string;
  serviceTitle: string;
  citizenId: string;
  citizenName: string;
  overallStatus: "SUBMITTED" | "IN_REVIEW" | "APPROVED" | "DISBURSED" | "ACTION_REQUIRED" | "DELAYED";
  submittedAt: string;
  currentStepIndex: number;
  steps: CrossDeptWorkflowStep[];
  commonData: GovFixCommonDataModel;
  rawPayloads: {
    identity: RawCitizenServicesErpPayload;
    revenue: RawRevenueErpPayload;
    education: RawEducationErpPayload;
    finance: RawFinanceErpPayload;
  };
}

export interface InteropAuditEvent {
  id: string;
  timestamp: string;
  timeDisplay: string;
  source: string;
  sourceType: "PORTAL" | "GOVFIX_GATEWAY" | "DEPARTMENT_ERP";
  destination: string;
  event: string;
  status: "SUCCESS" | "IN_TRANSIT" | "DELAYED" | "FAILED";
  payloadSummary: string;
}

export interface InteropSystemHealth {
  connectedErps: number;
  connectedPortals: number;
  activeApis: number;
  healthyServices: number;
  degradedServices: number;
  offlineServices: number;
  activeWorkflows: number;
}

export type InteropScenario =
  | "NORMAL"
  | "SIMULATE_EDUCATION_FAILURE"
  | "SIMULATE_REVENUE_TIMEOUT"
  | "SIMULATE_FINANCE_FAILURE"
  | "RECOVERED";

// ----------------------------------------------------------------------------
// INITIAL CONNECTED DEPARTMENTS (Section 2, 10)
// ----------------------------------------------------------------------------

const INITIAL_DEPARTMENTS: DepartmentSystem[] = [
  {
    id: "dept-education",
    name: "Higher Education Department",
    code: "EDUCATION",
    portalName: "Education Services Portal",
    portalUrl: "https://education.gov.in/portal/services",
    erpName: "Education Department ERP",
    erpEndpoint: "https://erp.highereducation.gov.in/api/v3/scholarship",
    protocol: "REST / HTTPS",
    authMode: "State SSO SAML",
    status: "HEALTHY",
    latencyMs: 720,
    requestsPerMin: 1450,
    errorRatePct: 0.6,
    lastSync: "Just now",
    functions: [
      "Student records verification",
      "Academic certificate authentication",
      "Institutional quota allocation",
      "Departmental officer review",
      "Approval workflow signing",
    ],
  },
  {
    id: "dept-revenue",
    name: "Revenue & Finance Department",
    code: "REVENUE",
    portalName: "Revenue Services Portal",
    portalUrl: "https://revenue.gov.in/services/certificate",
    erpName: "Revenue Department ERP",
    erpEndpoint: "https://erp.revenue.gov.in/services/tax-income",
    protocol: "SOAP / XML",
    authMode: "Gov OAuth2 + PKCE",
    status: "HEALTHY",
    latencyMs: 680,
    requestsPerMin: 1820,
    errorRatePct: 0.4,
    lastSync: "Just now",
    functions: [
      "Income bracket verification",
      "PAN card tax assessment cross-check",
      "Domicile & address validation",
      "Revenue inspector certificate signing",
    ],
  },
  {
    id: "dept-finance",
    name: "Finance & Public Treasury Department",
    code: "FINANCE",
    portalName: "Finance Services Portal",
    portalUrl: "https://bharatkosh.gov.in/portal",
    erpName: "Finance Department ERP (PFMS)",
    erpEndpoint: "https://pfms.gov.in/api/v1/dbt/disburse",
    protocol: "Kafka Event Stream",
    authMode: "HMAC SHA-256",
    status: "HEALTHY",
    latencyMs: 640,
    requestsPerMin: 2890,
    errorRatePct: 0.3,
    lastSync: "Just now",
    functions: [
      "Direct Benefit Transfer (DBT) execution",
      "Bank account validation (NPCI / PFMS)",
      "Idempotent payment disbursement",
      "Financial settlement audit",
    ],
  },
  {
    id: "dept-identity",
    name: "Citizen Services & Identity Department",
    code: "IDENTITY",
    portalName: "Citizen Services Portal",
    portalUrl: "https://citizen.gov.in/portal",
    erpName: "Citizen Services ERP (UIDAI/DigiLocker)",
    erpEndpoint: "https://api.uidai.gov.in/auth/v3/verify",
    protocol: "REST / HTTPS",
    authMode: "Mutual TLS 1.3",
    status: "HEALTHY",
    latencyMs: 420,
    requestsPerMin: 3400,
    errorRatePct: 0.2,
    lastSync: "Just now",
    functions: [
      "Citizen master identity verification",
      "Aadhaar e-KYC authentication",
      "Digital document repository integration",
      "Profile & contact sync",
    ],
  },
];

// ----------------------------------------------------------------------------
// MAIN CROSS-DEPARTMENT DEMO APPLICATION: GOV-2026-1042 (Section 6, 7)
// ----------------------------------------------------------------------------

const INITIAL_DEMO_APPLICATION: CrossDeptApplication = {
  id: "GOV-2026-1042",
  serviceTitle: "National Merit-cum-Means Higher Education Scholarship & DBT Grant",
  citizenId: "CIT-2026-001",
  citizenName: "Aarav Sharma",
  overallStatus: "IN_REVIEW",
  submittedAt: "Today, 10:02 AM",
  currentStepIndex: 3, // Currently at Department Review
  steps: [
    {
      id: "step-1",
      title: "Citizen Submission",
      department: "Citizen Portal",
      systemName: "Citizen Services Portal",
      systemType: "PORTAL",
      status: "COMPLETED",
      completedAt: "10:02 AM",
      description: "Citizen submitted scholarship application via unified GovFix citizen interface.",
      citizenFriendlyStatus: "✓ Application Submitted Successfully",
    },
    {
      id: "step-2",
      title: "Identity Verification",
      department: "Citizen Services & Identity",
      systemName: "Citizen Services ERP (UIDAI)",
      systemType: "ERP",
      status: "COMPLETED",
      completedAt: "10:03 AM",
      description: "Aadhaar e-KYC authenticated with cryptographic token verification.",
      citizenFriendlyStatus: "✓ Identity Verified",
    },
    {
      id: "step-3",
      title: "Revenue & Income Verification",
      department: "Revenue & Finance",
      systemName: "Revenue Department ERP",
      systemType: "ERP",
      status: "COMPLETED",
      completedAt: "10:04 AM",
      description: "Income bracket verified (₹2,50,000/yr) with CBDT tax assessment matching.",
      citizenFriendlyStatus: "✓ Income Verification Completed",
    },
    {
      id: "step-4",
      title: "Education Record Verification & Approval",
      department: "Higher Education",
      systemName: "Education Department ERP",
      systemType: "ERP",
      status: "IN_PROGRESS",
      description: "Department officer Priya Mehta reviewing academic merit and institutional eligibility.",
      citizenFriendlyStatus: "⟳ Department Review in Progress",
    },
    {
      id: "step-5",
      title: "Finance DBT Disbursement Processing",
      department: "Finance & Public Treasury",
      systemName: "Finance Department ERP (PFMS)",
      systemType: "ERP",
      status: "PENDING",
      description: "Direct Benefit Transfer release scheduled upon departmental approval.",
      citizenFriendlyStatus: "○ Payment Processing Pending",
    },
    {
      id: "step-6",
      title: "Final Completion & Disbursement",
      department: "GovFix Interoperability Layer",
      systemName: "GovFix Notification & Receipt Gateway",
      systemType: "GATEWAY",
      status: "PENDING",
      description: "Citizen notification dispatched and digitally signed scholarship grant issued.",
      citizenFriendlyStatus: "○ Final Status Pending",
    },
  ],
  commonData: {
    applicationId: "GOV-2026-1042",
    citizenId: "CIT-2026-001",
    citizenName: "Aarav Sharma",
    aadhaarMasked: "•••• •••• 9921",
    identityVerified: true,
    annualIncome: 250000,
    incomeBracket: "Below ₹3,00,000 (Priority Tier-1)",
    taxAssessmentYear: "AY 2025-26",
    incomeVerified: true,
    studentRef: "STU-00981-IND",
    institution: "National Institute of Technology, Karnataka",
    educationStatus: "VERIFIED",
    departmentApproval: "UNDER_REVIEW",
    approvingOfficer: "Priya Mehta (EDU-OFF-021)",
    paymentStatus: "PENDING",
    disbursementAmount: "₹25,000 / Academic Year",
    lastUpdated: "Just now",
  },
  rawPayloads: {
    identity: {
      uid_token: "AADHAAR-SHA256-9921448",
      aadhaar_masked: "XXXXXXXX9921",
      full_name: "Aarav Sharma",
      dob: "2004-04-12",
      kyc_status: "AUTHENTICATED",
      address_state: "Karnataka",
    },
    revenue: {
      beneficiary_id: "CIT-001",
      applicant_pan_masked: "ABCDE••••F",
      annual_income_inr: 250000,
      tax_assessment_yr: "2025-26",
      income_category: "TIER_1_SUBSIDIZED",
      revenue_officer_sign: "DIGITAL_SIG_REV_772",
      certificate_no: "REV-INC-2026-8819",
    },
    education: {
      student_ref: "STU-00981",
      institution_code: "INS-NIT-041",
      program_name: "B.Tech Computer Science & Engineering",
      merit_percentile: 96.4,
      verification_status: "VALID",
      dept_officer_id: "EDU-OFF-021",
    },
    finance: {
      customer_code: "CIT-001",
      bank_ifsc: "SBIN0004821",
      account_masked: "••••••••4819",
      pfms_scheme_code: "PFMS-DBT-EDU-042",
      disbursement_amount_inr: 25000,
      transaction_status: "PENDING",
    },
  },
};

// Initial Technical Audit Events (Section 25)
const INITIAL_AUDIT_EVENTS: InteropAuditEvent[] = [
  {
    id: "evt-001",
    timestamp: "2026-09-22T10:02:14Z",
    timeDisplay: "10:02 AM",
    source: "Citizen Services Portal",
    sourceType: "PORTAL",
    destination: "GovFix API Gateway",
    event: "APPLICATION_CREATED",
    status: "SUCCESS",
    payloadSummary: "Application GOV-2026-1042 registered by citizen CIT-2026-001 with consent token.",
  },
  {
    id: "evt-002",
    timestamp: "2026-09-22T10:03:02Z",
    timeDisplay: "10:03 AM",
    source: "GovFix API Gateway",
    sourceType: "GOVFIX_GATEWAY",
    destination: "Citizen Services ERP (UIDAI)",
    event: "IDENTITY_VERIFICATION_REQUESTED",
    status: "SUCCESS",
    payloadSummary: "Dispatched e-KYC request. Received cryptographic authentication response in 420ms.",
  },
  {
    id: "evt-003",
    timestamp: "2026-09-22T10:04:18Z",
    timeDisplay: "10:04 AM",
    source: "GovFix Interoperability Layer",
    sourceType: "GOVFIX_GATEWAY",
    destination: "Revenue Department ERP",
    event: "INCOME_CROSS_CHECK_COMPLETED",
    status: "SUCCESS",
    payloadSummary: "SOAP XML schema translated to Common Data Model. Income ₹2,50,000 verified.",
  },
  {
    id: "evt-004",
    timestamp: "2026-09-22T10:05:30Z",
    timeDisplay: "10:05 AM",
    source: "GovFix Workflow Orchestrator",
    sourceType: "GOVFIX_GATEWAY",
    destination: "Education Department ERP",
    event: "WORKFLOW_ROUTED_TO_OFFICER",
    status: "SUCCESS",
    payloadSummary: "Aggregated verified identity and income credentials delivered to Education ERP queue.",
  },
];

// In-Memory State
let departments: DepartmentSystem[] = JSON.parse(JSON.stringify(INITIAL_DEPARTMENTS));
let demoApplication: CrossDeptApplication = JSON.parse(JSON.stringify(INITIAL_DEMO_APPLICATION));
let auditEvents: InteropAuditEvent[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_EVENTS));
let currentScenario: InteropScenario = "NORMAL";

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export function subscribeInteropUpdates(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

// ----------------------------------------------------------------------------
// GETTERS
// ----------------------------------------------------------------------------

export function getConnectedDepartments(): DepartmentSystem[] {
  return departments;
}

export function getCrossDeptApplication(): CrossDeptApplication {
  return demoApplication;
}

export function getInteropAuditEvents(): InteropAuditEvent[] {
  return auditEvents;
}

export function getInteropScenario(): InteropScenario {
  return currentScenario;
}

export function getInteropSystemHealth(): InteropSystemHealth {
  const healthyCount = departments.filter((d) => d.status === "HEALTHY").length;
  const degradedCount = departments.filter((d) => d.status === "DEGRADED" || d.status === "WARNING").length;
  const downCount = departments.filter((d) => d.status === "DOWN").length;

  return {
    connectedErps: 4,
    connectedPortals: 4,
    activeApis: 28,
    healthyServices: 24 - (4 - healthyCount),
    degradedServices: 3 + degradedCount,
    offlineServices: 1 + downCount,
    activeWorkflows: 42,
  };
}

// ----------------------------------------------------------------------------
// WORKFLOW ACTIONS: OFFICER APPROVAL & ROUTING (Section 18, 19)
// ----------------------------------------------------------------------------

export function approveByEducationOfficer(officerNotes?: string) {
  const timeNow = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  // 1. Update Education ERP state
  demoApplication.commonData.departmentApproval = "APPROVED";
  demoApplication.commonData.educationStatus = "VERIFIED";
  demoApplication.rawPayloads.education.approval_timestamp = new Date().toISOString();
  demoApplication.steps[3].status = "COMPLETED";
  demoApplication.steps[3].completedAt = timeNow;
  demoApplication.steps[3].citizenFriendlyStatus = "✓ Department Approved";

  // 2. Add Audit Event for Education ERP Approval
  auditEvents.unshift({
    id: `evt-${Date.now()}`,
    timestamp: new Date().toISOString(),
    timeDisplay: timeNow,
    source: "Education Department ERP",
    sourceType: "DEPARTMENT_ERP",
    destination: "GovFix Workflow Orchestrator",
    event: "DEPARTMENT_APPROVED",
    status: "SUCCESS",
    payloadSummary: `Officer Priya Mehta approved GOV-2026-1042. Note: ${officerNotes || "Merit criteria satisfied."}`,
  });

  // 3. GovFix receives event and routes to Finance ERP for DBT
  demoApplication.steps[4].status = "IN_PROGRESS";
  demoApplication.steps[4].citizenFriendlyStatus = "⟳ Direct Benefit Transfer In Progress";

  auditEvents.unshift({
    id: `evt-${Date.now() + 1}`,
    timestamp: new Date().toISOString(),
    timeDisplay: timeNow,
    source: "GovFix Workflow Orchestrator",
    sourceType: "GOVFIX_GATEWAY",
    destination: "Finance Department ERP (PFMS)",
    event: "FINANCE_DISBURSEMENT_INITIATED",
    status: "SUCCESS",
    payloadSummary: "Event DEPARTMENT_APPROVED mapped to PFMS DBT schema. Idempotent transfer queued for ₹25,000.",
  });

  notify();

  // 4. Simulate Finance ERP settlement response after 2 seconds
  setTimeout(() => {
    const settleTime = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
    demoApplication.commonData.paymentStatus = "DISBURSED";
    demoApplication.commonData.utrNumber = `UTR-PFMS-${Math.floor(10000000 + Math.random() * 90000000)}`;
    demoApplication.rawPayloads.finance.transaction_status = "SUCCESS";
    demoApplication.rawPayloads.finance.utr_reference = demoApplication.commonData.utrNumber;
    demoApplication.overallStatus = "DISBURSED";

    demoApplication.steps[4].status = "COMPLETED";
    demoApplication.steps[4].completedAt = settleTime;
    demoApplication.steps[4].citizenFriendlyStatus = "✓ Benefit Disbursed to Bank Account";

    demoApplication.steps[5].status = "COMPLETED";
    demoApplication.steps[5].completedAt = settleTime;
    demoApplication.steps[5].citizenFriendlyStatus = "✓ Scholarship Active (Disbursement Complete)";

    auditEvents.unshift({
      id: `evt-${Date.now() + 2}`,
      timestamp: new Date().toISOString(),
      timeDisplay: settleTime,
      source: "Finance Department ERP (PFMS)",
      sourceType: "DEPARTMENT_ERP",
      destination: "GovFix API Gateway",
      event: "PAYMENT_COMPLETED",
      status: "SUCCESS",
      payloadSummary: `DBT ₹25,000 credited to account ••••4819. UTR: ${demoApplication.commonData.utrNumber}. Citizen notified.`,
    });

    notify();
  }, 2200);
}

export function requestInfoByOfficer(reason: string) {
  demoApplication.commonData.departmentApproval = "REQUEST_INFORMATION";
  demoApplication.overallStatus = "ACTION_REQUIRED";
  demoApplication.steps[3].status = "DELAYED";
  demoApplication.steps[3].citizenFriendlyStatus = "⚠️ Additional Information Requested";

  const timeNow = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  auditEvents.unshift({
    id: `evt-${Date.now()}`,
    timestamp: new Date().toISOString(),
    timeDisplay: timeNow,
    source: "Education Department ERP",
    sourceType: "DEPARTMENT_ERP",
    destination: "GovFix API Gateway",
    event: "OFFICER_INFO_REQUESTED",
    status: "SUCCESS",
    payloadSummary: `Officer requested clarification: "${reason}". Notification sent to citizen.`,
  });

  notify();
}

// ----------------------------------------------------------------------------
// DEMO CHAOS / FAILURE SCENARIOS (Section 20, 21, 22, 23)
// ----------------------------------------------------------------------------

export function triggerInteropScenario(scenario: InteropScenario) {
  currentScenario = scenario;
  const timeNow = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  if (scenario === "NORMAL") {
    resetInteropDemo();
    return;
  }

  if (scenario === "SIMULATE_EDUCATION_FAILURE") {
    const edu = departments.find((d) => d.code === "EDUCATION");
    if (edu) {
      edu.status = "DOWN";
      edu.latencyMs = 5000;
      edu.errorRatePct = 100;
    }
    demoApplication.overallStatus = "DELAYED";
    demoApplication.steps[3].status = "DELAYED";
    demoApplication.steps[3].citizenFriendlyStatus = "⚠️ Service Temporarily Delayed (Preserved)";

    auditEvents.unshift({
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeDisplay: timeNow,
      source: "Education Department ERP",
      sourceType: "DEPARTMENT_ERP",
      destination: "GovFix Gateway",
      event: "ERP_CONNECTION_TIMEOUT",
      status: "FAILED",
      payloadSummary: "Education ERP port 8443 socket reset. GovFix state buffer engaged for 12 citizen workflows.",
    });
  } else if (scenario === "SIMULATE_REVENUE_TIMEOUT") {
    const rev = departments.find((d) => d.code === "REVENUE");
    if (rev) {
      rev.status = "DOWN";
      rev.latencyMs = 4500;
      rev.errorRatePct = 28.4;
    }
    auditEvents.unshift({
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeDisplay: timeNow,
      source: "Revenue Department ERP",
      sourceType: "DEPARTMENT_ERP",
      destination: "GovFix Gateway",
      event: "HTTP_504_GATEWAY_TIMEOUT",
      status: "FAILED",
      payloadSummary: "Income verification API timed out after 4,500ms. Exponential backoff retry activated.",
    });
  } else if (scenario === "SIMULATE_FINANCE_FAILURE") {
    const fin = departments.find((d) => d.code === "FINANCE");
    if (fin) {
      fin.status = "DEGRADED";
      fin.latencyMs = 2800;
      fin.errorRatePct = 14.2;
    }
    auditEvents.unshift({
      id: `evt-${Date.now()}`,
      timestamp: new Date().toISOString(),
      timeDisplay: timeNow,
      source: "Finance Department ERP (PFMS)",
      sourceType: "DEPARTMENT_ERP",
      destination: "GovFix Gateway",
      event: "PFMS_LEDGER_ERROR_500",
      status: "DELAYED",
      payloadSummary: "PFMS DBT settlement ledger 500 error. Idempotent lock engaged; no repeat charges issued.",
    });
  }

  notify();
}

export function recoverInteropService() {
  currentScenario = "RECOVERED";
  const timeNow = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  departments.forEach((dept) => {
    dept.status = "HEALTHY";
    dept.latencyMs = dept.code === "EDUCATION" ? 720 : dept.code === "REVENUE" ? 680 : dept.code === "FINANCE" ? 640 : 420;
    dept.errorRatePct = dept.code === "EDUCATION" ? 0.6 : dept.code === "REVENUE" ? 0.4 : dept.code === "FINANCE" ? 0.3 : 0.2;
  });

  if (demoApplication.steps[3].status === "DELAYED") {
    demoApplication.steps[3].status = "IN_PROGRESS";
    demoApplication.steps[3].citizenFriendlyStatus = "⟳ Department Review in Progress";
    demoApplication.overallStatus = "IN_REVIEW";
  }

  auditEvents.unshift({
    id: `evt-${Date.now()}`,
    timestamp: new Date().toISOString(),
    timeDisplay: timeNow,
    source: "GovFix Auto-Healer",
    sourceType: "GOVFIX_GATEWAY",
    destination: "All Connected Department ERPs",
    event: "SERVICES_RECOVERED_AND_RESUMED",
    status: "SUCCESS",
    payloadSummary: "All department ERP connections verified. Buffered workflows seamlessly replayed.",
  });

  notify();
}

export function resetInteropDemo() {
  departments = JSON.parse(JSON.stringify(INITIAL_DEPARTMENTS));
  demoApplication = JSON.parse(JSON.stringify(INITIAL_DEMO_APPLICATION));
  auditEvents = JSON.parse(JSON.stringify(INITIAL_AUDIT_EVENTS));
  currentScenario = "NORMAL";
  notify();
}
