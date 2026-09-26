// src/screens/LoginScreen.tsx
// GovFix AI - Dedicated Citizen Login Screen
// Validates GovFix Citizen Key against registered records and authenticates directly to DashboardScreen.

import { useEffect, useState } from "react";
import type { Screen } from "../App";
import { signInAs, type DemoRole } from "../services/auth";
import {
  validateCitizenKey,
  getPendingLoginKey,
  getRegisteredCitizens,
} from "../services/citizenKeyService";

interface Props {
  nav: (s: Screen) => void;
  onRoleAuthenticated: (role: DemoRole) => void;
}

export default function LoginScreen({ nav, onRoleAuthenticated }: Props) {
  const [citizenKey, setCitizenKey] = useState<string>(() => getPendingLoginKey());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedRole, setSelectedRole] = useState<DemoRole>("CITIZEN");

  useEffect(() => {
    const pending = getPendingLoginKey();
    if (pending) {
      setCitizenKey(pending);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // If evaluator selected Officer or Admin demo role
    if (selectedRole !== "CITIZEN") {
      const user = signInAs(selectedRole);
      onRoleAuthenticated(user.role);
      nav(selectedRole === "OFFICER" ? "officer" : "admin");
      return;
    }

    if (!citizenKey.trim()) {
      setErrorMessage("Please enter your GovFix Citizen Key.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const validation = validateCitizenKey(citizenKey);
      setIsLoading(false);

      if (validation.valid && validation.citizen) {
        // Authenticate the citizen with their validated Citizen Key
        signInAs("CITIZEN", validation.citizen.citizenKey);
        onRoleAuthenticated("CITIZEN");
        // Redirect to the existing DashboardScreen as requested
        nav("dashboard");
      } else {
        setErrorMessage("Invalid Citizen Key. Please check your key and try again.");
      }
    }, 350);
  };

  const handleUseDemoKey = () => {
    setCitizenKey("GF-7X92-K4P8-M2Q1");
    setErrorMessage(null);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-12"
      style={{
        background: "linear-gradient(135deg, #171B68 0%, #2A1B7A 50%, #174DE5 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div
          className="rounded-3xl p-6 sm:p-10 bg-white shadow-2xl"
          style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}
        >
          {/* Logo & Branding */}
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-[#e2e8f5]">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-bold shadow-md"
                style={{ background: "linear-gradient(135deg, #174DE5, #6A16B8)" }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
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
                <span className="text-[#171B68] text-xl font-bold tracking-tight">GovFix AI</span>
                <div className="text-[11px] text-[#7d8fca] font-medium">Digital India Initiative</div>
              </div>
            </div>

            <div className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-[#174DE5]/10 text-[#174DE5] border border-[#174DE5]/20">
              Unified Portal
            </div>
          </div>

          {/* Demo Role Switcher (Preserved for Officer & Admin testing) */}
          <div className="mb-6 rounded-2xl border border-[#e2e8f5] bg-[#f7f9ff] p-3">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#171B68]">
                Select Demo Role
              </span>
              <span className="text-[10px] text-[#6A16B8] font-medium">
                {selectedRole === "CITIZEN" ? "Citizen Key Mode" : `${selectedRole} Access`}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(["CITIZEN", "OFFICER", "ADMIN"] as DemoRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setSelectedRole(r);
                    setErrorMessage(null);
                  }}
                  className={`min-h-9 rounded-xl px-2 text-[10px] font-bold cursor-pointer transition-all ${
                    selectedRole === r
                      ? "bg-[#171B68] text-white shadow-xs"
                      : "bg-white text-[#174DE5] border border-[#e2e8f5] hover:bg-slate-50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Header Title & Subtitle */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171B68] tracking-tight">
              Welcome Back
            </h1>
            <p className="text-[#4a569d] text-sm mt-1.5 leading-relaxed">
              Enter your GovFix Citizen Key to continue.
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5 text-red-600">
                <path
                  d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 3.5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 018 4.5zm0 7a.875.875 0 110-1.75.875.875 0 010 1.75z"
                  fill="currentColor"
                />
              </svg>
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[#171B68] text-xs font-bold uppercase tracking-wider">
                  GovFix Citizen Key
                </label>
                <button
                  type="button"
                  onClick={handleUseDemoKey}
                  className="text-[10px] font-bold text-[#174DE5] hover:text-[#171B68] cursor-pointer"
                >
                  Use Demo Key
                </button>
              </div>

              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl transition-all"
                style={{ border: "1.5px solid #e2e8f5", background: "#f7f9ff" }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" className="text-[#174DE5] shrink-0">
                  <path
                    d="M10.5 7.5A3 3 0 107.5 10.5M10.5 7.5l4.5 4.5m-2-1l1.5 1.5M13.5 13.5L15 15"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <input
                  type="text"
                  value={citizenKey}
                  onChange={(e) => {
                    setCitizenKey(e.target.value.toUpperCase());
                    setErrorMessage(null);
                  }}
                  placeholder="GF-XXXX-XXXX-XXXX"
                  className="flex-1 text-sm font-semibold text-[#171B68] font-mono bg-transparent outline-none tracking-wider uppercase"
                />
              </div>

              <div className="flex items-center justify-between mt-1.5 px-0.5">
                <span className="text-[11px] text-[#7d8fca]">
                  Example format: <code className="text-[#171B68] font-mono">GF-7X92-K4P8-M2Q1</code>
                </span>
              </div>
            </div>

            {/* Privacy indicator */}
            <div
              className="rounded-2xl p-3 flex items-start gap-2 border border-slate-100"
              style={{ background: "#f7f9ff" }}
            >
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5 text-[#174DE5]">
                <path
                  d="M8 1L2 4.5v5C2 12.5 4.5 15 8 15s6-2.5 6-5.5v-5L8 1z"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" />
              </svg>
              <p className="text-[11px] text-[#4a569d] leading-relaxed">
                GovFix Citizen Key acts as your privacy-preserving federated identity reference.
              </p>
            </div>

            {/* Primary Continue Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-xl text-white font-bold text-sm transition-all hover:opacity-95 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-75 mt-3"
              style={{ background: "linear-gradient(135deg, #171B68, #174DE5)" }}
            >
              {isLoading ? (
                <span>Validating Citizen Key...</span>
              ) : (
                <>
                  <span>Continue</span>
                  <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M3 7h8M8 4l3 3-3 3"
                      stroke="white"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Navigation to Registration Page */}
          <div className="mt-7 pt-5 border-t border-slate-100 text-center">
            <span className="text-xs text-[#7d8fca]">New to GovFix? </span>
            <button
              onClick={() => nav("register")}
              className="text-xs font-bold text-[#174DE5] hover:text-[#171B68] transition-colors cursor-pointer"
            >
              Create an account
            </button>
          </div>

          {/* Pre-seeded demo key tip */}
          <div className="mt-4 rounded-xl p-2.5 bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] text-[#7d8fca] font-medium">
              Demo Key: <button type="button" onClick={handleUseDemoKey} className="font-mono text-[#FF7A18] font-bold hover:underline cursor-pointer">GF-7X92-K4P8-M2Q1</button> (Aarav Sharma)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
