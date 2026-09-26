// src/services/healthMonitoringService.ts
// GovFix AI - Dedicated Government Service Health Monitoring & AI Diagnostics Engine
// Authorized non-invasive monitoring using synthetic demo endpoints

export type HealthState = "HEALTHY" | "DEGRADED" | "WARNING" | "DOWN" | "RECOVERING";

export interface ComponentHealth {
  website: { status: HealthState; label: string; latencyMs: number };
  frontend: { status: HealthState; label: string; errors: number };
  api: { status: HealthState; label: string; endpoint: string; latencyMs: number };
  auth: { status: HealthState; label: string; mode: string };
  backend: { status: HealthState; label: string; queueDepth: number };
  database: { status: HealthState; label: string; poolLoadPct: number };
}

export interface MonitoredService {
  id: string;
  name: string;
  department: string;
  serviceType: "API" | "PORTAL" | "ERP" | "GATEWAY" | "SERVICE";
  url: string;
  status: HealthState;
  availability: number; // percentage, e.g. 99.4
  latency: number; // current ms
  baselineLatency: number; // baseline ms, e.g. 400
  errorRate: number; // current percentage, e.g. 0.4
  requestRate: number; // requests/min
  lastChecked: string;
  lastFailure?: string;
  currentIncidentId?: string;
  recoveryStatus?: string;
  metrics: {
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
  };
  errorBreakdown: {
    total: number;
    successful: number;
    err4xx: number;
    err5xx: number;
    timeouts: number;
    connectionFailures: number;
    validationFailures: number;
  };
  components: ComponentHealth;
  dependencies: string[]; // downstream service IDs
  sslStatus: {
    valid: boolean;
    expiresDays: number;
    tlsVersion: string;
    issuer: string;
  };
  schemaValidation: {
    status: "PASS" | "WARN" | "FAIL";
    schemaVersion: string;
    lastValidated: string;
    details: string;
  };
  sla: {
    targetAvailability: number;
    currentAvailability: number;
    targetResponseMs: number;
    currentResponseMs: number;
    breached: boolean;
  };
  history24h: {
    availability: number;
    requests: number;
    errors: number;
    incidents: number;
    avgLatency: number;
  };
}

export interface IncidentTimelineEvent {
  time: string;
  stage: string;
  actor: string;
  description: string;
  status: "completed" | "in-progress" | "pending";
}

export interface AffectedApplication {
  id: string;
  applicant: string;
  workflowStep: string;
  date: string;
  status: string;
  preserved: boolean;
  department: string;
}

export interface HealthIncident {
  id: string;
  serviceId: string;
  serviceName: string;
  department: string;
  status: "ACTIVE" | "ACKNOWLEDGED" | "INVESTIGATING" | "RESOLVING" | "RECOVERED";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  detectedTime: string;
  trigger: string;
  currentErrorRate: number;
  affectedWorkflowCount: number;
  affectedApplications: AffectedApplication[];
  aiAnalysis: {
    problem: string;
    observedFact: string;
    possibleCause: string;
    confidence: number;
    impact: string;
    recommendedAction: string;
    recoveryStatus: string;
    anomalyMetric?: {
      baseline: string;
      current: string;
      deviation: string;
    };
  };
  timeline: IncidentTimelineEvent[];
}

export type SimulationScenario =
  | "NORMAL"
  | "HIGH_LATENCY"
  | "API_TIMEOUT"
  | "ERROR_500"
  | "ERP_FAILURE"
  | "DEPENDENCY_FAILURE"
  | "RECOVERING";

// Initial Synthetic Services Catalog
const INITIAL_SERVICES: MonitoredService[] = [
  {
    id: "svc-identity",
    name: "Identity Verification Portal",
    department: "Home Affairs & UIDAI",
    serviceType: "API",
    url: "https://api.uidai.gov.in/auth/v3/verify",
    status: "HEALTHY",
    availability: 99.8,
    latency: 420,
    baselineLatency: 400,
    errorRate: 0.2,
    requestRate: 2450,
    lastChecked: "Just now",
    metrics: { avg: 420, min: 210, max: 780, p50: 395, p95: 580, p99: 720 },
    errorBreakdown: {
      total: 24500,
      successful: 24451,
      err4xx: 32,
      err5xx: 12,
      timeouts: 3,
      connectionFailures: 1,
      validationFailures: 1,
    },
    components: {
      website: { status: "HEALTHY", label: "Portal CDN Active", latencyMs: 85 },
      frontend: { status: "HEALTHY", label: "Web UI Responsive", errors: 0 },
      api: { status: "HEALTHY", label: "Identity API 200 OK", endpoint: "/v3/verify", latencyMs: 335 },
      auth: { status: "HEALTHY", label: "mToken / HSM Verified", mode: "Mutual TLS" },
      backend: { status: "HEALTHY", label: "Async Queue Operational", queueDepth: 4 },
      database: { status: "HEALTHY", label: "Citizen Cluster Synced", poolLoadPct: 28 },
    },
    dependencies: [],
    sslStatus: { valid: true, expiresDays: 142, tlsVersion: "TLS 1.3", issuer: "NIC CA 2024" },
    schemaValidation: {
      status: "PASS",
      schemaVersion: "v3.2.1-gov",
      lastValidated: "1 min ago",
      details: "Attribute payload conforms to National Data Sharing standards",
    },
    sla: {
      targetAvailability: 99.5,
      currentAvailability: 99.8,
      targetResponseMs: 600,
      currentResponseMs: 420,
      breached: false,
    },
    history24h: { availability: 99.8, requests: 58400, errors: 116, incidents: 0, avgLatency: 418 },
  },
  {
    id: "svc-income",
    name: "Income Verification Portal",
    department: "Revenue & Finance",
    serviceType: "API",
    url: "https://incometax.gov.in/api/v2/verify/pan",
    status: "HEALTHY",
    availability: 99.4,
    latency: 680,
    baselineLatency: 650,
    errorRate: 0.4,
    requestRate: 1820,
    lastChecked: "Just now",
    metrics: { avg: 680, min: 380, max: 1150, p50: 640, p95: 890, p99: 1040 },
    errorBreakdown: {
      total: 18200,
      successful: 18127,
      err4xx: 45,
      err5xx: 18,
      timeouts: 6,
      connectionFailures: 2,
      validationFailures: 2,
    },
    components: {
      website: { status: "HEALTHY", label: "e-Filing Portal Online", latencyMs: 120 },
      frontend: { status: "HEALTHY", label: "Citizen Form Gateway", errors: 0 },
      api: { status: "HEALTHY", label: "ITR Service REST 200", endpoint: "/v2/verify/pan", latencyMs: 560 },
      auth: { status: "HEALTHY", label: "OAuth2 Govt Token", mode: "JWT RSA-256" },
      backend: { status: "HEALTHY", label: "Central Processing Engine", queueDepth: 12 },
      database: { status: "HEALTHY", label: "Tax Assessment Replicas", poolLoadPct: 42 },
    },
    dependencies: ["svc-identity"],
    sslStatus: { valid: true, expiresDays: 89, tlsVersion: "TLS 1.3", issuer: "e-Mudhra Gov Root" },
    schemaValidation: {
      status: "PASS",
      schemaVersion: "v2.0.4",
      lastValidated: "2 mins ago",
      details: "Income bracket and assessment year data validated successfully",
    },
    sla: {
      targetAvailability: 99.0,
      currentAvailability: 99.4,
      targetResponseMs: 1000,
      currentResponseMs: 680,
      breached: false,
    },
    history24h: { availability: 99.4, requests: 43200, errors: 172, incidents: 0, avgLatency: 672 },
  },
  {
    id: "svc-document",
    name: "Document Verification Portal",
    department: "Digital Locker & Citizen",
    serviceType: "PORTAL",
    url: "https://api.digitallocker.gov.in/public/oauth2/1/file",
    status: "HEALTHY",
    availability: 99.9,
    latency: 510,
    baselineLatency: 500,
    errorRate: 0.1,
    requestRate: 3100,
    lastChecked: "Just now",
    metrics: { avg: 510, min: 280, max: 820, p50: 490, p95: 680, p99: 790 },
    errorBreakdown: {
      total: 31000,
      successful: 30969,
      err4xx: 21,
      err5xx: 6,
      timeouts: 2,
      connectionFailures: 1,
      validationFailures: 1,
    },
    components: {
      website: { status: "HEALTHY", label: "Doc Gateway Online", latencyMs: 70 },
      frontend: { status: "HEALTHY", label: "Storage Viewer Active", errors: 0 },
      api: { status: "HEALTHY", label: "File Fetch API 200", endpoint: "/public/oauth2/1/file", latencyMs: 440 },
      auth: { status: "HEALTHY", label: "DigiLocker Consent Ticket", mode: "PKCE Bearer" },
      backend: { status: "HEALTHY", label: "Cryptographic Verifier", queueDepth: 2 },
      database: { status: "HEALTHY", label: "Metadata Storage Cluster", poolLoadPct: 35 },
    },
    dependencies: ["svc-identity"],
    sslStatus: { valid: true, expiresDays: 210, tlsVersion: "TLS 1.3", issuer: "DigiCert India Public" },
    schemaValidation: {
      status: "PASS",
      schemaVersion: "v1.4.0",
      lastValidated: "30s ago",
      details: "W3C Verifiable Credentials schema conforms to DigiLocker spec",
    },
    sla: {
      targetAvailability: 99.5,
      currentAvailability: 99.9,
      targetResponseMs: 750,
      currentResponseMs: 510,
      breached: false,
    },
    history24h: { availability: 99.9, requests: 74200, errors: 74, incidents: 0, avgLatency: 505 },
  },
  {
    id: "svc-education-erp",
    name: "Education Department ERP",
    department: "Higher Education",
    serviceType: "ERP",
    url: "https://erp.highereducation.gov.in/services/scholarship/process",
    status: "HEALTHY",
    availability: 98.9,
    latency: 720,
    baselineLatency: 650,
    errorRate: 0.8,
    requestRate: 1150,
    lastChecked: "Just now",
    metrics: { avg: 720, min: 450, max: 1400, p50: 690, p95: 980, p99: 1250 },
    errorBreakdown: {
      total: 11500,
      successful: 11408,
      err4xx: 48,
      err5xx: 32,
      timeouts: 8,
      connectionFailures: 2,
      validationFailures: 2,
    },
    components: {
      website: { status: "HEALTHY", label: "Department Portal Active", latencyMs: 140 },
      frontend: { status: "HEALTHY", label: "Officer Console Live", errors: 0 },
      api: { status: "HEALTHY", label: "Scholarship Core REST", endpoint: "/services/scholarship", latencyMs: 580 },
      auth: { status: "HEALTHY", label: "State Officer SSO SAML", mode: "Gov SSO" },
      backend: { status: "HEALTHY", label: "Legacy Workflow Connector", queueDepth: 18 },
      database: { status: "HEALTHY", label: "Scholarship DB Cluster", poolLoadPct: 54 },
    },
    dependencies: ["svc-identity", "svc-income", "svc-document"],
    sslStatus: { valid: true, expiresDays: 64, tlsVersion: "TLS 1.2", issuer: "NIC Enterprise CA" },
    schemaValidation: {
      status: "PASS",
      schemaVersion: "v4.1.0",
      lastValidated: "1 min ago",
      details: "Student eligibility mapping & institutional quotas validated",
    },
    sla: {
      targetAvailability: 99.0,
      currentAvailability: 98.9,
      targetResponseMs: 1000,
      currentResponseMs: 720,
      breached: false,
    },
    history24h: { availability: 98.9, requests: 27600, errors: 221, incidents: 0, avgLatency: 715 },
  },
  {
    id: "svc-payment",
    name: "Payment Gateway",
    department: "Treasury & Public Finance",
    serviceType: "GATEWAY",
    url: "https://bharatkosh.gov.in/pg/v1/disbursement/verify",
    status: "HEALTHY",
    availability: 99.6,
    latency: 640,
    baselineLatency: 600,
    errorRate: 0.3,
    requestRate: 2890,
    lastChecked: "Just now",
    metrics: { avg: 640, min: 320, max: 1050, p50: 610, p95: 850, p99: 990 },
    errorBreakdown: {
      total: 28900,
      successful: 28813,
      err4xx: 52,
      err5xx: 24,
      timeouts: 7,
      connectionFailures: 2,
      validationFailures: 2,
    },
    components: {
      website: { status: "HEALTHY", label: "Treasury Portal Active", latencyMs: 95 },
      frontend: { status: "HEALTHY", label: "UPI / NEFT Switcher", errors: 0 },
      api: { status: "HEALTHY", label: "DBT Direct Payment API", endpoint: "/pg/v1/disbursement", latencyMs: 545 },
      auth: { status: "HEALTHY", label: "NPCI / RBI Certificate", mode: "Hardware Security Token" },
      backend: { status: "HEALTHY", label: "Settlement Ledger Engine", queueDepth: 8 },
      database: { status: "HEALTHY", label: "Audited Ledger Replicas", poolLoadPct: 38 },
    },
    dependencies: ["svc-education-erp"],
    sslStatus: { valid: true, expiresDays: 195, tlsVersion: "TLS 1.3", issuer: "SafeScrypt Govt CA" },
    schemaValidation: {
      status: "PASS",
      schemaVersion: "v2.8.1-npci",
      lastValidated: "45s ago",
      details: "PFMS transaction payload conforms to RBI DBT standards",
    },
    sla: {
      targetAvailability: 99.5,
      currentAvailability: 99.6,
      targetResponseMs: 800,
      currentResponseMs: 640,
      breached: false,
    },
    history24h: { availability: 99.6, requests: 69300, errors: 208, incidents: 0, avgLatency: 635 },
  },
  {
    id: "svc-eligibility",
    name: "Eligibility Service",
    department: "Social Welfare & Schemes",
    serviceType: "SERVICE",
    url: "https://schemes.gov.in/rules/v3/evaluate",
    status: "HEALTHY",
    availability: 99.7,
    latency: 380,
    baselineLatency: 350,
    errorRate: 0.1,
    requestRate: 1950,
    lastChecked: "Just now",
    metrics: { avg: 380, min: 190, max: 620, p50: 360, p95: 510, p99: 590 },
    errorBreakdown: {
      total: 19500,
      successful: 19480,
      err4xx: 12,
      err5xx: 5,
      timeouts: 1,
      connectionFailures: 1,
      validationFailures: 1,
    },
    components: {
      website: { status: "HEALTHY", label: "Scheme Directory Online", latencyMs: 65 },
      frontend: { status: "HEALTHY", label: "Rule Configurator", errors: 0 },
      api: { status: "HEALTHY", label: "Scheme Evaluation API", endpoint: "/rules/v3/evaluate", latencyMs: 315 },
      auth: { status: "HEALTHY", label: "Internal Service JWT", mode: "Mutual TLS" },
      backend: { status: "HEALTHY", label: "Rules Inference Engine", queueDepth: 1 },
      database: { status: "HEALTHY", label: "Scheme Guidelines In-Memory", poolLoadPct: 22 },
    },
    dependencies: ["svc-income", "svc-identity"],
    sslStatus: { valid: true, expiresDays: 310, tlsVersion: "TLS 1.3", issuer: "NIC CA 2024" },
    schemaValidation: {
      status: "PASS",
      schemaVersion: "v3.0.0",
      lastValidated: "3 mins ago",
      details: "Statutory reservation & income ceilings match latest gazette",
    },
    sla: {
      targetAvailability: 99.5,
      currentAvailability: 99.7,
      targetResponseMs: 500,
      currentResponseMs: 380,
      breached: false,
    },
    history24h: { availability: 99.7, requests: 46800, errors: 47, incidents: 0, avgLatency: 375 },
  },
  {
    id: "svc-notification",
    name: "Notification Service",
    department: "Digital Communications",
    serviceType: "SERVICE",
    url: "https://notify.gov.in/sms/v1/dispatch",
    status: "HEALTHY",
    availability: 99.5,
    latency: 290,
    baselineLatency: 280,
    errorRate: 0.2,
    requestRate: 4200,
    lastChecked: "Just now",
    metrics: { avg: 290, min: 140, max: 550, p50: 275, p95: 410, p99: 490 },
    errorBreakdown: {
      total: 42000,
      successful: 41916,
      err4xx: 54,
      err5xx: 20,
      timeouts: 5,
      connectionFailures: 3,
      validationFailures: 2,
    },
    components: {
      website: { status: "HEALTHY", label: "Gov Messaging Gateway", latencyMs: 50 },
      frontend: { status: "HEALTHY", label: "Template Registry Active", errors: 0 },
      api: { status: "HEALTHY", label: "Dispatch Engine 200", endpoint: "/sms/v1/dispatch", latencyMs: 240 },
      auth: { status: "HEALTHY", label: "DLT Registration Valid", mode: "API Key + HMAC" },
      backend: { status: "HEALTHY", label: "Telecom Provider Multi-Router", queueDepth: 14 },
      database: { status: "HEALTHY", label: "Delivery Report Ledger", poolLoadPct: 31 },
    },
    dependencies: [],
    sslStatus: { valid: true, expiresDays: 175, tlsVersion: "TLS 1.3", issuer: "NIC Enterprise CA" },
    schemaValidation: {
      status: "PASS",
      schemaVersion: "v2.1.0",
      lastValidated: "1 min ago",
      details: "TRAI registered template IDs verified",
    },
    sla: {
      targetAvailability: 99.0,
      currentAvailability: 99.5,
      targetResponseMs: 450,
      currentResponseMs: 290,
      breached: false,
    },
    history24h: { availability: 99.5, requests: 100800, errors: 201, incidents: 0, avgLatency: 288 },
  },
];

// In-Memory State
let services: MonitoredService[] = JSON.parse(JSON.stringify(INITIAL_SERVICES));
let incidents: HealthIncident[] = [];
let currentScenario: SimulationScenario = "NORMAL";
let lastUpdatedTime: string = new Date().toLocaleTimeString("en-IN", { hour12: false });

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  lastUpdatedTime = new Date().toLocaleTimeString("en-IN", { hour12: false });
  listeners.forEach((l) => l());
}

export function subscribeHealthUpdates(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Background Simulated Jitter Ticker
let tickerInterval: any = null;
export function startHealthTicker() {
  if (tickerInterval) return;
  tickerInterval = setInterval(() => {
    // Apply micro-variations to healthy services so the dashboard feels truly live
    services.forEach((s) => {
      if (s.status === "HEALTHY") {
        const delta = Math.floor((Math.random() - 0.5) * 20);
        s.latency = Math.max(150, s.baselineLatency + delta);
        s.lastChecked = "Just now";
      }
    });
    notify();
  }, 4000);
}

// Transparent Health Score Breakdown
export interface HealthScoreBreakdown {
  overallScore: number;
  availabilityScore: number; // weight 30%
  apiSuccessScore: number; // weight 25%
  latencyScore: number; // weight 20%
  dependencyScore: number; // weight 15%
  incidentPenalty: number; // penalty up to 10%
  availabilityPct: number;
  apiSuccessPct: number;
  latencyRating: "Optimal" | "Elevated" | "Severe";
  dependencyRating: "Healthy" | "Degraded" | "Broken";
  details: {
    totalServices: number;
    healthyServices: number;
    degradedServices: number;
    downServices: number;
  };
}

export function calculateHealthScore(): HealthScoreBreakdown {
  const total = services.length;
  const healthyCount = services.filter((s) => s.status === "HEALTHY").length;
  const degradedCount = services.filter((s) => s.status === "DEGRADED" || s.status === "WARNING").length;
  const downCount = services.filter((s) => s.status === "DOWN").length;

  const avgAvailability = services.reduce((acc, s) => acc + s.availability, 0) / total;
  const avgErrorRate = services.reduce((acc, s) => acc + s.errorRate, 0) / total;
  const apiSuccessPct = Math.max(0, 100 - avgErrorRate);

  const avgLatency = services.reduce((acc, s) => acc + s.latency, 0) / total;
  const avgBaseline = services.reduce((acc, s) => acc + s.baselineLatency, 0) / total;
  const latencyRatio = avgLatency / (avgBaseline || 1);

  // Component scores
  const availabilityScore = Math.min(30, (avgAvailability / 100) * 30);
  const apiSuccessScore = Math.min(25, (apiSuccessPct / 100) * 25);
  const latencyScore = latencyRatio <= 1.1 ? 20 : latencyRatio <= 1.5 ? 14 : latencyRatio <= 2.5 ? 8 : 2;
  const dependencyScore = downCount > 0 ? 5 : degradedCount > 0 ? 11 : 15;
  const incidentPenalty = Math.min(10, incidents.filter((i) => i.status !== "RECOVERED").length * 5);

  const overallScore = Math.max(10, Math.round(availabilityScore + apiSuccessScore + latencyScore + dependencyScore - incidentPenalty));

  return {
    overallScore,
    availabilityScore: Math.round(availabilityScore),
    apiSuccessScore: Math.round(apiSuccessScore),
    latencyScore,
    dependencyScore,
    incidentPenalty,
    availabilityPct: Number(avgAvailability.toFixed(1)),
    apiSuccessPct: Number(apiSuccessPct.toFixed(1)),
    latencyRating: latencyRatio <= 1.1 ? "Optimal" : latencyRatio <= 1.5 ? "Elevated" : "Severe",
    dependencyRating: downCount > 0 ? "Broken" : degradedCount > 0 ? "Degraded" : "Healthy",
    details: {
      totalServices: 24, // synthetic prototype ecosystem scale
      healthyServices: 21 - (total - healthyCount),
      degradedServices: 2 + degradedCount,
      downServices: 1 + downCount,
    },
  };
}

export function getMonitoredServices(): MonitoredService[] {
  return services;
}

export function getActiveIncidents(): HealthIncident[] {
  return incidents;
}

export function getLastUpdatedTime(): string {
  return lastUpdatedTime;
}

export function getCurrentScenario(): SimulationScenario {
  return currentScenario;
}

// Department-Scoped Queries
export function getDepartmentServices(departmentName: string): MonitoredService[] {
  if (departmentName.toLowerCase().includes("education")) {
    return services.filter((s) =>
      ["svc-income", "svc-document", "svc-education-erp", "svc-eligibility"].includes(s.id)
    );
  }
  return services.filter((s) => s.department.toLowerCase().includes(departmentName.toLowerCase()));
}

export function getDepartmentIncidents(departmentName: string): HealthIncident[] {
  if (departmentName.toLowerCase().includes("education")) {
    return incidents.filter((i) =>
      ["svc-income", "svc-document", "svc-education-erp", "svc-eligibility"].includes(i.serviceId)
    );
  }
  return incidents.filter((i) => i.department.toLowerCase().includes(departmentName.toLowerCase()));
}

// ----------------------------------------------------
// SIMULATION SCENARIO ENGINE (31.22)
// ----------------------------------------------------

export function triggerSimulation(scenario: SimulationScenario) {
  currentScenario = scenario;
  const timeNow = new Date().toLocaleTimeString("en-IN", { hour12: false });

  if (scenario === "NORMAL") {
    resetMonitoring();
    return;
  }

  if (scenario === "HIGH_LATENCY") {
    // Education ERP response time spikes by 143%
    const erp = services.find((s) => s.id === "svc-education-erp");
    if (erp) {
      erp.status = "DEGRADED";
      erp.latency = 1850;
      erp.errorRate = 4.2;
      erp.availability = 97.8;
      erp.components.api.status = "DEGRADED";
      erp.components.api.latencyMs = 1580;
      erp.components.backend.status = "WARNING";
      erp.components.backend.queueDepth = 84;
      erp.sla.breached = true;
      erp.sla.currentResponseMs = 1850;
      erp.currentIncidentId = "INC-1042";
    }

    const incId = "INC-1042";
    if (!incidents.find((i) => i.id === incId)) {
      incidents.unshift({
        id: incId,
        serviceId: "svc-education-erp",
        serviceName: "Education Department ERP",
        department: "Higher Education",
        status: "ACTIVE",
        severity: "HIGH",
        detectedTime: timeNow,
        trigger: "Response time > 1,500ms baseline threshold",
        currentErrorRate: 4.2,
        affectedWorkflowCount: 12,
        affectedApplications: [
          {
            id: "SCH-2026-1042",
            applicant: "Aarav Sharma",
            workflowStep: "Department Review",
            date: "Today, 19:42",
            status: "Preserved (In-Flight)",
            preserved: true,
            department: "Higher Education",
          },
          {
            id: "SCH-2026-1048",
            applicant: "Rohit Verma",
            workflowStep: "Document Verification",
            date: "Today, 19:40",
            status: "Preserved (In-Flight)",
            preserved: true,
            department: "Higher Education",
          },
          {
            id: "SCH-2026-1051",
            applicant: "Meera Patel",
            workflowStep: "Approval Pending",
            date: "Today, 19:38",
            status: "Preserved (In-Flight)",
            preserved: true,
            department: "Higher Education",
          },
          {
            id: "SCH-2026-1056",
            applicant: "Kunal Iyer",
            workflowStep: "Disbursement Prep",
            date: "Today, 19:35",
            status: "Preserved (In-Flight)",
            preserved: true,
            department: "Higher Education",
          },
        ],
        aiAnalysis: {
          problem: "Education ERP response time increased by +143% from baseline.",
          observedFact: "API latency is measured at 1,850ms with 84 queued requests in legacy gateway.",
          possibleCause: "ERP API dependency is responding slowly under bulk institutional verification load.",
          confidence: 91,
          impact: "12 scholarship review requests delayed. No citizen data lost.",
          recommendedAction: "Activate GovFix asynchronous queue, monitor dependency, and use controlled retry.",
          recoveryStatus: "Controlled retry policy queued.",
          anomalyMetric: {
            baseline: "650–800 ms",
            current: "1,850 ms",
            deviation: "+143% anomaly",
          },
        },
        timeline: [
          {
            time: timeNow,
            stage: "Detection",
            actor: "Health Monitor",
            description: "Detected elevated ERP response latency (1,850 ms)",
            status: "completed",
          },
          {
            time: timeNow,
            stage: "AI Analysis",
            actor: "AI Health Analyst",
            description: "Classified as API latency anomaly with 91% confidence",
            status: "completed",
          },
          {
            time: timeNow,
            stage: "Protection",
            actor: "GovFix Resilience Engine",
            description: "Preserved 12 active citizen workflows with state lock",
            status: "in-progress",
          },
        ],
      });
    }
  } else if (scenario === "API_TIMEOUT") {
    // Income API encounters 504 Gateway Timeout
    const inc = services.find((s) => s.id === "svc-income");
    if (inc) {
      inc.status = "DOWN";
      inc.latency = 4500;
      inc.errorRate = 18.5;
      inc.availability = 94.2;
      inc.components.api.status = "DOWN";
      inc.components.api.latencyMs = 4500;
      inc.components.backend.status = "DOWN";
      inc.errorBreakdown.timeouts += 42;
      inc.currentIncidentId = "INC-1043";
    }

    const incId = "INC-1043";
    if (!incidents.find((i) => i.id === incId)) {
      incidents.unshift({
        id: incId,
        serviceId: "svc-income",
        serviceName: "Income Verification Portal",
        department: "Revenue & Finance",
        status: "ACTIVE",
        severity: "CRITICAL",
        detectedTime: timeNow,
        trigger: "HTTP 504 Gateway Timeout spike > 15%",
        currentErrorRate: 18.5,
        affectedWorkflowCount: 19,
        affectedApplications: [
          {
            id: "ITR-2026-8819",
            applicant: "Aarav Sharma",
            workflowStep: "PAN & Income Cross-Check",
            date: "Today, 19:44",
            status: "Preserved (Queued)",
            preserved: true,
            department: "Revenue & Finance",
          },
          {
            id: "SCH-2026-1042",
            applicant: "Aarav Sharma",
            workflowStep: "Income Verification Step",
            date: "Today, 19:42",
            status: "Preserved (Queued)",
            preserved: true,
            department: "Higher Education",
          },
        ],
        aiAnalysis: {
          problem: "Income Verification Portal returning continuous 504 Gateway Timeouts.",
          observedFact: "Upstream gateway connection drops after 4,500ms with zero payload response.",
          possibleCause: "Central CBDT tax assessment cluster undergoing routine schema re-indexing or database lock.",
          confidence: 94,
          impact: "19 live income verifications paused. GovFix has safely cached submitted tokens.",
          recommendedAction: "Preserve workflow state, withhold repeat submissions, and activate exponential backoff retry.",
          recoveryStatus: "State preserved in GovFix resilient memory.",
          anomalyMetric: {
            baseline: "650 ms",
            current: "4,500 ms",
            deviation: "+592% timeout anomaly",
          },
        },
        timeline: [
          {
            time: timeNow,
            stage: "Detection",
            actor: "Health Monitor",
            description: "Repeated 504 HTTP Gateway Timeout received on /v2/verify/pan",
            status: "completed",
          },
          {
            time: timeNow,
            stage: "AI Analysis",
            actor: "AI Health Analyst",
            description: "Diagnosed upstream gateway timeout. Verified token validity.",
            status: "completed",
          },
          {
            time: timeNow,
            stage: "Safeguard",
            actor: "GovFix Safe Gate",
            description: "Temporarily blocked duplicate citizen retries to prevent account lockout",
            status: "completed",
          },
        ],
      });
    }
  } else if (scenario === "ERROR_500") {
    // Payment Gateway 5xx Spike
    const pay = services.find((s) => s.id === "svc-payment");
    if (pay) {
      pay.status = "DOWN";
      pay.latency = 2200;
      pay.errorRate = 14.2;
      pay.availability = 92.5;
      pay.components.api.status = "DOWN";
      pay.components.backend.status = "DOWN";
      pay.components.database.status = "WARNING";
      pay.errorBreakdown.err5xx += 88;
      pay.currentIncidentId = "INC-1044";
    }

    const incId = "INC-1044";
    if (!incidents.find((i) => i.id === incId)) {
      incidents.unshift({
        id: incId,
        serviceId: "svc-payment",
        serviceName: "Payment Gateway",
        department: "Treasury & Public Finance",
        status: "ACTIVE",
        severity: "CRITICAL",
        detectedTime: timeNow,
        trigger: "5xx Internal Server Error rate > 10%",
        currentErrorRate: 14.2,
        affectedWorkflowCount: 27,
        affectedApplications: [
          {
            id: "PAY-2026-4412",
            applicant: "Sunil Kumar",
            workflowStep: "Direct Benefit Transfer (DBT)",
            date: "Today, 19:46",
            status: "Preserved (Idempotent Lock)",
            preserved: true,
            department: "Treasury & Public Finance",
          },
          {
            id: "SCH-2026-1056",
            applicant: "Kunal Iyer",
            workflowStep: "Disbursement Release",
            date: "Today, 19:35",
            status: "Preserved (Idempotent Lock)",
            preserved: true,
            department: "Higher Education",
          },
        ],
        aiAnalysis: {
          problem: "Payment Gateway DBT API returning HTTP 500 Internal Server Errors.",
          observedFact: "Treasury settlement ledger returning unexpected 500 status on disbursement requests.",
          possibleCause: "Banking switch database pool exhaustion or bank token expiration.",
          confidence: 89,
          impact: "27 payment disbursements halted. Zero duplicate debits executed (Idempotency active).",
          recommendedAction: "Verify transaction ledger state before executing any retry. Do not resubmit blind payments.",
          recoveryStatus: "Idempotency key lock active.",
          anomalyMetric: {
            baseline: "0.3% error rate",
            current: "14.2% error rate",
            deviation: "Critical error spike",
          },
        },
        timeline: [
          {
            time: timeNow,
            stage: "Detection",
            actor: "Health Monitor",
            description: "Detected HTTP 500 on /pg/v1/disbursement/verify",
            status: "completed",
          },
          {
            time: timeNow,
            stage: "Ledger Audit",
            actor: "GovFix Idempotency Guard",
            description: "Confirmed zero duplicate charges recorded on citizen accounts",
            status: "completed",
          },
        ],
      });
    }
  } else if (scenario === "ERP_FAILURE") {
    // Education ERP completely down
    const erp = services.find((s) => s.id === "svc-education-erp");
    if (erp) {
      erp.status = "DOWN";
      erp.latency = 5000;
      erp.errorRate = 100;
      erp.availability = 88.0;
      erp.components.website.status = "WARNING";
      erp.components.api.status = "DOWN";
      erp.components.backend.status = "DOWN";
      erp.components.database.status = "DOWN";
      erp.currentIncidentId = "INC-1045";
    }

    const incId = "INC-1045";
    if (!incidents.find((i) => i.id === incId)) {
      incidents.unshift({
        id: incId,
        serviceId: "svc-education-erp",
        serviceName: "Education Department ERP",
        department: "Higher Education",
        status: "ACTIVE",
        severity: "CRITICAL",
        detectedTime: timeNow,
        trigger: "ERP backend connection refused / port unresponsive",
        currentErrorRate: 100,
        affectedWorkflowCount: 38,
        affectedApplications: [
          {
            id: "SCH-2026-1042",
            applicant: "Aarav Sharma",
            workflowStep: "Department Review",
            date: "Today, 19:42",
            status: "Preserved (GovFix Buffer)",
            preserved: true,
            department: "Higher Education",
          },
        ],
        aiAnalysis: {
          problem: "Education Department ERP connection refused on port 8443.",
          observedFact: "Health checker probe timed out with socket reset.",
          possibleCause: "ERP Tomcat application server crashed or scheduled maintenance reboot.",
          confidence: 96,
          impact: "38 scholarship workflows buffered in GovFix gateway. Citizen portal remains accessible.",
          recommendedAction: "Alert Education Department system officer. GovFix will auto-replay buffer once connection re-establishes.",
          recoveryStatus: "GovFix resilience queue buffering incoming submissions.",
          anomalyMetric: {
            baseline: "99.0% availability",
            current: "88.0% availability",
            deviation: "Service Down",
          },
        },
        timeline: [
          {
            time: timeNow,
            stage: "Detection",
            actor: "Health Monitor",
            description: "Connection refused on erp.highereducation.gov.in",
            status: "completed",
          },
          {
            time: timeNow,
            stage: "Buffering",
            actor: "GovFix Resilience Queue",
            description: "Queued 38 citizen applications with encrypted payload protection",
            status: "in-progress",
          },
        ],
      });
    }
  } else if (scenario === "DEPENDENCY_FAILURE") {
    // Cascade failure: Income API down -> affects Education ERP -> affects Payment
    const income = services.find((s) => s.id === "svc-income");
    const erp = services.find((s) => s.id === "svc-education-erp");
    const payment = services.find((s) => s.id === "svc-payment");

    if (income) {
      income.status = "DOWN";
      income.latency = 4200;
      income.errorRate = 22.0;
    }
    if (erp) {
      erp.status = "DEGRADED";
      erp.latency = 1950;
      erp.errorRate = 8.5;
    }
    if (payment) {
      payment.status = "WARNING";
      payment.latency = 1100;
    }

    const incId = "INC-1046";
    if (!incidents.find((i) => i.id === incId)) {
      incidents.unshift({
        id: incId,
        serviceId: "svc-income",
        serviceName: "Cascading Dependency Failure (Income API → Education ERP)",
        department: "Cross-Department",
        status: "ACTIVE",
        severity: "CRITICAL",
        detectedTime: timeNow,
        trigger: "Downstream dependency failure propagated upstream",
        currentErrorRate: 18.2,
        affectedWorkflowCount: 45,
        affectedApplications: [
          {
            id: "SCH-2026-1042",
            applicant: "Aarav Sharma",
            workflowStep: "Cross-Verification Chain",
            date: "Today, 19:42",
            status: "Preserved (Dependency Guard)",
            preserved: true,
            department: "Higher Education",
          },
        ],
        aiAnalysis: {
          problem: "Cascading dependency failure originating from Income Verification Portal.",
          observedFact: "Education ERP blocked while awaiting income verification for 45 candidates.",
          possibleCause: "Income API database outage halting downstream scholarship approvals.",
          confidence: 97,
          impact: "Full pipeline degraded. Dependency map displays affected path in red.",
          recommendedAction: "Isolate Income API dependency. Enable GovFix verified credential bypass for pre-validated citizens.",
          recoveryStatus: "Dependency circuit breaker engaged.",
        },
        timeline: [
          {
            time: timeNow,
            stage: "Detection",
            actor: "Health Monitor",
            description: "Identified cascade root cause at svc-income",
            status: "completed",
          },
          {
            time: timeNow,
            stage: "Circuit Breaker",
            actor: "GovFix Gateway",
            description: "Tripped circuit breaker to prevent Education ERP thread starvation",
            status: "completed",
          },
        ],
      });
    }
  } else if (scenario === "RECOVERING") {
    triggerRecovery();
    return;
  }

  notify();
}

// ----------------------------------------------------
// INCIDENT ACTIONS & AUTOMATED RECOVERY (31.14, 31.22)
// ----------------------------------------------------

export function acknowledgeIncident(incidentId: string) {
  const inc = incidents.find((i) => i.id === incidentId);
  if (inc) {
    inc.status = "ACKNOWLEDGED";
    inc.timeline.push({
      time: new Date().toLocaleTimeString("en-IN", { hour12: false }),
      stage: "Acknowledgment",
      actor: "Department Officer / Admin",
      description: "Incident acknowledged. Investigation protocol assigned.",
      status: "completed",
    });
    notify();
  }
}

export function triggerRecovery(targetServiceId?: string) {
  currentScenario = "RECOVERING";
  const timeNow = new Date().toLocaleTimeString("en-IN", { hour12: false });

  // Update affected services to RECOVERING state
  services.forEach((s) => {
    if (!targetServiceId || s.id === targetServiceId || s.status !== "HEALTHY") {
      s.status = "RECOVERING";
      s.recoveryStatus = "Verifying automated recovery...";
      s.latency = Math.round(s.baselineLatency * 1.15);
      s.errorRate = 0.5;
    }
  });

  // Update active incidents with recovery timeline events
  incidents.forEach((inc) => {
    if (inc.status !== "RECOVERED") {
      inc.status = "RESOLVING";
      inc.timeline.push({
        time: timeNow,
        stage: "GovFix Recovery",
        actor: "GovFix Auto-Healer",
        description: "Retry policy activated. Health re-check probe dispatched.",
        status: "in-progress",
      });
    }
  });

  notify();

  // Simulate complete verification and recovery transition after 2.5 seconds
  setTimeout(() => {
    services.forEach((s) => {
      const initial = INITIAL_SERVICES.find((i) => i.id === s.id);
      if (initial) {
        Object.assign(s, JSON.parse(JSON.stringify(initial)));
      }
      s.status = "HEALTHY";
      s.recoveryStatus = "Service verified & healthy";
      s.lastChecked = "Just now";
    });

    incidents.forEach((inc) => {
      inc.status = "RECOVERED";
      inc.timeline.push({
        time: new Date().toLocaleTimeString("en-IN", { hour12: false }),
        stage: "Verification",
        actor: "Health Monitor",
        description: "Health re-check probes returned 200 OK. 0 errors detected.",
        status: "completed",
      });
      inc.timeline.push({
        time: new Date().toLocaleTimeString("en-IN", { hour12: false }),
        stage: "Closure",
        actor: "GovFix Incident Engine",
        description: "Service marked RECOVERED. All buffered citizen workflows replayed.",
        status: "completed",
      });
    });

    currentScenario = "NORMAL";
    notify();
  }, 2500);
}

export function resetMonitoring() {
  services = JSON.parse(JSON.stringify(INITIAL_SERVICES));
  incidents = [];
  currentScenario = "NORMAL";
  notify();
}

// Start live ticker when module initializes
if (typeof window !== "undefined") {
  startHealthTicker();
}
