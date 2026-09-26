import { DEMO_APPLICATION, DEMO_CITIZEN } from "../config/demoData";

export interface CitizenApplication {
  id: string;
  service: string;
  category: string;
  scheme: string;
  date: string;
  status: "Recovery completed" | "Completed" | "Processing" | "Submitted" | "Approved" | "Action required" | "Rejected";
  statusColor: "emerald" | "amber" | "blue";
  govRef: string;
  amount?: string;
  note: string;
  recovered?: boolean;
}

const INITIAL_RECORDS: CitizenApplication[] = [
  {
    id: DEMO_APPLICATION.id,
    service: DEMO_APPLICATION.service,
    category: "Education",
    scheme: DEMO_APPLICATION.service,
    date: DEMO_APPLICATION.submitted,
    status: "Processing",
    statusColor: "emerald",
    govRef: "EDU-2026-1042",
    note: "Saved during portal congestion and automatically submitted upon service recovery.",
    recovered: true,
  },
  {
    id: "EDU-2026-0831",
    service: "Student Certificate",
    category: "Utilities",
    scheme: "Student Certificate Verification",
    date: "10 Sep 2026, 14:22 IST",
    status: "Completed",
    statusColor: "emerald",
    govRef: "BESCOM-REC-908124",
    amount: "N/A",
    note: `Certificate verified for ${DEMO_CITIZEN.name}.`,
  },
  {
    id: "GF-2026-09241",
    service: "Income Tax",
    category: "Finance",
    scheme: "ITR-1 Sahaj Filing (AY 2025–26)",
    date: "13 Sep 2026, 16:45 IST",
    status: "Processing",
    statusColor: "amber",
    govRef: "ITR-ACK-88410291",
    note: "e-Verification confirmed. In processing queue with the Income Tax Department.",
  },
  {
    id: "GF-2026-07403",
    service: "Driving Licence",
    category: "Transport",
    scheme: "Sarathi Parivahan — Driving Licence Renewal",
    date: "03 Sep 2026, 11:30 IST",
    status: "Submitted",
    statusColor: "emerald",
    govRef: "DL-KA01-2018-0048291",
    note: "Application approved and dispatched via Speed Post.",
  },
];

const STORAGE_KEY = "govfix_citizen_applications";
export const APPLICATIONS_UPDATED_EVENT = "govfix:applications-updated";

export function getApplications(): CitizenApplication[] {
  if (typeof window === "undefined") return INITIAL_RECORDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECORDS));
      return INITIAL_RECORDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_RECORDS;
  }
}

export function addApplication(app: CitizenApplication): CitizenApplication[] {
  const current = getApplications();
  // Prepend new application
  const updated = [app, ...current];
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(APPLICATIONS_UPDATED_EVENT, { detail: updated }));
    } catch (e) {
      console.warn("Could not save application to localStorage", e);
    }

  }
  return updated;
}

export function updateApplicationStatus(
  applicationId: string,
  status: CitizenApplication["status"],
  note: string
): CitizenApplication[] {
  const updated = getApplications().map((application) =>
    application.id === applicationId
      ? {
          ...application,
          status,
          note,
          statusColor:
            status === "Approved" || status === "Completed"
              ? "emerald"
              : status === "Rejected"
              ? "blue"
              : "amber",
        }
      : application
  );
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent(APPLICATIONS_UPDATED_EVENT, { detail: updated }));
  }
  return updated;
}
