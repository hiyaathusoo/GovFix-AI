export type DemoRole = "CITIZEN" | "OFFICER" | "ADMIN";

export interface DemoUser {
  userId: string;
  role: DemoRole;
  name: string;
  department?: string;
  citizenId?: string;
}

const SESSION_KEY = "govfix_demo_session";
const AUTH_TOKEN_KEY = "govfix_auth_token";
const ACTIVE_CITIZEN_ID_KEY = "govfix_active_citizen_id";
const LAST_CITIZEN_ID_KEY = "govfix_last_citizen_id";

export const DEMO_USERS: Record<DemoRole, DemoUser> = {
  CITIZEN: {
    userId: "citizen.demo",
    role: "CITIZEN",
    name: "Aarav Sharma",
    citizenId: "CIT-2026-001",
  },
  OFFICER: {
    userId: "officer.demo",
    role: "OFFICER",
    name: "Priya Mehta",
    department: "Education",
  },
  ADMIN: {
    userId: "admin.demo",
    role: "ADMIN",
    name: "GovFix Administrator",
  },
};

export function getCurrentUser(): DemoUser | null {
  if (typeof window === "undefined") return null;
  const userId = window.localStorage.getItem(SESSION_KEY);
  const found = Object.values(DEMO_USERS).find((user) => user.userId === userId) || null;
  if (found && found.role === "CITIZEN") {
    const activeId = window.localStorage.getItem(ACTIVE_CITIZEN_ID_KEY);
    if (activeId) {
      return { ...found, citizenId: activeId };
    }
  }
  return found;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthSession(token: string, citizenId?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  window.localStorage.setItem(SESSION_KEY, DEMO_USERS.CITIZEN.userId);
  if (citizenId) {
    window.localStorage.setItem(ACTIVE_CITIZEN_ID_KEY, citizenId);
    window.localStorage.setItem(LAST_CITIZEN_ID_KEY, citizenId);
  }
}

export function getActiveOrLastCitizenId(): string {
  if (typeof window === "undefined") return "CIT-2026-001";
  return (
    window.localStorage.getItem(ACTIVE_CITIZEN_ID_KEY) ||
    window.localStorage.getItem(LAST_CITIZEN_ID_KEY) ||
    "CIT-2026-001"
  );
}

export function signInAs(role: DemoRole, citizenId?: string) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_KEY, DEMO_USERS[role].userId);
    if (role === "CITIZEN") {
      const cId = citizenId || getActiveOrLastCitizenId();
      window.localStorage.setItem(ACTIVE_CITIZEN_ID_KEY, cId);
      window.localStorage.setItem(LAST_CITIZEN_ID_KEY, cId);
    }
  }
  return DEMO_USERS[role];
}

export function signOut() {
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ token }),
      }).catch(() => {});
    }
    window.localStorage.removeItem(SESSION_KEY);
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(ACTIVE_CITIZEN_ID_KEY);
    // Note: LAST_CITIZEN_ID_KEY is intentionally preserved so returning citizen can easily sign in again
  }
}

export function canAccess(role: DemoRole | null, screen: string) {
  if (screen === "login" || screen === "register") return true;
  if (!role) return false;
  if (["officer"].includes(screen)) return role === "OFFICER";
  if (["admin", "health", "interop"].includes(screen)) return role === "ADMIN";
  if (["mock-portal"].includes(screen)) return role === "CITIZEN" || role === "ADMIN";
  return role === "CITIZEN";
}

// ---------------------------------------------------------------------------
// Backend Auth Client API (Sections 13, 14, 21)
// ---------------------------------------------------------------------------

export async function loginWithIdentifierApi(identifier: string) {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: "NETWORK_ERROR", message: err?.message || "Failed to reach server" };
  }
}

export async function sendOtpApi(identifier: string, purpose: "LOGIN" | "REGISTER" = "LOGIN") {
  try {
    const res = await fetch("/api/auth/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, purpose }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: "NETWORK_ERROR", message: err?.message || "Failed to send code" };
  }
}

export async function verifyOtpApi(identifier: string, otp: string) {
  try {
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, otp }),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: "NETWORK_ERROR", message: err?.message || "Verification failed" };
  }
}

export async function registerCitizenApi(data: {
  mobile: string;
  aadhaar: string;
  pan?: string;
  fullName?: string;
}) {
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: "NETWORK_ERROR", message: err?.message || "Registration failed" };
  }
}

export async function checkSessionPersistence(): Promise<boolean> {
  const token = getAuthToken();
  if (!token) return false;
  try {
    const res = await fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    return Boolean(data.success && data.authenticated);
  } catch {
    return false;
  }
}

