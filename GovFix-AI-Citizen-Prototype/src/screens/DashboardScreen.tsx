import { useEffect, useState } from "react";
import type { Screen } from "../App";
import { GOVERNMENT_SERVICES_REGISTRY, getServiceById } from "../config/governmentServices";
import { dispatchCitizenServiceRequest, gatewayRequestQueue } from "../services/apiGateway";
import {
  APPLICATIONS_UPDATED_EVENT,
  addApplication,
  getApplications,
} from "../services/applicationStore";
import { getPortalDraft, savePortalDraft } from "../services/draftStore";
import type { QueueSnapshot } from "../services/requestQueue";
import type { NormalizedResponse } from "../types/apiResponse";
import type { GovernmentServiceMetadata } from "../types/governmentService";

interface Props {
  nav: (s: Screen) => void;
  initialCategory?: string | null;
}

export type CategoryId =
  | "education"
  | "revenue"
  | "finance"
  | "services"
  | "transport"
  | "utilities"
  | "health";

interface ServiceItem {
  id: string;
  name: string;
  description: string;
  badge: string;
  badgeColor: "success" | "blue" | "amber" | "neutral";
  actionType: "preview";
}

interface CategoryData {
  id: CategoryId;
  name: string;
  description: string;
  count: string;
  iconBg: string;
  iconColor: string;
  icon: JSX.Element;
  services: ServiceItem[];
}

interface ErpApplication {
  applicationId: string;
  citizenId: string;
  department: string;
  status: "PROCESSING" | "APPROVED" | "ACTION_REQUIRED" | "PAYMENT_PENDING";
  source: string;
  officerNote: string;
  updatedAt: string;
}

const CITIZEN_PREFILL_DATA: Record<string, Record<string, any>> = {
  "academic-records": {
    rollNumber: "2022CS0891",
    passingYear: "2022",
    boardOrUniversity: "CBSE & VTU",
    examType: "Senior School Certificate",
  },
  "admissions": {
    applicationNumber: "CUET26009841",
    candidateName: "Aarav Sharma",
    selectedProgram: "B.Tech Computer Engineering",
    preferenceOrder: "Preference #1",
  },
  "education-schemes": {
    studentId: "STU-RVCE-2022-891",
    institutionCode: "INST-0481",
    schemeCode: "SCHEME-SCC-2026",
  },
  "driving-licence": {
    licenceNumber: "KA-01-2016-0038912",
    dateOfBirth: "2004-04-12",
    rtoOfficeCode: "KA-01",
    serviceRequestType: "Address Update & Smart Card",
  },
  "vehicle-registration": {
    registrationNumber: "KA-05-NB-4482",
    chassisNumberLast5: "88219",
  },
  "traffic-challan": {
    vehicleOrChallanNumber: "KA-05-NB-4482",
  },
  "public-transport": {
    cardNumber: "4092 •••• •••• 9924",
    operatorCode: "BMRCL-NCMC",
  },
  "electricity-bill": {
    consumerId: "BES-9821044",
    discomCode: "BESCOM",
  },
  "water-bill": {
    connectionNumber: "BW-4091-B",
    subdivisionCode: "IND-02",
  },
  "gas-services": {
    lpgId17Digit: "2891448102914410",
    distributorCode: "INDANE-441",
  },
  "income-tax": {
    assessmentYear: "AY 2025-26",
    panMasked: "ABCDE••••F",
    acknowledgmentNumber: "e-ITR-992014819",
  },
  "property-tax": {
    propertyIdOrSAS: "PID-108-94-22",
    wardNumber: "Ward 112 (Indiranagar)",
  },
  "pension": {
    pranNumber: "110098248192",
    subscriberDob: "2004-04-12",
  },
  "other-finance": {
    schemeCode: "PM-JAN-DHAN-LINK",
    bankBranchIfsc: "SBIN0004821",
  },
  "health-records": {
    abhaAddressOrNumber: "arjun.ramesh@abdm",
  },
  "health-schemes": {
    rationCardOrAadhaarRef: "KA-RC-992018",
    stateCode: "KA",
  },
  "appointments": {
    hospitalCode: "AIIMS-01",
    departmentName: "General Medicine OPD",
    appointmentDate: "2026-09-24",
  },
  "certificates": {
    certificateType: "Income & Domicile Certificate",
    applicantName: "Aarav Sharma",
    talukCode: "BLR-EAST",
    annualFamilyIncome: "₹3,80,000",
  },
  "citizen-schemes": {
    farmerRegistrationOrRefId: "KA-DBT-88192",
    stateCode: "KA",
  },
  "identity-services": {
    identityReferenceToken: "CIT-2026-001",
    verificationType: "Aadhaar Demographic e-KYC",
  },
};

export default function DashboardScreen({ nav, initialCategory = null }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(
    (initialCategory as CategoryId) || null
  );
  const [activeServiceId, setActiveServiceId] = useState<string | null>(null);
  const [modalStep, setModalStep] = useState<"details" | "consent" | "processing" | "result">("details");
  const [serviceResult, setServiceResult] = useState<NormalizedResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [portalUrl, setPortalUrl] = useState("");
  const [portalNote, setPortalNote] = useState("");
  const [portalError, setPortalError] = useState("");
  const [queueSnapshot, setQueueSnapshot] = useState<QueueSnapshot>(gatewayRequestQueue.snapshot());
  const [erpApplications, setErpApplications] = useState<ErpApplication[]>([]);
  const [applicationCount, setApplicationCount] = useState(() => getApplications().length);

  useEffect(() => {
    const savedDraft = getPortalDraft();
    if (savedDraft) {
      setPortalUrl(savedDraft.portalUrl);
      setPortalNote(savedDraft.note);
    }

    void fetch("/api/erp/applications")
      .then((response) => (response.ok ? response.json() : []))
      .then((records: ErpApplication[]) => setErpApplications(records))
      .catch(() => setErpApplications([]));

    const refreshApplicationCount = () => setApplicationCount(getApplications().length);
    window.addEventListener(APPLICATIONS_UPDATED_EVENT, refreshApplicationCount);
    window.addEventListener("storage", refreshApplicationCount);

    const unsubscribeFromQueue = gatewayRequestQueue.subscribe(setQueueSnapshot);
    return () => {
      unsubscribeFromQueue();
      window.removeEventListener(APPLICATIONS_UPDATED_EVENT, refreshApplicationCount);
      window.removeEventListener("storage", refreshApplicationCount);
    };
  }, []);

  const handleOpenPortal = () => {
    const trimmedUrl = portalUrl.trim();
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(trimmedUrl);
    } catch {
      setPortalError("Enter a complete HTTPS address, for example https://services.india.gov.in.");
      return;
    }

    if (parsedUrl.protocol !== "https:") {
      setPortalError("For your safety, only secure HTTPS government websites can be opened.");
      return;
    }

    const isIndianGovernmentDomain =
      parsedUrl.hostname.endsWith(".gov.in") ||
      parsedUrl.hostname.endsWith(".nic.in") ||
      parsedUrl.hostname === "gov.in" ||
      parsedUrl.hostname === "nic.in";

    if (!isIndianGovernmentDomain) {
      setPortalError("Use an official Indian government website ending in .gov.in or .nic.in.");
      return;
    }

    setPortalError("");
    const existingDraft = getPortalDraft();
    savePortalDraft({
      portalUrl: parsedUrl.toString(),
      serviceId: existingDraft?.serviceId,
      payload: existingDraft?.payload || {},
      note: portalNote,
    });
    window.open(parsedUrl.toString(), "_blank", "noopener,noreferrer");
  };

  const handleOpenService = (svcId: string) => {
    setActiveServiceId(svcId);
    setModalStep("details");
    setServiceResult(null);
  };

  const handleProceedToConsent = () => {
    setModalStep("consent");
  };

  const handleExecuteRequest = async () => {
    if (!activeServiceId) return;
    setModalStep("processing");
    setIsProcessing(true);

    const service = getServiceById(activeServiceId);
    const prefill = CITIZEN_PREFILL_DATA[activeServiceId] || {
      citizenId: "CIT-2026-001",
      applicantName: "Aarav Sharma",
    };

    savePortalDraft({
      portalUrl,
      serviceId: activeServiceId,
      payload: prefill,
      note: portalNote,
    });

    const response = await dispatchCitizenServiceRequest(
      activeServiceId,
      "CIT-2026-001",
      prefill,
      true
    );

    setServiceResult(response);
    setIsProcessing(false);
    setModalStep("result");

    if (response.success && service) {
      const data = response.data || {};
      const appId =
        data.applicationId ||
        data.acknowledgmentNumber ||
        data.receiptNumber ||
        `GF-2026-${Math.floor(10000 + Math.random() * 90000)}`;

      addApplication({
        id: appId,
        service: service.serviceName.split("(")[0].trim(),
        category: service.category.charAt(0).toUpperCase() + service.category.slice(1),
        scheme: service.serviceName,
        date:
          new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }) +
          `, ${new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          })} IST`,
        status:
          response.status === "completed"
            ? "Completed"
            : response.status === "processing"
            ? "Processing"
            : "Submitted",
        statusColor: response.status === "completed" ? "emerald" : "blue",
        govRef: data.portal || service.provider.split("/")[0].trim(),
        amount: data.annualGrant || data.currentBillAmount || data.totalAssessedTax || undefined,
        note: `Processed through GovFix Government API Gateway (${service.connectorType}).`,
      });
    }
  };

  const categories: CategoryData[] = [
    {
      id: "education",
      name: "Education",
      description: "Scholarships, Admissions, and Verification (DigiLocker/NAD)",
      count: "4 Services",
      iconBg: "rgba(106, 22, 184, 0.1)",
      iconColor: "#6A16B8",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 3L2 8l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M4 11v6a8 8 0 0016 0v-6" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      ),
      services: [
        {
          id: "education-schemes",
          name: "Scholarships (Merit-cum-Means & DBT)",
          description: "Cross-department national & state student scholarships, tuition grants, and book aid",
          badge: "ERP Integrated",
          badgeColor: "success",
          actionType: "preview",
        },
        {
          id: "admissions",
          name: "Admissions Portal",
          description: "CUET Counseling, State Higher Education Enrollment, and seat allotment",
          badge: "Requires Authorization",
          badgeColor: "neutral",
          actionType: "preview",
        },
        {
          id: "academic-records",
          name: "Academic Records & Verification",
          description: "DigiLocker verified marksheets, degree certificates, and institution records",
          badge: "Requires Authorization",
          badgeColor: "neutral",
          actionType: "preview",
        },
        {
          id: "education-welfare",
          name: "Education Welfare Schemes",
          description: "Eligible education support, fee relief, and student welfare schemes",
          badge: "Sandbox",
          badgeColor: "amber",
          actionType: "preview",
        },
      ],
    },
    {
      id: "revenue",
      name: "Revenue",
      description: "Income certificates, Caste certificates, and Domicile verification",
      count: "3 Services",
      iconBg: "rgba(255, 122, 24, 0.12)",
      iconColor: "#FF7A18",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      services: [
        {
          id: "certificates",
          name: "Income Certificate Issuance",
          description: "Tahsildar authenticated family annual income certification for scholarships and DBT subsidies",
          badge: "ERP Integrated",
          badgeColor: "success",
          actionType: "preview",
        },
        {
          id: "certificates",
          name: "Caste & Social Category Certificate",
          description: "Community and social welfare reservation verification and digital certificate issuance",
          badge: "ERP Integrated",
          badgeColor: "success",
          actionType: "preview",
        },
        {
          id: "certificates",
          name: "Domicile & Residence Verification",
          description: "Permanent state residence proof authenticated by revenue circle inspector",
          badge: "ERP Integrated",
          badgeColor: "success",
          actionType: "preview",
        },
      ],
    },
    {
      id: "finance",
      name: "Finance",
      description: "Direct Benefit Transfer (DBT), Grants, Subsidies & Pensions",
      count: "4 Services",
      iconBg: "rgba(23, 77, 229, 0.1)",
      iconColor: "#174DE5",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M2 10h20M7 15h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
      services: [
        {
          id: "other-finance",
          name: "Direct Benefit Transfer (DBT) & Treasury Grants",
          description: "PFMS & Aadhaar Payment Bridge (APBS) linked direct benefit credit disbursements",
          badge: "ERP Integrated",
          badgeColor: "success",
          actionType: "preview",
        },
        {
          id: "income-tax",
          name: "Income Tax & AIS",
          description: "ITR Filing, Tax Refund Status, and Annual Information Statement (AIS)",
          badge: "Requires Authorization",
          badgeColor: "neutral",
          actionType: "preview",
        },
        {
          id: "pension",
          name: "Pension & Social Security (NPS / APY)",
          description: "National Pension System (NPS), Atal Pension Yojana, and Jeevan Pramaan",
          badge: "Requires Authorization",
          badgeColor: "neutral",
          actionType: "preview",
        },
        {
          id: "property-tax",
          name: "Property Tax Assessment",
          description: "Municipal property assessment, tax receipts, and online payments",
          badge: "Sandbox",
          badgeColor: "amber",
          actionType: "preview",
        },
      ],
    },
    {
      id: "services",
      name: "Citizen Services",
      description: "Identity (Aadhaar), Ration, Civil Registration & Support",
      count: "3 Services",
      iconBg: "rgba(194, 24, 120, 0.1)",
      iconColor: "#C21878",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
      services: [
        {
          id: "identity-services",
          name: "Identity & Aadhaar e-KYC",
          description: "Aadhaar demographic authentication, biometric lock status, and e-KYC reference tokens",
          badge: "ERP Integrated",
          badgeColor: "success",
          actionType: "preview",
        },
        {
          id: "citizen-schemes",
          name: "Ration & Civil Supplies (ONORC)",
          description: "One Nation One Ration Card (ONORC), NFSA ration entitlements, and Fair Price Shops",
          badge: "Requires Authorization",
          badgeColor: "neutral",
          actionType: "preview",
        },
        {
          id: "certificates",
          name: "Civil Registration (Birth & Life Events)",
          description: "Official civil registry certificates with digital QR authentication",
          badge: "Sandbox",
          badgeColor: "amber",
          actionType: "preview",
        },
      ],
    },
    {
      id: "transport",
      name: "Transport",
      description: "Driving licences, vehicle RC, challans, and transit passes",
      count: "4 Services",
      iconBg: "rgba(23, 27, 104, 0.08)",
      iconColor: "#171B68",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.8" />
          <path d="M7 17v3M17 17v3M3 11h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="7" cy="14" r="1" fill="currentColor" />
          <circle cx="17" cy="14" r="1" fill="currentColor" />
        </svg>
      ),
      services: [
        {
          id: "driving-licence",
          name: "Driving Licence",
          description: "Sarathi Parivahan portal — Renewal, address update, and duplicate DL",
          badge: "Requires Authorization",
          badgeColor: "neutral",
          actionType: "preview",
        },
        {
          id: "vehicle-registration",
          name: "Vehicle Registration",
          description: "Vahan portal — RC details, ownership transfer, and fitness certificates",
          badge: "Requires Authorization",
          badgeColor: "neutral",
          actionType: "preview",
        },
        {
          id: "traffic-challan",
          name: "Traffic Challan",
          description: "e-Challan payment, dispute filing, and violation photograph view",
          badge: "Sandbox",
          badgeColor: "amber",
          actionType: "preview",
        },
        {
          id: "public-transport",
          name: "Public Transport",
          description: "State Bus Smart Card, Metro Pass recharge, and concession passes",
          badge: "Connector Configured",
          badgeColor: "blue",
          actionType: "preview",
        },
      ],
    },
    {
      id: "utilities",
      name: "Utilities",
      description: "Electricity bills, municipal water supply, and gas services",
      count: "3 Services",
      iconBg: "rgba(255, 122, 24, 0.12)",
      iconColor: "#FF7A18",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M13 2L3 14h9l-2 8 10-12h-9l2-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      ),
      services: [
        {
          id: "electricity-bill",
          name: "Electricity Bill",
          description: "State Electricity Board (BESCOM) billing, payment, and subsidy claims",
          badge: "Sandbox",
          badgeColor: "amber",
          actionType: "preview",
        },
        {
          id: "water-bill",
          name: "Water Bill",
          description: "Municipal Water Supply & Sewerage Board meter reading and payment",
          badge: "Requires Authorization",
          badgeColor: "neutral",
          actionType: "preview",
        },
        {
          id: "gas-services",
          name: "Gas Services",
          description: "LPG cylinder refill booking, subsidy transfer status, and PNG connection",
          badge: "Requires Authorization",
          badgeColor: "neutral",
          actionType: "preview",
        },
      ],
    },
    {
      id: "health",
      name: "Health",
      description: "Health records, Ayushman Bharat, and hospital appointments",
      count: "3 Services",
      iconBg: "rgba(240, 45, 131, 0.1)",
      iconColor: "#F02D83",
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
          <path d="M12 7v6M9 10h6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      ),
      services: [
        {
          id: "health-records",
          name: "Health Records",
          description: "ABHA (Ayushman Bharat Health Account) — Lab reports, immunization, prescriptions",
          badge: "Sandbox",
          badgeColor: "amber",
          actionType: "preview",
        },
        {
          id: "health-schemes",
          name: "Government Health Schemes",
          description: "PM-JAY Ayushman Bharat — ₹5 Lakh cashless family hospital cover",
          badge: "Requires Authorization",
          badgeColor: "neutral",
          actionType: "preview",
        },
        {
          id: "appointments",
          name: "Hospital Appointments",
          description: "e-Sanjeevani Teleconsultation, AIIMS OPD booking, and primary health clinic visits",
          badge: "Requires Authorization",
          badgeColor: "neutral",
          actionType: "preview",
        },
      ],
    },
  ];

  const currentCategoryData = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen flex" style={{ background: "#f7f9ff" }}>
      {/* Citizen Sidebar */}
      <aside
        className="w-64 flex flex-col shrink-0"
        style={{ background: "#171B68", minHeight: "100vh" }}
      >
        <div
          className="p-6 flex items-center gap-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow"
            style={{ background: "linear-gradient(135deg, #174DE5, #6A16B8)" }}
          >
            <svg width="18" height="18" viewBox="0 0 22 22" fill="none">
              <path
                d="M11 2L3 7v8l8 5 8-5V7L11 2z"
                stroke="white"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle cx="11" cy="12" r="3" fill="white" />
            </svg>
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-tight">GovFix AI</div>
            <div className="text-[#FF7A18] text-[11px] font-medium">Citizen Experience</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          <button
            onClick={() => nav("citizen")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer text-[#a5b4fc] hover:text-white hover:bg-white/10"
          >
            <span className="text-base">←</span>
            <span>Citizen Dashboard</span>
          </button>

          <button
            onClick={() => nav("mock-portal")}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer bg-white/10 text-white hover:bg-white/15"
          >
            <span>🔑</span>
            <span>GovFix Citizen Key & Autofill</span>
          </button>

          <button
            onClick={() => nav("login")}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer text-[#a5b4fc] hover:text-[#F02D83] hover:bg-white/10"
            title="Sign out and return to Login"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 14H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h3" />
              <polyline points="11 11 14 8 11 5" />
              <line x1="14" y1="8" x2="5" y2="8" />
            </svg>
            <span>Sign Out / Switch Role</span>
          </button>

          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
              selectedCategory === null
                ? "text-white bg-white/15 shadow-sm font-semibold"
                : "text-[#a5b4fc] hover:text-white hover:bg-white/10"
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
              <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => nav("applications")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer text-[#a5b4fc] hover:text-white hover:bg-white/10"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 2h10v12H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="flex-1 flex items-center justify-between">
              <span>My Applications</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#FF7A18] text-white">
                {applicationCount}
              </span>
            </div>
          </button>

          <div className="pt-4 pb-2">
            <div className="text-[10px] font-bold uppercase tracking-wider text-[#a5b4fc] px-3">
              Categories
            </div>
          </div>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                selectedCategory === cat.id
                  ? "text-[#FF7A18] bg-[#FF7A18]/15 font-semibold"
                  : "text-[#a5b4fc] hover:text-white hover:bg-white/10"
              }`}
            >
              <span>{cat.name}</span>
              <span className="text-[10px] text-[#8fa3ea]">{cat.count}</span>
            </button>
          ))}
        </nav>

        {/* Citizen Profile & Reference ID Clarification */}
        <div className="p-4">
          <div
            className="rounded-2xl p-4 border border-white/10"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div className="flex items-center gap-2.5 mb-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                style={{ background: "linear-gradient(135deg, #174DE5, #6A16B8)" }}
              >
                AR
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-white text-xs font-bold truncate">Aarav Sharma</div>
                <div className="text-emerald-400 text-[10px] font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Verified Citizen
                </div>
              </div>
            </div>

            <div className="pt-2.5 border-t border-white/10 space-y-1.5">
              <div className="text-[#a5b4fc] text-[10px] uppercase font-semibold tracking-wider">
                GovFix Citizen Key (GCK)
              </div>
              <div className="font-mono text-[#FF7A18] text-xs font-bold tracking-wider truncate">
                GCK-MH-7F42-K9P8-X2Q6
              </div>
              <div className="text-[#a5b4fc] text-[10px] leading-snug">
                One identity for all connected government services.
              </div>
              <button
                onClick={() => nav("mock-portal")}
                className="mt-1 w-full py-1.5 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold text-center transition-all cursor-pointer block"
              >
                🚀 Test Portals & Autofill →
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {/* Top bar */}
        <div
          className="flex items-center justify-between px-8 py-5 bg-white border-b"
          style={{ borderColor: "#e2e8f5" }}
        >
          <div>
            <h1 className="text-[#171B68] text-xl font-extrabold tracking-tight">
              Good morning, Aarav
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => nav("citizen")}
              className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #174DE5, #6A16B8)" }}
            >
              <span>🎓 Multi-Dept Application (GOV-2026-1042)</span>
              <span>→</span>
            </button>

            <div
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs"
              style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-emerald-800 font-semibold">GovFix Resilience Active</span>
            </div>

            <button
              onClick={() => nav("applications")}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#171B68] border hover:bg-slate-50 hover:border-[#174DE5]/40 transition-all cursor-pointer flex items-center gap-1.5"
              style={{ borderColor: "#e2e8f5" }}
            >
              <span>My Applications</span>
              <span className="w-4 h-4 rounded-full bg-[#174DE5] text-white text-[10px] flex items-center justify-center font-bold">
                {applicationCount}
              </span>
            </button>

            <button
              onClick={() => nav("login")}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#171B68] border hover:bg-slate-50 hover:border-[#174DE5]/40 transition-all cursor-pointer flex items-center gap-1.5"
              style={{ borderColor: "#e2e8f5" }}
              title="Sign out and return to Login"
            >
              <span>Sign out</span>
            </button>
          </div>
        </div>

        <div className="p-8 max-w-6xl space-y-8">
          {/* Main Key Message Banner */}
          <div
            className="rounded-3xl p-6 text-white relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #171B68 0%, #6A16B8 60%, #174DE5 100%)",
              boxShadow: "0 10px 30px rgba(23, 27, 104, 0.2)",
            }}
          >
            <div className="max-w-2xl relative z-10">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={{
                  background: "rgba(255, 122, 24, 0.18)",
                  borderColor: "rgba(255, 122, 24, 0.35)",
                  borderWidth: 1,
                  borderStyle: "solid",
                  color: "#FFB070",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6 1l1.5 3.5L11 6l-3.5 1.5L6 11l-1.5-3.5L1 6l3.5-1.5L6 1z"
                    fill="#FF7A18"
                  />
                </svg>
                <span>GovFix Citizen Guarantee</span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">
                Access multiple government services through one unified GovFix interface.
              </h2>
              <p className="text-[#d6ddf8] text-sm leading-relaxed mb-4">
                GovFix coordinates multi-department workflows, detects public service failures,
                preserves application state automatically, and prevents duplicate submissions.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-medium text-white/90">
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Unified Service Access</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Real-Time Failure Detection</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Auto-State Preservation</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Duplicate Prevention</span>
                </div>
              </div>
            </div>
          </div>

          {/* If a Category is Selected: Show Sub-Services */}
          {selectedCategory ? (
            <div className="space-y-6">
              {/* Breadcrumb & Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className="text-[#174DE5] hover:text-[#171B68] font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>← All Categories</span>
                  </button>
                  <span className="text-[#b8c2e4]">/</span>
                  <span className="text-[#171B68] font-bold">{currentCategoryData?.name}</span>
                </div>

                <span className="text-xs font-medium text-[#7d8fca]">
                  {currentCategoryData?.services.length} services available
                </span>
              </div>

              <div className="rounded-2xl p-6 bg-white border" style={{ borderColor: "#e2e8f5" }}>
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{
                      background: currentCategoryData?.iconBg,
                      color: currentCategoryData?.iconColor,
                    }}
                  >
                    {currentCategoryData?.icon}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[#171B68]">
                      {currentCategoryData?.name} Services
                    </h2>
                    <p className="text-sm text-[#7d8fca]">{currentCategoryData?.description}</p>
                  </div>
                </div>

                <p className="text-xs text-[#171B68] bg-[#f7f9ff] p-3 rounded-xl border border-[#e2e8f5] mb-6">
                  Select a service below to proceed. All citizen attributes are pre-verified via
                  your GovFix Identity reference ID.
                </p>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentCategoryData?.services.map((svc) => (
                    <div
                      key={svc.id}
                      className="rounded-2xl p-5 border transition-all bg-white border-[#e2e8f5] hover:border-[#174DE5]/50"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[#171B68] font-bold text-base flex items-center gap-2">
                            <span>{svc.name}</span>
                          </h3>
                          <p className="text-xs text-[#7d8fca] mt-1 leading-relaxed">
                            {svc.description}
                          </p>
                        </div>
                        <span
                          className={`max-w-full self-start text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-normal break-words sm:ml-2 ${
                            svc.badgeColor === "amber"
                              ? "bg-[#FF7A18]/15 text-[#FF7A18] border border-[#FF7A18]/30"
                              : svc.badgeColor === "success"
                              ? "bg-emerald-50 text-emerald-700"
                              : svc.badgeColor === "blue"
                              ? "bg-[#174DE5]/10 text-[#174DE5] border border-[#174DE5]/20"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {svc.badge}
                        </span>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[11px] text-[#174DE5]">
                          Integrated Public Service
                        </span>

                        <button
                          onClick={() => handleOpenService(svc.id)}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#171B68] bg-[#f7f9ff] border border-[#e2e8f5] hover:bg-white hover:border-[#174DE5] hover:text-[#174DE5] transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>Access Service</span>
                          <span>→</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Main Dashboard View: 6 Clickable Categories */
            <div className="space-y-6">
              <div className="rounded-2xl p-5 bg-white border border-[#e2e8f5]">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-[#171B68] font-bold text-base">
                      Use any official Indian government website
                    </h2>
                    <p className="text-xs text-[#7d8fca] mt-1 max-w-2xl">
                      Choose the department or service you need. GovFix keeps your citizen identity,
                      consent, and application state separate from the portal you visit.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto lg:min-w-[430px]">
                    <input
                      value={portalUrl}
                      onChange={(event) => {
                        setPortalUrl(event.target.value);
                        if (portalError) setPortalError("");
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") handleOpenPortal();
                      }}
                      placeholder="https://services.india.gov.in"
                      aria-label="Official government website address"
                      className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl border border-[#e2e8f5] bg-[#f7f9ff] text-[#171B68] outline-none focus:border-[#174DE5]"
                    />
                    <button
                      onClick={handleOpenPortal}
                      className="px-4 py-2.5 rounded-xl text-white text-xs font-bold hover:opacity-95 transition-opacity cursor-pointer whitespace-nowrap"
                      style={{ background: "linear-gradient(135deg, #171B68, #174DE5)" }}
                    >
                      Open Securely
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-2">
                  <input
                    value={portalNote}
                    onChange={(event) => {
                      setPortalNote(event.target.value);
                      const existingDraft = getPortalDraft();
                      savePortalDraft({
                        portalUrl,
                        serviceId: existingDraft?.serviceId,
                        payload: existingDraft?.payload || {},
                        note: event.target.value,
                      });
                    }}
                    placeholder="Optional note: what you are doing on this portal"
                    aria-label="Portal draft note"
                    className="px-3.5 py-2.5 rounded-xl border border-[#e2e8f5] bg-[#f7f9ff] text-[#171B68] outline-none focus:border-[#174DE5]"
                  />
                  <span className="text-[11px] text-emerald-700 flex items-center">
                    ✓ Autosaved in this browser
                  </span>
                </div>
                {portalError && <p className="text-xs text-red-600 mt-2">{portalError}</p>}
                <p className="text-[11px] text-[#7d8fca] mt-3">
                  Supported official domains: <span className="font-mono">.gov.in</span> and{" "}
                  <span className="font-mono">.nic.in</span>
                </p>
              </div>

              <div className="rounded-2xl p-4 bg-[#eef2ff] border border-[#c7d2fe] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-[#171B68] font-bold text-xs">GovFix navigation queue</div>
                  <div className="text-[#6A16B8] text-[11px] mt-1">
                    Requests are scheduled fairly across the gateway so one busy department does not block another.
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold whitespace-nowrap">
                  <span className="px-2.5 py-1 rounded-full bg-white text-[#171B68] border border-[#c7d2fe]">
                    {queueSnapshot.active}/{queueSnapshot.capacity} active
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-white text-[#171B68] border border-[#c7d2fe]">
                    {queueSnapshot.waiting} waiting
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[#171B68] font-bold text-lg">Government Service Categories</h2>
                  <p className="text-xs text-[#7d8fca]">
                    Click any category to explore connected citizen services
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#174DE5] bg-white px-3 py-1.5 rounded-xl border border-[#e2e8f5]">
                  6 Unified Categories
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="rounded-2xl p-6 bg-white border border-[#e2e8f5] hover:border-[#174DE5] hover:shadow-md hover:shadow-[#174DE5]/5 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105"
                          style={{ background: cat.iconBg, color: cat.iconColor }}
                        >
                          {cat.icon}
                        </div>
                        <span className="text-xs font-semibold text-[#171B68] bg-[#f7f9ff] px-2.5 py-1 rounded-full border border-[#e2e8f5]">
                          {cat.count}
                        </span>
                      </div>

                      <h3 className="text-[#171B68] font-bold text-base mb-1.5 group-hover:text-[#174DE5] transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-[#7d8fca] leading-relaxed mb-4">
                        {cat.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#174DE5]">
                      <span className="text-[#7d8fca] group-hover:text-[#174DE5] transition-colors">
                        Explore services
                      </span>
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generalized Government API Interoperability Architecture Banner */}
          <div
            className="rounded-2xl p-5 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ background: "#f7f9ff", borderColor: "#e2e8f5" }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl text-white flex items-center justify-center font-bold text-sm shrink-0"
                style={{ background: "linear-gradient(135deg, #171B68, #174DE5)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <div className="text-[#171B68] font-bold text-sm">
                  Unified Government API Interoperability Gateway
                </div>
                <div className="text-[#4a569d] text-xs">
                  Standardized connectors across Education, Transport, Utilities, Finance, Health, and Citizen Services with consent validation and data minimization.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Gateway Operational
              </span>
            </div>
          </div>

          {/* Recent Applications Preview */}
          <div className="rounded-2xl p-6 bg-white border" style={{ borderColor: "#e2e8f5" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[#171B68] font-bold text-base">Department ERP Status</h3>
                <p className="text-xs text-[#7d8fca]">
                  GovFix translates departmental ERP records into citizen-friendly status updates.
                </p>
              </div>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#174DE5]/10 text-[#174DE5] border border-[#174DE5]/20">
                Mock ERP Connected
              </span>
            </div>
            {erpApplications.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-50 text-xs text-[#7d8fca]">
                New service submissions will appear here for officer review.
              </div>
            ) : (
              <div className="space-y-2">
                {erpApplications.slice(0, 3).map((record) => (
                  <div key={record.applicationId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-[#e2e8f5]">
                    <div>
                      <div className="font-mono text-xs font-bold text-[#171B68]">{record.applicationId}</div>
                      <div className="text-[11px] text-[#7d8fca]">{record.department} · {record.officerNote}</div>
                    </div>
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                      record.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700"
                        : record.status === "ACTION_REQUIRED"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-[#174DE5]/10 text-[#174DE5]"
                    }`}>
                      {record.status.replace("_", " ")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl p-6 bg-white border" style={{ borderColor: "#e2e8f5" }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-[#171B68] font-bold text-base">Recent Citizen Applications</h3>
                <p className="text-xs text-[#7d8fca]">
                  Track progress across government departments in one place
                </p>
              </div>
              <button
                onClick={() => nav("applications")}
                className="text-xs font-semibold text-[#174DE5] hover:text-[#171B68] hover:underline cursor-pointer"
              >
                View All in My Applications →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                {
                  service: "Academic Records",
                  title: "DigiLocker Record Verification",
                  id: "GF-2026-10482",
                  status: "Under Review (Auto-Recovered)",
                  statusColor: "emerald",
                },
                {
                  service: "Electricity Bill",
                  title: "BESCOM Monthly Bill",
                  id: "GF-2026-08817",
                  status: "Payment Successful",
                  statusColor: "emerald",
                },
                {
                  service: "Income Tax",
                  title: "ITR-1 Filing AY 2025-26",
                  id: "GF-2026-09241",
                  status: "Processing",
                  statusColor: "amber",
                },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => nav("applications")}
                  className="p-4 rounded-xl border bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer"
                  style={{ borderColor: "#e2e8f5" }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-x-2 gap-y-1 mb-1.5">
                    <span className="min-w-0 flex-1 truncate text-[10px] font-bold uppercase text-[#7d8fca]">
                      {item.service}
                    </span>
                    <span
                      className={`max-w-full text-right leading-tight text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.statusColor === "emerald"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-[#FF7A18]/15 text-[#FF7A18]"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#171B68] truncate">{item.title}</div>
                  <div className="font-mono text-xs text-[#174DE5] mt-1">{item.id}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Generalized Government API Integration Modal */}
      {activeServiceId && (() => {
        const activeService = getServiceById(activeServiceId);
        if (!activeService) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 my-8">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        activeService.status === "Sandbox"
                          ? "bg-[#FF7A18]/15 text-[#FF7A18] border border-[#FF7A18]/30"
                          : activeService.status === "Connected"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : activeService.status === "Connector Configured"
                          ? "bg-[#174DE5]/10 text-[#174DE5] border border-[#174DE5]/30"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {activeService.status}
                    </span>
                    <span className="text-xs text-[#7d8fca] font-medium uppercase">
                      {activeService.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-[#171B68] leading-snug">
                    {activeService.serviceName}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setActiveServiceId(null);
                    setModalStep("details");
                  }}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer ml-2 shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Step 1: Details View */}
              {modalStep === "details" && (
                <div className="space-y-4 pt-4">
                  <p className="text-sm text-[#4a569d] leading-relaxed">
                    {activeService.description}
                  </p>

                  <div className="rounded-2xl p-4 bg-[#f7f9ff] border border-[#e2e8f5] space-y-2.5 text-xs">
                    <div>
                      <span className="text-[#7d8fca] block mb-0.5">Government Department / Provider</span>
                      <span className="font-semibold text-[#171B68]">{activeService.provider}</span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-[#7d8fca] block mb-0.5">Integration Architecture</span>
                      <span className="font-mono text-[#174DE5] font-medium">
                        GovFix {activeService.connectorType} · Auth: {activeService.authMethod.toUpperCase()}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60">
                      <span className="text-[#7d8fca] block mb-1">Required Citizen Attributes</span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeService.requiredFields.map((f) => (
                          <span
                            key={f}
                            className="px-2 py-0.5 rounded-md bg-white border border-[#e2e8f5] text-[#171B68] font-mono text-[10px]"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={handleProceedToConsent}
                      className="flex-1 py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all hover:opacity-95 active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, #171B68, #174DE5)" }}
                    >
                      <span>Proceed with Request</span>
                      <span>→</span>
                    </button>

                    <button
                      onClick={() => setActiveServiceId(null)}
                      className="px-5 py-3 rounded-xl text-xs font-semibold text-[#7d8fca] hover:text-[#171B68] transition-colors cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Citizen Consent Step (Requirement 6) */}
              {modalStep === "consent" && (
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#FF7A18]/15 text-[#FF7A18] flex items-center justify-center font-bold text-lg shrink-0">
                      🛡️
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-[#171B68]">Permission required</h4>
                      <p className="text-xs text-[#4a569d]">
                        GovFix needs your permission to securely share the required information with this government service.
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 bg-[#f7f9ff] border border-[#e2e8f5] space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-[#171B68] block mb-1">
                        What information will be shared:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeService.requiredFields.map((f) => (
                          <span
                            key={f}
                            className="px-2.5 py-1 rounded-lg bg-white border border-[#e2e8f5] text-[#171B68] font-mono text-[11px] font-medium"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-[#171B68] block mb-0.5">
                        Which service will receive it:
                      </span>
                      <span className="text-[#174DE5] font-medium">
                        {activeService.requiredCitizenConsent.recipientDepartment}
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200">
                      <span className="font-bold text-[#171B68] block mb-0.5">
                        Why it is required:
                      </span>
                      <span className="text-[#174DE5] leading-relaxed">
                        {activeService.requiredCitizenConsent.purpose}
                      </span>
                    </div>
                  </div>

                  {/* Data Minimization Guarantee */}
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-950">
                    <span className="text-emerald-700 font-bold mt-0.5">✓</span>
                    <span>
                      <strong>Data minimization active:</strong> Only the minimal required fields above are transmitted.
                      Your biometrics, unmasked identity numbers, passwords, and unrelated history are never exposed.
                    </span>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleExecuteRequest}
                      className="flex-1 py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all hover:opacity-95 active:scale-[0.99] cursor-pointer"
                      style={{ background: "linear-gradient(135deg, #171B68, #174DE5)" }}
                    >
                      Allow & Continue
                    </button>
                    <button
                      onClick={() => setModalStep("details")}
                      className="px-5 py-3.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Asynchronous Gateway Processing */}
              {modalStep === "processing" && (
                <div className="py-10 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full border-3 border-[#174DE5] border-t-transparent animate-spin mx-auto" />
                  <div>
                    <h4 className="text-base font-bold text-[#171B68]">
                      Your request is being securely processed
                    </h4>
                    <p className="text-xs text-[#7d8fca] mt-1">
                      Connecting to authorized government service through GovFix Gateway...
                    </p>
                  </div>
                </div>
              )}

              {/* Step 4: Normalized Result Display */}
              {modalStep === "result" && serviceResult && (
                <div className="space-y-4 pt-4">
                  {serviceResult.success ? (
                    <>
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                          ✓
                        </div>
                        <div>
                          <h4 className="text-emerald-950 font-bold text-base">
                            Request processed successfully
                          </h4>
                          <p className="text-emerald-800 text-xs mt-0.5">
                            Your submission has been securely committed and verified with the department.
                          </p>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] space-y-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-[#7d8fca]">Reference / Application ID</span>
                          <span className="font-mono font-bold text-[#171B68]">
                            {serviceResult.data?.applicationId ||
                              serviceResult.data?.acknowledgmentNumber ||
                              serviceResult.data?.receiptNumber ||
                              `GF-2026-${Math.floor(10000 + Math.random() * 90000)}`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                          <span className="text-[#7d8fca]">Current Status</span>
                          <span className="font-bold text-emerald-700 capitalize">
                            {serviceResult.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                          <span className="text-[#7d8fca]">Applicant Identity</span>
                          <span className="font-medium text-[#171B68]">
                            Aarav Sharma (CIT-2026-001)
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          onClick={() => {
                            setActiveServiceId(null);
                            nav("applications");
                          }}
                          className="flex-1 py-3.5 rounded-xl text-white font-bold text-sm shadow-md transition-all hover:opacity-95 cursor-pointer text-center"
                          style={{ background: "linear-gradient(135deg, #171B68, #174DE5)" }}
                        >
                          View in My Applications →
                        </button>
                        <button
                          onClick={() => {
                            setActiveServiceId(null);
                            setModalStep("details");
                          }}
                          className="px-5 py-3.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="p-4 rounded-2xl bg-[#FF7A18]/10 border border-[#FF7A18]/30 flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#FF7A18] text-white flex items-center justify-center font-bold text-sm shrink-0 mt-0.5">
                          !
                        </div>
                        <div>
                          <h4 className="text-[#171B68] font-bold text-base">
                            The service is temporarily unavailable.
                          </h4>
                          <p className="text-amber-800 text-xs mt-0.5">
                            Your request has been safely saved. GovFix preserved your submission state so you don't need to submit again.
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => {
                            setActiveServiceId(null);
                            setModalStep("details");
                          }}
                          className="px-5 py-3 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                        >
                          Close
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
