// src/services/citizenKeyService.ts
// GovFix AI - Unique Citizen Key (GCK), Profile Vault, Schema Mapping & Consent Engine

export type CitizenKeyStatus = "ACTIVE" | "SUSPENDED" | "REVOKED" | "EXPIRED";

export interface CitizenProfile {
  citizenKey: string;
  status: CitizenKeyStatus;
  keyCreatedAt: string;
  keyExpiresAt: string;
  personal: {
    fullName: string;
    dateOfBirth: string; // YYYY-MM-DD
    gender: "Male" | "Female" | "Other";
    mobile: string;
    email: string;
    address: string;
    district: string;
    state: string;
    pinCode: string;
  };
  identifiers: {
    aadhaarRefMasked: string; // e.g. "XXXX-XXXX-4819"
    panRefMasked: string;     // e.g. "ABCDE••••F"
    studentId?: string;       // e.g. "STU-RVCE-2022-891"
    rationCardNo?: string;    // e.g. "RC-KA-992018"
    voterIdMasked?: string;   // e.g. "VTR-KA-•••92"
  };
  attributes: {
    annualIncome: number;     // e.g. 380000
    incomeCertificateNo: string;
    casteCategory: "General" | "OBC" | "SC" | "ST" | "EWS";
    institutionName: string;
    enrolledProgram: string;
    cgpaScore: number;
    bankAccountNumberMasked: string; // e.g. "••••••••9841"
    bankIfsc: string;         // e.g. "SBIN0004821"
    bankName: string;         // e.g. "State Bank of India"
  };
  documents: Array<{
    id: string;
    type: "Identity Proof" | "Address Proof" | "Educational Transcript" | "Income Certificate";
    name: string;
    issuedBy: string;
    verified: boolean;
    uploadedAt: string;
  }>;
}

export interface ConsentRecord {
  id: string;
  citizenKey: string;
  serviceId: "education" | "revenue" | "finance" | "identity";
  serviceName: string;
  recipientDepartment: string;
  purpose: string;
  permittedFields: string[];
  status: "AUTHORIZED" | "REVOKED" | "EXPIRED";
  timestamp: string;
  expiresAt: string;
  sessionToken: string;
}

export interface ConnectedService {
  id: "education" | "revenue" | "finance" | "identity";
  name: string;
  department: string;
  status: "Connected" | "Verified" | "Revoked";
  lastAccessed: string;
  purpose: string;
  sharedFieldsCount: number;
}

// Storage keys
const VAULT_STORAGE_KEY = "govfix_citizen_vault_v1";
const CONSENT_STORAGE_KEY = "govfix_consent_records_v1";

export interface RegisteredCitizenRecord {
  citizenKey: string;
  fullName: string;
  mobile: string;
  maskedAadhaar: string;
  maskedPan?: string;
  createdAt: string;
}

const REGISTERED_CITIZENS_KEY = "govfix_registered_citizens_v2";
const PENDING_LOGIN_KEY = "govfix_pending_login_key";

/**
 * Generate a unique GovFix Citizen Key
 * Format: GF-XXXX-XXXX-XXXX (e.g. GF-7X92-K4P8-M2Q1)
 * Random, non-meaningful identifier not derived from Aadhaar, PAN or mobile.
 */
export function generateGovFixCitizenKey(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude 0, 1, I, O for readability
  const randomBlock = (len = 4) => {
    let res = "";
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const arr = new Uint8Array(len);
      crypto.getRandomValues(arr);
      for (let i = 0; i < len; i++) {
        res += chars[arr[i] % chars.length];
      }
    } else {
      for (let i = 0; i < len; i++) {
        res += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    return res;
  };
  return `GF-${randomBlock(4)}-${randomBlock(4)}-${randomBlock(4)}`;
}

export function getPendingLoginKey(): string {
  if (typeof window === "undefined") return "GF-7X92-K4P8-M2Q1";
  return window.localStorage.getItem(PENDING_LOGIN_KEY) || "GF-7X92-K4P8-M2Q1";
}

export function setPendingLoginKey(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_LOGIN_KEY, key);
}

const SEED_REGISTERED_CITIZENS: RegisteredCitizenRecord[] = [
  {
    citizenKey: "GF-7X92-K4P8-M2Q1",
    fullName: "Aarav Sharma",
    mobile: "9876543210",
    maskedAadhaar: "XXXX XXXX 8821",
    maskedPan: "ABCDE1234F",
    createdAt: "2026-08-15T10:00:00Z",
  },
  {
    citizenKey: "GCK-MH-7F42-K9P8-X2Q6",
    fullName: "Aarav Sharma",
    mobile: "9876543210",
    maskedAadhaar: "XXXX XXXX 8821",
    maskedPan: "ABCDE1234F",
    createdAt: "2026-08-15T10:00:00Z",
  },
  {
    citizenKey: "CIT-2026-001",
    fullName: "Aarav Sharma",
    mobile: "9876543210",
    maskedAadhaar: "XXXX XXXX 8821",
    maskedPan: "ABCDE1234F",
    createdAt: "2026-08-15T10:00:00Z",
  },
];

export function getRegisteredCitizens(): RegisteredCitizenRecord[] {
  if (typeof window === "undefined") return SEED_REGISTERED_CITIZENS;
  try {
    const raw = window.localStorage.getItem(REGISTERED_CITIZENS_KEY);
    if (!raw) {
      window.localStorage.setItem(REGISTERED_CITIZENS_KEY, JSON.stringify(SEED_REGISTERED_CITIZENS));
      return SEED_REGISTERED_CITIZENS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_REGISTERED_CITIZENS;
  } catch {
    return SEED_REGISTERED_CITIZENS;
  }
}

export function registerNewCitizen(data: {
  fullName: string;
  mobile: string;
  aadhaar: string;
  pan?: string;
}): { success: boolean; citizenKey?: string; error?: string } {
  const normMobile = data.mobile.replace(/\D/g, "").slice(-10);
  const normAadhaar = data.aadhaar.replace(/\D/g, "");

  if (!data.fullName.trim()) {
    return { success: false, error: "Please enter your Full Name." };
  }
  if (normMobile.length !== 10) {
    return { success: false, error: "Please enter a valid 10-digit mobile number." };
  }
  if (normAadhaar.length !== 12) {
    return { success: false, error: "Aadhaar number must be exactly 12 digits." };
  }

  // Duplicate check
  const existing = getRegisteredCitizens();
  const isDuplicate = existing.some((c) => {
    const cMobile = c.mobile.replace(/\D/g, "").slice(-10);
    const last4Aadhaar = normAadhaar.slice(-4);
    const cAadhaarMatch = c.maskedAadhaar.endsWith(last4Aadhaar);
    return cMobile === normMobile || cAadhaarMatch;
  });

  if (isDuplicate) {
    return {
      success: false,
      error: "An account with this Aadhaar or Mobile Number already exists. Please login using your Citizen Key.",
    };
  }

  // Generate unique GovFix Citizen Key
  const citizenKey = generateGovFixCitizenKey();
  const maskedAadhaar = `XXXX XXXX ${normAadhaar.slice(-4)}`;
  const cleanPan = (data.pan || "").trim().toUpperCase();
  const maskedPan = cleanPan ? `${cleanPan.slice(0, 5)}••••${cleanPan.slice(-1)}` : undefined;

  const newRecord: RegisteredCitizenRecord = {
    citizenKey,
    fullName: data.fullName.trim(),
    mobile: normMobile,
    maskedAadhaar,
    maskedPan,
    createdAt: new Date().toISOString(),
  };

  const updatedList = [newRecord, ...existing];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(REGISTERED_CITIZENS_KEY, JSON.stringify(updatedList));
    setPendingLoginKey(citizenKey);
  }

  // Also update Profile Vault
  const currentProfile = getCitizenProfile();
  saveCitizenProfile({
    ...currentProfile,
    citizenKey,
    personal: {
      ...currentProfile.personal,
      fullName: newRecord.fullName,
      mobile: `+91 ${newRecord.mobile}`,
    },
    identifiers: {
      ...currentProfile.identifiers,
      aadhaarRefMasked: maskedAadhaar,
      panRefMasked: maskedPan || "ABCDE••••F",
    },
  });

  return { success: true, citizenKey };
}

export function validateCitizenKey(enteredKey: string): {
  valid: boolean;
  citizen?: RegisteredCitizenRecord;
  error?: string;
} {
  const cleanKey = (enteredKey || "").trim().toUpperCase();
  if (!cleanKey) {
    return { valid: false, error: "Please enter your GovFix Citizen Key." };
  }

  const list = getRegisteredCitizens();
  const found = list.find((c) => c.citizenKey.toUpperCase() === cleanKey);

  if (found) {
    return { valid: true, citizen: found };
  }

  return {
    valid: false,
    error: "Invalid Citizen Key. Please check your key and try again.",
  };
}

/**
 * Generate a cryptographically strong, non-sequential, non-identifying Citizen Key (GCK)
 * Format: GCK-{STATE}-{4CHAR}-{4CHAR}-{4CHAR}
 * Never contains sensitive data like Aadhaar, PAN, phone or DOB.
 */
export function generateCitizenKey(stateCode = "MH"): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // exclude 0, 1, I, O for readability
  const randomBlock = (len = 4) => {
    let res = "";
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
      const arr = new Uint8Array(len);
      crypto.getRandomValues(arr);
      for (let i = 0; i < len; i++) {
        res += chars[arr[i] % chars.length];
      }
    } else {
      for (let i = 0; i < len; i++) {
        res += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    return res;
  };

  return `GCK-${stateCode.toUpperCase()}-${randomBlock(4)}-${randomBlock(4)}-${randomBlock(4)}`;
}

// Initial seed profile for Aarav Sharma
const INITIAL_PROFILE: CitizenProfile = {
  citizenKey: "GCK-MH-7F42-K9P8-X2Q6",
  status: "ACTIVE",
  keyCreatedAt: "2026-08-15T10:00:00Z",
  keyExpiresAt: "2027-08-15T10:00:00Z",
  personal: {
    fullName: "Aarav Sharma",
    dateOfBirth: "2005-08-14",
    gender: "Male",
    mobile: "+91 98765 43210",
    email: "aarav.sharma@example.com",
    address: "Flat 402, Nilgiri Towers, 14th Cross, Indiranagar",
    district: "Bengaluru Urban",
    state: "Karnataka",
    pinCode: "560038",
  },
  identifiers: {
    aadhaarRefMasked: "XXXX-XXXX-4819",
    panRefMasked: "ABCDE••••F",
    studentId: "STU-RVCE-2022-891",
    rationCardNo: "RC-KA-992018",
    voterIdMasked: "VTR-KA-•••92",
  },
  attributes: {
    annualIncome: 380000,
    incomeCertificateNo: "REV/KA/2026/094819",
    casteCategory: "General",
    institutionName: "RV College of Engineering, Bengaluru",
    enrolledProgram: "B.Tech Computer Science & Engineering",
    cgpaScore: 8.92,
    bankAccountNumberMasked: "••••••••9841",
    bankIfsc: "SBIN0004821",
    bankName: "State Bank of India",
  },
  documents: [
    {
      id: "DOC-01",
      type: "Identity Proof",
      name: "Aadhaar e-KYC Verification Token",
      issuedBy: "UIDAI National Registry",
      verified: true,
      uploadedAt: "15 Aug 2026",
    },
    {
      id: "DOC-02",
      type: "Income Certificate",
      name: "Revenue Income & Asset Certificate",
      issuedBy: "Tahsildar / Revenue Department",
      verified: true,
      uploadedAt: "20 Aug 2026",
    },
    {
      id: "DOC-03",
      type: "Educational Transcript",
      name: "Degree Transcript & Grade Card (NAD)",
      issuedBy: "National Academic Depository (DigiLocker)",
      verified: true,
      uploadedAt: "01 Sep 2026",
    },
  ],
};

const INITIAL_CONSENT_RECORDS: ConsentRecord[] = [
  {
    id: "CON-2026-901",
    citizenKey: "GCK-MH-7F42-K9P8-X2Q6",
    serviceId: "education",
    serviceName: "State Higher Education Portal",
    recipientDepartment: "Department of Higher Education",
    purpose: "Merit-cum-Means Scholarship Application & Enrollment Verification",
    permittedFields: ["Full Name", "Date of Birth", "Student Roll No", "Institution Name", "CGPA Score", "Residential Address"],
    status: "AUTHORIZED",
    timestamp: "22 Sep 2026, 10:02 AM",
    expiresAt: "22 Oct 2026",
    sessionToken: "GFX-SES-EDU-98124",
  },
  {
    id: "CON-2026-902",
    citizenKey: "GCK-MH-7F42-K9P8-X2Q6",
    serviceId: "revenue",
    serviceName: "e-District Revenue Services Portal",
    recipientDepartment: "State Revenue Department",
    purpose: "Income & Domicile Certificate Cross-Verification",
    permittedFields: ["Full Name", "District", "State", "Annual Family Income", "Certificate Reference"],
    status: "AUTHORIZED",
    timestamp: "20 Sep 2026, 03:45 PM",
    expiresAt: "20 Oct 2026",
    sessionToken: "GFX-SES-REV-41829",
  },
  {
    id: "CON-2026-903",
    citizenKey: "GCK-MH-7F42-K9P8-X2Q6",
    serviceId: "finance",
    serviceName: "Treasury & PFMS DBT Portal",
    recipientDepartment: "Ministry of Finance & Treasury",
    purpose: "Direct Benefit Transfer (DBT) Grant Disbursement Credit Mandate",
    permittedFields: ["Full Name", "Mobile Number", "Masked Bank Account", "IFSC Code", "Bank Name"],
    status: "AUTHORIZED",
    timestamp: "18 Sep 2026, 11:20 AM",
    expiresAt: "18 Oct 2026",
    sessionToken: "GFX-SES-FIN-77192",
  },
];

// Profile Vault API
export function getCitizenProfile(): CitizenProfile {
  if (typeof window === "undefined") return INITIAL_PROFILE;
  try {
    const raw = window.localStorage.getItem(VAULT_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(INITIAL_PROFILE));
      return INITIAL_PROFILE;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PROFILE;
  }
}

export function saveCitizenProfile(profile: CitizenProfile): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(VAULT_STORAGE_KEY, JSON.stringify(profile));
  window.dispatchEvent(new Event("govfix_vault_updated"));
}

export function rotateCitizenKey(stateCode = "MH"): string {
  const profile = getCitizenProfile();
  const newKey = generateCitizenKey(stateCode);
  profile.citizenKey = newKey;
  profile.keyCreatedAt = new Date().toISOString();
  profile.keyExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  profile.status = "ACTIVE";
  saveCitizenProfile(profile);
  return newKey;
}

export function setCitizenKeyStatus(status: CitizenKeyStatus): void {
  const profile = getCitizenProfile();
  profile.status = status;
  saveCitizenProfile(profile);
}

// Consent Records API
export function getConsentRecords(): ConsentRecord[] {
  if (typeof window === "undefined") return INITIAL_CONSENT_RECORDS;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) {
      window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(INITIAL_CONSENT_RECORDS));
      return INITIAL_CONSENT_RECORDS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_CONSENT_RECORDS;
  }
}

export function addConsentRecord(record: Omit<ConsentRecord, "id" | "timestamp">): ConsentRecord {
  const records = getConsentRecords();
  const fullRecord: ConsentRecord = {
    ...record,
    id: `CON-2026-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + `, ${new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST`,
  };
  const updated = [fullRecord, ...records];
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("govfix_vault_updated"));
  }
  return fullRecord;
}

export function revokeConsentRecord(recordId: string): void {
  const records = getConsentRecords();
  const updated = records.map((r) => (r.id === recordId ? { ...r, status: "REVOKED" as const } : r));
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("govfix_vault_updated"));
  }
}

export function getConnectedServices(): ConnectedService[] {
  const records = getConsentRecords();
  const activeRecords = records.filter((r) => r.status === "AUTHORIZED");

  const servicesMap: Record<string, ConnectedService> = {
    education: {
      id: "education",
      name: "Higher Education Portal",
      department: "Dept. of Higher Education",
      status: "Connected",
      lastAccessed: "22 Sep 2026",
      purpose: "Scholarship & Admissions",
      sharedFieldsCount: 6,
    },
    revenue: {
      id: "revenue",
      name: "Revenue e-District Portal",
      department: "Dept. of Revenue",
      status: "Connected",
      lastAccessed: "20 Sep 2026",
      purpose: "Income & Domicile Verification",
      sharedFieldsCount: 5,
    },
    finance: {
      id: "finance",
      name: "Treasury & PFMS DBT Portal",
      department: "Ministry of Finance",
      status: "Connected",
      lastAccessed: "18 Sep 2026",
      purpose: "DBT Direct Bank Credit",
      sharedFieldsCount: 5,
    },
    identity: {
      id: "identity",
      name: "Civil Registry & Identity Vault",
      department: "UIDAI / Civil Affairs",
      status: "Verified",
      lastAccessed: "15 Aug 2026",
      purpose: "Demographic e-KYC Verification",
      sharedFieldsCount: 4,
    },
  };

  // Reflect revocations
  for (const sId of Object.keys(servicesMap)) {
    const isAuth = activeRecords.some((r) => r.serviceId === sId);
    if (!isAuth && sId !== "identity") {
      servicesMap[sId].status = "Revoked";
    }
  }

  return Object.values(servicesMap);
}

// ============================================================================
// SCHEMA MAPPING ENGINE: GovFix Profile -> Portal-Specific Field Schemas
// ============================================================================

export interface PortalFieldRequirement {
  portalFieldKey: string;
  label: string;
  sourceProfilePath: string; // dot-notation e.g. "personal.fullName"
  required: boolean;
  type: "text" | "date" | "number" | "select" | "masked";
  description: string;
}

export interface PortalSchemaDefinition {
  portalId: "education" | "revenue" | "finance";
  portalName: string;
  portalDepartment: string;
  portalThemeColor: string; // Hex color for branding
  fields: PortalFieldRequirement[];
}

export const PORTAL_SCHEMAS: Record<string, PortalSchemaDefinition> = {
  education: {
    portalId: "education",
    portalName: "National Higher Education Portal (Samarth / NSP)",
    portalDepartment: "Ministry of Education / Dept. of Higher Education",
    portalThemeColor: "#6A16B8",
    fields: [
      { portalFieldKey: "applicant_name", label: "Applicant Full Name", sourceProfilePath: "personal.fullName", required: true, type: "text", description: "Matches 10th marksheet & Aadhaar" },
      { portalFieldKey: "dob", label: "Date of Birth", sourceProfilePath: "personal.dateOfBirth", required: true, type: "date", description: "YYYY-MM-DD standard format" },
      { portalFieldKey: "gender", label: "Gender", sourceProfilePath: "personal.gender", required: true, type: "select", description: "Demographic gender" },
      { portalFieldKey: "mobile_no", label: "Registered Mobile Number", sourceProfilePath: "personal.mobile", required: true, type: "text", description: "For OTP verification & alerts" },
      { portalFieldKey: "email_id", label: "Primary Email Address", sourceProfilePath: "personal.email", required: true, type: "text", description: "For counseling allotments" },
      { portalFieldKey: "residential_address", label: "Permanent Residential Address", sourceProfilePath: "personal.address", required: true, type: "text", description: "Full postal address" },
      { portalFieldKey: "district_name", label: "District", sourceProfilePath: "personal.district", required: true, type: "text", description: "Home district" },
      { portalFieldKey: "state_name", label: "State", sourceProfilePath: "personal.state", required: true, type: "text", description: "State of domicile" },
      { portalFieldKey: "postal_code", label: "PIN Code", sourceProfilePath: "personal.pinCode", required: true, type: "text", description: "6-digit postal code" },
      { portalFieldKey: "student_roll_no", label: "Student Roll / Registration No.", sourceProfilePath: "identifiers.studentId", required: true, type: "text", description: "Institution issued roll ID" },
      { portalFieldKey: "institution_name", label: "Enrolled College / University", sourceProfilePath: "attributes.institutionName", required: true, type: "text", description: "UGC / AICTE recognized institution" },
    ],
  },
  revenue: {
    portalId: "revenue",
    portalName: "e-District Revenue Administration Portal",
    portalDepartment: "Department of Revenue & Land Records",
    portalThemeColor: "#FF7A18",
    fields: [
      { portalFieldKey: "citizen_full_name", label: "Citizen Name", sourceProfilePath: "personal.fullName", required: true, type: "text", description: "Applicant legal name" },
      { portalFieldKey: "applicant_dob", label: "Date of Birth", sourceProfilePath: "personal.dateOfBirth", required: true, type: "date", description: "Birth registration date" },
      { portalFieldKey: "contact_phone", label: "Contact Phone Number", sourceProfilePath: "personal.mobile", required: true, type: "text", description: "SMS alert number" },
      { portalFieldKey: "permanent_address", label: "Taluk & Village Residence Address", sourceProfilePath: "personal.address", required: true, type: "text", description: "Revenue jurisdiction address" },
      { portalFieldKey: "taluk_district", label: "Taluk / District", sourceProfilePath: "personal.district", required: true, type: "text", description: "Jurisdiction of Tahsildar" },
      { portalFieldKey: "state_jurisdiction", label: "State", sourceProfilePath: "personal.state", required: true, type: "text", description: "State administration" },
      { portalFieldKey: "pincode", label: "PIN Code", sourceProfilePath: "personal.pinCode", required: true, type: "text", description: "Postal PIN code" },
      { portalFieldKey: "family_annual_income", label: "Certified Family Annual Income (₹)", sourceProfilePath: "attributes.annualIncome", required: true, type: "number", description: "Assessed annual family income" },
      { portalFieldKey: "social_category", label: "Social Category / Caste", sourceProfilePath: "attributes.casteCategory", required: true, type: "select", description: "Reservation entitlement category" },
      { portalFieldKey: "income_cert_ref", label: "Prior Certificate Number", sourceProfilePath: "attributes.incomeCertificateNo", required: false, type: "text", description: "Previous valid certificate if any" },
    ],
  },
  finance: {
    portalId: "finance",
    portalName: "PFMS Direct Benefit Transfer (DBT) Treasury Portal",
    portalDepartment: "Department of Expenditure / Ministry of Finance",
    portalThemeColor: "#174DE5",
    fields: [
      { portalFieldKey: "beneficiary_name", label: "Beneficiary Account Holder Name", sourceProfilePath: "personal.fullName", required: true, type: "text", description: "Must match Aadhaar seeded bank account" },
      { portalFieldKey: "beneficiary_dob", label: "Beneficiary Date of Birth", sourceProfilePath: "personal.dateOfBirth", required: true, type: "date", description: "DOB linked with bank records" },
      { portalFieldKey: "registered_mobile", label: "PFMS Alert Mobile Number", sourceProfilePath: "personal.mobile", required: true, type: "text", description: "Direct credit SMS alerts" },
      { portalFieldKey: "notification_email", label: "Official Notification Email", sourceProfilePath: "personal.email", required: true, type: "text", description: "Disbursement voucher receipts" },
      { portalFieldKey: "postal_pincode", label: "Residential PIN Code", sourceProfilePath: "personal.pinCode", required: true, type: "text", description: "Beneficiary local address" },
      { portalFieldKey: "masked_bank_account", label: "Bank Account Number", sourceProfilePath: "attributes.bankAccountNumberMasked", required: true, type: "masked", description: "Aadhaar Payment Bridge seeded account" },
      { portalFieldKey: "ifsc_code", label: "Bank Branch IFSC Code", sourceProfilePath: "attributes.bankIfsc", required: true, type: "text", description: "RTGS / NEFT branch routing code" },
      { portalFieldKey: "bank_name", label: "Financial Institution Name", sourceProfilePath: "attributes.bankName", required: true, type: "text", description: "Clearing bank branch" },
      { portalFieldKey: "scheme_identifier", label: "Welfare Scheme Code", sourceProfilePath: "identifiers.studentId", required: true, type: "text", description: "Target DBT scheme allocation" },
    ],
  },
};

/**
 * Resolves dot-notation path inside the profile object (e.g. "personal.fullName")
 */
function getByPath(obj: any, path: string): any {
  return path.split(".").reduce((acc, part) => (acc != null ? acc[part] : undefined), obj);
}

/**
 * Map GovFix Profile to a target portal's schema
 */
export function mapProfileToPortalSchema(
  portalId: "education" | "revenue" | "finance",
  profile: CitizenProfile = getCitizenProfile()
): {
  mappedData: Record<string, any>;
  detectedCount: number;
  fields: Array<{ fieldKey: string; label: string; value: any; required: boolean }>;
} {
  const schema = PORTAL_SCHEMAS[portalId];
  if (!schema) return { mappedData: {}, detectedCount: 0, fields: [] };

  const mappedData: Record<string, any> = {};
  const fields: Array<{ fieldKey: string; label: string; value: any; required: boolean }> = [];
  let detectedCount = 0;

  for (const req of schema.fields) {
    const val = getByPath(profile, req.sourceProfilePath);
    if (val !== undefined && val !== null && val !== "") {
      mappedData[req.portalFieldKey] = val;
      fields.push({
        fieldKey: req.portalFieldKey,
        label: req.label,
        value: val,
        required: req.required,
      });
      detectedCount++;
    }
  }

  return { mappedData, detectedCount, fields };
}

/**
 * Issue a short-lived portal session token
 */
export function issuePortalSession(portalId: string): string {
  const prefix = portalId.toUpperCase().slice(0, 3);
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `GFX-SES-${prefix}-${rand}`;
}
