export const DEMO_CITIZEN = {
  name: "Aarav Sharma",
  citizenId: "CIT-2026-001",
  email: "aarav.sharma@example.com",
  mobile: "+91 98765 43210",
} as const;

export const DEMO_APPLICATION = {
  id: "SCH-2026-1042",
  service: "National Scholarship",
  department: "Department of Education",
  submitted: "18 September 2026",
  status: "Processing",
  currentStep: "Department Review",
} as const;

export const DEMO_WORKFLOW = [
  { label: "Identity Verification", status: "COMPLETED", timestamp: "18 Sep 2026, 19:40", requestId: "REQ-ID-1042", responseTime: "420 ms" },
  { label: "Income Verification", status: "COMPLETED", timestamp: "18 Sep 2026, 19:42", requestId: "REQ-IN-1042", responseTime: "680 ms" },
  { label: "Document Verification", status: "COMPLETED", timestamp: "18 Sep 2026, 19:43", requestId: "REQ-DOC-1042", responseTime: "510 ms" },
  { label: "Eligibility Check", status: "COMPLETED", timestamp: "18 Sep 2026, 19:43", requestId: "REQ-ELG-1042", responseTime: "730 ms" },
  { label: "Department Review", status: "PROCESSING", timestamp: "18 Sep 2026, 19:44", requestId: "REQ-ERP-1042", responseTime: "860 ms" },
  { label: "Payment", status: "PENDING", timestamp: "", requestId: "", responseTime: "" },
  { label: "Notification", status: "PENDING", timestamp: "", requestId: "", responseTime: "" },
] as const;

export const DEMO_SERVICE_HEALTH = [
  { service: "Identity Verification", status: "Operational", responseTime: "420 ms" },
  { service: "Income Verification", status: "Operational", responseTime: "680 ms" },
  { service: "Document Verification", status: "Operational", responseTime: "510 ms" },
  { service: "Eligibility Verification", status: "Operational", responseTime: "730 ms" },
  { service: "Education Department ERP", status: "Operational", responseTime: "860 ms" },
] as const;
