import { useEffect, useState } from "react";
import LoginScreen from "./screens/LoginScreen";
import CitizenRegisterScreen from "./screens/CitizenRegisterScreen";
import DashboardScreen from "./screens/DashboardScreen";
import ErrorScreen from "./screens/ErrorScreen";
import RecoveryScreen from "./screens/RecoveryScreen";
import DuplicateScreen from "./screens/DuplicateScreen";
import ApplicationsScreen from "./screens/ApplicationsScreen";
import CitizenScreen from "./screens/CitizenScreen";
import OfficerScreen from "./screens/OfficerScreen";
import AdminScreen from "./screens/AdminScreen";
import ServiceHealthScreen from "./screens/ServiceHealthScreen";
import InteroperabilityScreen from "./screens/InteroperabilityScreen";
import MockPortalsScreen from "./screens/MockPortalsScreen";
import { canAccess, getCurrentUser, signOut, checkSessionPersistence, type DemoRole } from "./services/auth";

export type Screen =
  | "login"
  | "register"
  | "dashboard"
  | "error"
  | "recovery"
  | "duplicate"
  | "applications"
  | "citizen"
  | "officer"
  | "admin"
  | "health"
  | "interop"
  | "mock-portal";

export default function App() {
  const [role, setRole] = useState<DemoRole | null>(() => getCurrentUser()?.role || null);

  const getInitialScreen = (): Screen => {
    const hash = (typeof window !== "undefined" ? window.location.hash.replace("#", "") : "") as Screen;
    const currentRole = getCurrentUser()?.role || null;
    if (hash === "register") return "register";
    if (!currentRole) return "login";
    if (hash && canAccess(currentRole, hash)) return hash;
    return currentRole === "OFFICER" ? "officer" : currentRole === "ADMIN" ? "admin" : "dashboard";
  };

  const [screen, setScreen] = useState<Screen>(getInitialScreen);

  useEffect(() => {
    // Validate session persistence with backend on load
    const user = getCurrentUser();
    if (user && user.role === "CITIZEN") {
      checkSessionPersistence().then((isValid) => {
        // If an explicit token existed but is expired/invalid on backend, enforce re-auth
        const token = window.localStorage.getItem("govfix_auth_token");
        if (token && !isValid) {
          signOut();
          setRole(null);
          setScreen("login");
        }
      });
    }

    const onPopState = (e: PopStateEvent) => {
      const targetScreen = (e.state?.screen || window.location.hash.replace("#", "") || "login") as Screen;
      const currentRole = getCurrentUser()?.role || null;
      if (targetScreen === "register") {
        setScreen("register");
        return;
      }
      if (targetScreen === "login" || !currentRole) {
        signOut();
        setRole(null);
        setScreen("login");
        return;
      }
      setRole(currentRole);
      if (canAccess(currentRole, targetScreen)) {
        setScreen(targetScreen);
      } else {
        setScreen(currentRole === "OFFICER" ? "officer" : currentRole === "ADMIN" ? "admin" : "dashboard");
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const nav = (s: Screen) => {
    if (s === "register") {
      setScreen("register");
      window.history.pushState({ screen: "register" }, "", "#register");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (s === "login") {
      signOut();
      setRole(null);
      setScreen("login");
      if (window.location.hash !== "#login") {
        window.history.pushState({ screen: "login" }, "", "#login");
      }
      return;
    }
    if (!canAccess(role, s)) {
      const fallback = role === "OFFICER" ? "officer" : role === "ADMIN" ? "admin" : role === "CITIZEN" ? "dashboard" : "login";
      setScreen(fallback);
      return;
    }
    setScreen(s);
    window.history.pushState({ screen: s }, "", `#${s}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-[#f0f3fa] font-[DM_Sans,system-ui,sans-serif]">
      {screen === "register" && <CitizenRegisterScreen nav={nav} />}
      {screen === "login" && (
        <LoginScreen
          nav={nav}
          onRoleAuthenticated={(authenticatedRole) => {
            setRole(authenticatedRole);
            const nextScreen: Screen =
              authenticatedRole === "CITIZEN"
                ? "dashboard"
                : authenticatedRole === "OFFICER"
                ? "officer"
                : "admin";
            setScreen(nextScreen);
            window.history.pushState({ screen: nextScreen }, "", `#${nextScreen}`);
          }}
        />
      )}
      {screen === "dashboard" && <DashboardScreen nav={nav} />}
      {screen === "error" && <ErrorScreen nav={nav} />}
      {screen === "recovery" && <RecoveryScreen nav={nav} />}
      {screen === "duplicate" && <DuplicateScreen nav={nav} />}
      {screen === "applications" && <ApplicationsScreen nav={nav} />}
      {screen === "citizen" && <CitizenScreen nav={nav} />}
      {screen === "officer" && <OfficerScreen nav={nav} />}
      {screen === "admin" && <AdminScreen nav={nav} />}
      {screen === "health" && <ServiceHealthScreen nav={nav} />}
      {screen === "interop" && <InteroperabilityScreen nav={nav} />}
      {screen === "mock-portal" && <MockPortalsScreen nav={nav} />}
    </div>
  );
}
