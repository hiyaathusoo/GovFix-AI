// src/screens/CitizenRegisterScreen.tsx
// GovFix AI - Citizen Registration & First-Time Identity Verification Screen
// Allows first-time citizens to verify identity details once and receive a unique GovFix Citizen Key.

import { useState } from "react";
import type { Screen } from "../App";
import { registerNewCitizen, setPendingLoginKey } from "../services/citizenKeyService";

interface Props {
  nav: (s: Screen) => void;
}

export default function CitizenRegisterScreen({ nav }: Props) {
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [pan, setPan] = useState("");

  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Auto-format Aadhaar as XXXX XXXX XXXX
  const handleAadhaarChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 12);
    const parts = raw.match(/.{1,4}/g);
    setAadhaar(parts ? parts.join(" ") : raw);
  };

  // Auto-format Mobile (10 digits)
  const handleMobileChange = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 10);
    setMobile(raw);
  };

  // Auto-format PAN (10 uppercase chars)
  const handlePanChange = (val: string) => {
    setPan(val.toUpperCase().slice(0, 10));
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage("Please enter your Full Name.");
      return;
    }

    const cleanMobile = mobile.replace(/\D/g, "");
    if (cleanMobile.length !== 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    const cleanAadhaar = aadhaar.replace(/\D/g, "");
    if (cleanAadhaar.length !== 12) {
      setErrorMessage("Aadhaar Number must be exactly 12 digits.");
      return;
    }

    if (pan.trim() && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.trim())) {
      setErrorMessage("PAN Number format is invalid. Example: ABCDE1234F.");
      return;
    }

    setIsVerifying(true);

    setTimeout(() => {
      const result = registerNewCitizen({
        fullName: fullName.trim(),
        mobile: cleanMobile,
        aadhaar: cleanAadhaar,
        pan: pan.trim() || undefined,
      });

      setIsVerifying(false);

      if (result.success && result.citizenKey) {
        setGeneratedKey(result.citizenKey);
        setPendingLoginKey(result.citizenKey);
      } else {
        setErrorMessage(result.error || "Registration failed. Please try again.");
      }
    }, 450);
  };

  const handleCopyKey = () => {
    if (generatedKey && typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(generatedKey);
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    }
  };

  const handleContinueToLogin = () => {
    if (generatedKey) {
      setPendingLoginKey(generatedKey);
    }
    nav("login");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-12"
      style={{
        background: "linear-gradient(135deg, #171B68 0%, #2A1B7A 50%, #174DE5 100%)",
      }}
    >
      <div className="w-full max-w-xl">
        {/* Main Card */}
        <div
          className="rounded-3xl p-6 sm:p-10 bg-white shadow-2xl"
          style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.35)" }}
        >
          {/* Header Branding */}
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
                <div className="flex items-center gap-2">
                  <span className="text-[#171B68] text-xl font-bold tracking-tight">GovFix AI</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#174DE5]/10 text-[#174DE5] border border-[#174DE5]/20">
                    Citizen Identity
                  </span>
                </div>
                <div className="text-[11px] text-[#7d8fca] font-medium">Digital Public Infrastructure</div>
              </div>
            </div>

            <button
              onClick={() => nav("login")}
              className="text-xs font-semibold text-[#174DE5] hover:text-[#171B68] transition-colors cursor-pointer"
            >
              Sign In →
            </button>
          </div>

          {!generatedKey ? (
            /* Registration Form State */
            <div>
              <div className="mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-3 bg-[#FF7A18]/15 border border-[#FF7A18]/30">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF7A18]"></div>
                  <span className="text-[#FF7A18] text-[11px] font-bold tracking-wide uppercase">
                    First-Time Registration
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171B68] tracking-tight">
                  Create Your GovFix Account
                </h1>
                <p className="text-[#4a569d] text-sm mt-1.5 leading-relaxed">
                  Verify your identity once and access connected government services through GovFix.
                </p>
              </div>

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

              <form onSubmit={handleRegister} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[#171B68] text-xs font-bold mb-1.5 uppercase tracking-wider">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your legal full name"
                    className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-[#171B68] outline-none transition-all"
                    style={{ border: "1.5px solid #e2e8f5", background: "#f7f9ff" }}
                    onFocus={(e) => (e.target.style.borderColor = "#174DE5")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f5")}
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-[#171B68] text-xs font-bold mb-1.5 uppercase tracking-wider">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div
                      className="flex items-center px-3.5 rounded-xl border text-sm text-[#171B68] font-bold"
                      style={{ border: "1.5px solid #e2e8f5", background: "#f7f9ff" }}
                    >
                      +91
                    </div>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => handleMobileChange(e.target.value)}
                      placeholder="10-digit registered number"
                      maxLength={10}
                      className="flex-1 px-4 py-3 rounded-xl text-sm font-semibold text-[#171B68] font-mono outline-none transition-all"
                      style={{ border: "1.5px solid #e2e8f5", background: "#f7f9ff" }}
                      onFocus={(e) => (e.target.style.borderColor = "#174DE5")}
                      onBlur={(e) => (e.target.style.borderColor = "#e2e8f5")}
                    />
                  </div>
                  <p className="text-[#7d8fca] text-[11px] mt-1">
                    Used for GovFix identity verification and service alerts.
                  </p>
                </div>

                {/* Aadhaar Number */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#171B68] text-xs font-bold uppercase tracking-wider">
                      Aadhaar Number <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      Masked on Save
                    </span>
                  </div>
                  <input
                    type="text"
                    value={aadhaar}
                    onChange={(e) => handleAadhaarChange(e.target.value)}
                    placeholder="XXXX XXXX XXXX (12 digits)"
                    maxLength={14}
                    className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-[#171B68] font-mono outline-none transition-all tracking-wider"
                    style={{ border: "1.5px solid #e2e8f5", background: "#f7f9ff" }}
                    onFocus={(e) => (e.target.style.borderColor = "#174DE5")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f5")}
                  />
                  <p className="text-[#7d8fca] text-[11px] mt-1">
                    Demo verification: enter any 12 digits (e.g. 9876 5432 1098).
                  </p>
                </div>

                {/* PAN Number (Optional) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[#171B68] text-xs font-bold uppercase tracking-wider">
                      PAN Number
                    </label>
                    <span className="text-[10px] text-[#7d8fca] bg-slate-100 px-2 py-0.5 rounded-full font-medium">
                      Optional
                    </span>
                  </div>
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => handlePanChange(e.target.value)}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="w-full px-4 py-3 rounded-xl text-sm font-semibold text-[#171B68] font-mono outline-none transition-all uppercase"
                    style={{ border: "1.5px solid #e2e8f5", background: "#f7f9ff" }}
                    onFocus={(e) => (e.target.style.borderColor = "#174DE5")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f5")}
                  />
                </div>

                {/* Privacy & Prototype Disclaimer Notice */}
                <div
                  className="rounded-2xl p-3.5 flex items-start gap-2.5 border border-emerald-100"
                  style={{ background: "#ecfdf5" }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="shrink-0 mt-0.5 text-emerald-600"
                  >
                    <path
                      d="M8 1L2 4.5v5C2 12.5 4.5 15 8 15s6-2.5 6-5.5v-5L8 1z"
                      fill="#d1fae5"
                      stroke="#059669"
                      strokeWidth="1.2"
                    />
                    <path
                      d="M6 8l1.5 1.5L10 6"
                      stroke="#047857"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="text-emerald-900 text-xs leading-relaxed">
                    <span className="font-bold">Prototype Identity Simulation:</span> Your Citizen Key is a
                    random, non-meaningful GovFix identifier. We never store raw biometrics, unmasked Aadhaar, or passwords.
                  </p>
                </div>

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-4 rounded-xl text-white font-bold text-sm transition-all hover:opacity-95 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-75 mt-2"
                  style={{ background: "linear-gradient(135deg, #171B68, #174DE5)" }}
                >
                  {isVerifying ? (
                    <span>Verifying Identity & Generating Key...</span>
                  ) : (
                    <>
                      <span>Verify & Generate Citizen Key</span>
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

              {/* Bottom Navigation */}
              <div className="mt-6 pt-5 border-t border-slate-100 text-center">
                <span className="text-xs text-[#7d8fca]">Already have a GovFix Citizen Key? </span>
                <button
                  onClick={() => nav("login")}
                  className="text-xs font-bold text-[#174DE5] hover:text-[#171B68] transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="text-center py-4">
              {/* Identity Verified Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-5 bg-emerald-50 border border-emerald-200">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-emerald-600">
                  <path
                    d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.2 5.2l-4 4a.75.75 0 01-1.06 0l-2-2a.75.75 0 011.06-1.06L6.67 8.67l3.47-3.47a.75.75 0 011.06 1.06z"
                    fill="currentColor"
                  />
                </svg>
                <span className="text-emerald-700 text-sm font-extrabold tracking-wide">
                  Identity Verified ✓
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-[#171B68] tracking-tight">
                Your GovFix Citizen Key
              </h2>
              <p className="text-[#4a569d] text-sm mt-2 max-w-md mx-auto leading-relaxed">
                A unique, privacy-preserving federated identity key has been generated for your GovFix account.
              </p>

              {/* Citizen Key Display Box */}
              <div className="my-6 p-5 sm:p-6 rounded-2xl border-2 border-[#174DE5]/25 bg-[#f7f9ff] text-center shadow-inner relative">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#6A16B8] mb-1.5">
                  GovFix Citizen Key (GCK)
                </div>
                <div className="font-mono text-[#171B68] text-2xl sm:text-3xl font-extrabold tracking-widest selection:bg-[#174DE5] selection:text-white">
                  {generatedKey}
                </div>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button
                    onClick={handleCopyKey}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#e2e8f5] bg-white text-xs font-bold text-[#174DE5] hover:bg-slate-50 cursor-pointer shadow-xs transition-all active:scale-95"
                  >
                    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                      <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                      <path d="M2 10V3a1 1 0 011-1h7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                    </svg>
                    <span>{copiedToast ? "Copied to Clipboard! ✓" : "Copy Key"}</span>
                  </button>
                </div>
              </div>

              {/* Security Advisory */}
              <div className="mb-7 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs leading-relaxed max-w-md mx-auto flex items-start gap-2.5 text-left">
                <span className="text-base leading-none mt-0.5">🔒</span>
                <div>
                  <span className="font-bold text-amber-900">Keep this key safe.</span> You will use it to access your GovFix dashboard without re-entering personal identity credentials.
                </div>
              </div>

              {/* Continue to Login Button */}
              <button
                onClick={handleContinueToLogin}
                className="w-full py-4 rounded-xl text-white font-bold text-sm transition-all hover:opacity-95 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                style={{ background: "linear-gradient(135deg, #171B68, #174DE5)" }}
              >
                <span>Continue to Login</span>
                <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M3 7h8M8 4l3 3-3 3"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
