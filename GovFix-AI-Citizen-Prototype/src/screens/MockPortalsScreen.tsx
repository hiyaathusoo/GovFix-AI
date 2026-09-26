// src/screens/MockPortalsScreen.tsx
// GovFix AI - Connected Government Portals Prototype (Education, Revenue, Finance)
// Demonstrates GovFix Citizen Key (GCK) SSO, Schema Mapping, and Smart Autofill ("Fill with GovFix")

import { useState } from "react";
import type { Screen } from "../App";
import {
  getCitizenProfile,
  mapProfileToPortalSchema,
  PORTAL_SCHEMAS,
  issuePortalSession,
  addConsentRecord,
  type CitizenProfile,
} from "../services/citizenKeyService";

interface Props {
  nav: (screen: Screen) => void;
}

type ActivePortal = "education" | "revenue" | "finance";

export default function MockPortalsScreen({ nav }: Props) {
  const [activePortal, setActivePortal] = useState<ActivePortal>("education");
  const [profile, setProfile] = useState<CitizenProfile>(() => getCitizenProfile());
  
  // SSO & Autofill State
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [showReviewFillModal, setShowReviewFillModal] = useState(false);
  const [autofilled, setAutofilled] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
  // Form input state (keyed by portalFieldKey)
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const [aiCorrectionApplied, setAiCorrectionApplied] = useState(false);
  const [showAiBanner, setShowAiBanner] = useState(true);

  const currentSchema = PORTAL_SCHEMAS[activePortal];
  const { mappedData, detectedCount, fields } = mapProfileToPortalSchema(activePortal, profile);

  const handlePortalSwitch = (portal: ActivePortal) => {
    setActivePortal(portal);
    setAutofilled(false);
    setFormData({});
    setSubmittedAppId(null);
    setShowConsentModal(false);
    setShowReviewFillModal(false);
    setSessionToken(null);
    setAiCorrectionApplied(false);
  };

  const handleStartGovFixSso = () => {
    setShowConsentModal(true);
  };

  const handleAuthorizeConsent = () => {
    setShowConsentModal(false);
    const token = issuePortalSession(activePortal);
    setSessionToken(token);

    // Record consent in audit store
    const fieldLabels = fields.map((f) => f.label);
    addConsentRecord({
      citizenKey: profile.citizenKey,
      serviceId: activePortal,
      serviceName: currentSchema.portalName,
      recipientDepartment: currentSchema.portalDepartment,
      purpose: `${currentSchema.portalName} Online Application & Verification`,
      permittedFields: fieldLabels,
      status: "AUTHORIZED",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN"),
      sessionToken: token,
    });

    // Advance to Review & Fill
    setShowReviewFillModal(true);
  };

  const handleConfirmAutofill = () => {
    setShowReviewFillModal(false);
    setFormData({ ...mappedData });
    setAutofilled(true);
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const prefix = activePortal === "education" ? "EDU" : activePortal === "revenue" ? "REV" : "FIN";
    const newAppId = `${prefix}-APP-2026-${Math.floor(10000 + Math.random() * 90000)}`;
    setSubmittedAppId(newAppId);
  };

  const handleAiAutoFixPin = () => {
    setAiCorrectionApplied(true);
    // Ensure clean 6-digit postal code
    if (formData["postal_code"]) {
      setFormData((prev) => ({ ...prev, postal_code: "560038" }));
    } else if (formData["pincode"]) {
      setFormData((prev) => ({ ...prev, pincode: "560038" }));
    } else if (formData["postal_pincode"]) {
      setFormData((prev) => ({ ...prev, postal_pincode: "560038" }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#171B68] font-[DM_Sans,system-ui,sans-serif]">
      {/* Top Banner Navigation */}
      <header className="border-b border-[#e2e8f5] bg-white sticky top-0 z-30 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5 lg:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => nav("citizen")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#e2e8f5] bg-[#f7f9ff] hover:bg-slate-100 text-xs font-bold text-[#171B68] cursor-pointer transition-colors"
            >
              <span>← Back to Citizen Identity</span>
            </button>
            <div className="hidden sm:block h-4 w-px bg-slate-200"></div>
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="font-bold text-[#171B68]">GovFix Connected Portals Testbed</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                PROTOTYPE ACTIVE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#171B68]/5 border border-[#171B68]/15 px-3 py-1.5 rounded-xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7d8fca]">Active GCK:</span>
              <span className="font-mono text-xs font-black text-[#174DE5]">{profile.citizenKey}</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <button
              onClick={() => nav("dashboard")}
              className="rounded-xl border border-[#e2e8f5] bg-white px-3 py-1.5 text-xs font-bold text-[#7d8fca] hover:text-[#171B68] hover:bg-slate-50 cursor-pointer"
            >
              Citizen Catalog
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        {/* Concept Introduction Banner */}
        <section
          className="rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg, #171B68 0%, #174DE5 100%)" }}
        >
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                SECTION 18 · 3 MOCK PORTALS
              </span>
              <span className="text-xs font-bold text-white/80">
                Federated Identity & Smart Autofill
              </span>
            </div>
            <h1 className="text-xl font-black text-white">
              One GovFix Identity. Multiple Government Services.
            </h1>
            <p className="text-xs text-white/80 leading-relaxed">
              Create your profile once, securely authorize connected government services, and reuse verified information without repeatedly entering the same details. Each portal receives <strong>only the specific attributes it requires</strong>.
            </p>
          </div>

          <div className="shrink-0 flex md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 md:border-l border-white/15 pt-3 md:pt-0 md:pl-5">
            <div className="text-xs text-white/70">Connected Test Portals:</div>
            <div className="text-lg font-black text-white">3 Live Services</div>
            <div className="text-[11px] text-emerald-300 font-semibold">Zero Repeated Entry</div>
          </div>
        </section>

        {/* Portal Switcher Tabs */}
        <div className="bg-white rounded-2xl p-2 border border-[#e2e8f5] shadow-2xs flex flex-wrap gap-2">
          <button
            onClick={() => handlePortalSwitch("education")}
            className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePortal === "education"
                ? "bg-[#6A16B8] text-white shadow-sm"
                : "text-[#7d8fca] hover:text-[#171B68] hover:bg-slate-50"
            }`}
          >
            <span>🎓 1. Education Portal</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activePortal === "education" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
              Scholarship / Admission
            </span>
          </button>

          <button
            onClick={() => handlePortalSwitch("revenue")}
            className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePortal === "revenue"
                ? "bg-[#FF7A18] text-white shadow-sm"
                : "text-[#7d8fca] hover:text-[#171B68] hover:bg-slate-50"
            }`}
          >
            <span>📜 2. Revenue Portal</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activePortal === "revenue" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
              Income / Domicile
            </span>
          </button>

          <button
            onClick={() => handlePortalSwitch("finance")}
            className={`flex-1 min-w-[200px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activePortal === "finance"
                ? "bg-[#174DE5] text-white shadow-sm"
                : "text-[#7d8fca] hover:text-[#171B68] hover:bg-slate-50"
            }`}
          >
            <span>🏛️ 3. Finance Portal</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${activePortal === "finance" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
              Direct Benefit Transfer
            </span>
          </button>
        </div>

        {/* Portal Header Simulation */}
        <div className="bg-white rounded-3xl border border-[#e2e8f5] shadow-xs overflow-hidden">
          <div
            className="p-5 border-b text-white flex flex-wrap items-center justify-between gap-4"
            style={{ backgroundColor: currentSchema.portalThemeColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center font-bold text-lg">
                {activePortal === "education" ? "🎓" : activePortal === "revenue" ? "📜" : "🏛️"}
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight">{currentSchema.portalName}</h2>
                <div className="text-xs text-white/80">{currentSchema.portalDepartment}</div>
              </div>
            </div>

            <div className="text-right text-xs">
              <div className="text-white/70 text-[10px] uppercase font-bold tracking-wider">Application Form</div>
              <div className="font-bold text-white">
                {activePortal === "education" ? "Post-Matric Merit Scholarship" : activePortal === "revenue" ? "Income Certificate Assessment" : "Direct Benefit Bank Account Seed"}
              </div>
            </div>
          </div>

          {/* GovFix SSO Banner */}
          {!autofilled && !submittedAppId && (
            <div className="p-6 bg-gradient-to-r from-[#174DE5]/5 via-[#6A16B8]/5 to-transparent border-b border-[#e2e8f5]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#171B68]">Already have a GovFix profile?</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#174DE5]/10 text-[#174DE5]">
                      Smart Autofill Ready
                    </span>
                  </div>
                  <p className="text-xs text-[#7d8fca] max-w-xl">
                    Skip creating a separate account and manually entering your personal, demographic, and educational details. Authorize GovFix to populate verified attributes directly.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleStartGovFixSso}
                  className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-sm hover:opacity-95 transition-all cursor-pointer shrink-0 flex items-center gap-2"
                  style={{ background: "linear-gradient(135deg, #174DE5, #6A16B8)" }}
                >
                  <span>✦ Continue with GovFix</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}

          {/* Autofill Notification Bar (When Autofilled) */}
          {autofilled && !submittedAppId && (
            <div className="p-4 bg-emerald-50 border-b border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">✓</span>
                <div>
                  <span className="font-bold text-emerald-950">
                    GovFix Smart Autofill Active: {detectedCount} fields automatically populated from your verified GCK profile.
                  </span>
                  <div className="text-[11px] text-emerald-800">
                    Session Token: <code className="font-mono font-bold text-emerald-900">{sessionToken}</code> (Expires in 15 mins)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReviewFillModal(true)}
                  className="text-xs font-bold text-[#174DE5] hover:underline cursor-pointer"
                >
                  View Mapped Schema
                </button>
                <span className="text-slate-300">|</span>
                <span className="text-[11px] text-amber-900 font-semibold bg-amber-100/80 px-2 py-0.5 rounded-md">
                  Review & Submit required
                </span>
              </div>
            </div>
          )}

          {/* GovFix AI Format Assistant (Section 14) */}
          {autofilled && !submittedAppId && showAiBanner && (
            <div className="p-4 bg-indigo-50/70 border-b border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-[#6A16B8] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  AI
                </div>
                <div>
                  <span className="font-bold text-[#171B68]">GovFix AI Assistant:</span>
                  <span className="text-[#171B68]/90 ml-1">
                    {aiCorrectionApplied
                      ? "Postal code format has been standardized to 6-digit standard format."
                      : `This portal expects standard 6-digit numeric postal code. Your profile contains "560038". Click to verify format compliance.`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!aiCorrectionApplied && (
                  <button
                    onClick={handleAiAutoFixPin}
                    className="px-3 py-1.5 rounded-lg bg-[#6A16B8] text-white font-bold text-xs hover:bg-[#6A16B8]/90 cursor-pointer shadow-2xs"
                  >
                    Auto-Format Code
                  </button>
                )}
                <button
                  onClick={() => setShowAiBanner(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Form Content / Submission State */}
          <div className="p-6 md:p-8">
            {submittedAppId ? (
              // Application Submitted Confirmation Screen
              <div className="py-8 text-center space-y-4 max-w-lg mx-auto">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl font-black mx-auto">
                  ✓
                </div>
                <h3 className="text-xl font-black text-[#171B68]">
                  Application Successfully Submitted!
                </h3>
                <p className="text-xs text-[#7d8fca] leading-relaxed">
                  Your application has been received by the <strong>{currentSchema.portalDepartment}</strong> via the authorized GovFix Citizen Key integration.
                </p>

                <div className="rounded-2xl border border-[#e2e8f5] bg-[#f7f9ff] p-4 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#7d8fca]">Portal Application Ref:</span>
                    <span className="font-mono font-bold text-[#171B68]">{submittedAppId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7d8fca]">Citizen Identity Token:</span>
                    <span className="font-mono font-bold text-[#174DE5]">{profile.citizenKey}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7d8fca]">Auth Session Token:</span>
                    <span className="font-mono text-[11px] text-slate-600">{sessionToken}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#7d8fca]">Timestamp:</span>
                    <span className="font-bold text-[#171B68]">
                      {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })},{" "}
                      {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })} IST
                    </span>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      const next = activePortal === "education" ? "revenue" : activePortal === "revenue" ? "finance" : "education";
                      handlePortalSwitch(next);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-[#174DE5] text-white text-xs font-bold shadow-xs hover:bg-[#174DE5]/90 transition-all cursor-pointer"
                  >
                    Test Next Portal with same GCK →
                  </button>
                  <button
                    onClick={() => nav("citizen")}
                    className="px-4 py-2.5 rounded-xl border border-[#e2e8f5] bg-white text-[#171B68] text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    View Access History in Dashboard
                  </button>
                </div>
              </div>
            ) : (
              // Government Portal Form
              <form onSubmit={handleSubmitApplication} className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#7d8fca]">
                    Official Application Fields ({currentSchema.fields.length} Requirements)
                  </div>
                  <div className="text-xs text-[#7d8fca]">
                    * Indicates mandatory field
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {currentSchema.fields.map((req) => {
                    const isAutofilledField = autofilled && formData[req.portalFieldKey] !== undefined;
                    return (
                      <div key={req.portalFieldKey} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-[#171B68]">
                            {req.label} {req.required && <span className="text-rose-500">*</span>}
                          </label>
                          {isAutofilledField && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span>✓</span> Autofilled by GovFix
                            </span>
                          )}
                        </div>

                        <input
                          type={req.type === "number" ? "number" : req.type === "date" ? "date" : "text"}
                          required={req.required}
                          value={formData[req.portalFieldKey] || ""}
                          onChange={(e) => handleInputChange(req.portalFieldKey, e.target.value)}
                          placeholder={`Enter ${req.label.toLowerCase()}`}
                          className={`w-full rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all outline-hidden border ${
                            isAutofilledField
                              ? "bg-emerald-50/40 border-emerald-300 text-emerald-950 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                              : "bg-white border-[#e2e8f5] text-[#171B68] focus:border-[#174DE5] focus:ring-2 focus:ring-[#174DE5]/20"
                          }`}
                        />
                        <div className="text-[10px] text-[#7d8fca]">{req.description}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Form Action Controls */}
                <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="text-xs text-[#7d8fca] flex items-center gap-2">
                    <span className="text-amber-500 font-bold">⚠️ Notice:</span>
                    <span>Autofill populates values for review. You must explicitly verify and click Submit.</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({})}
                      className="px-4 py-2.5 rounded-xl border border-[#e2e8f5] bg-white text-xs font-bold text-[#7d8fca] hover:text-[#171B68] hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Clear Form
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-[#171B68] text-white text-xs font-extrabold shadow-sm hover:bg-[#171B68]/90 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Review & Submit Application</span>
                      <span>✓</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* ========================================================================= */}
      {/* 1. GOVFIX AUTHORIZATION & CONSENT MODAL (Section 7)                      */}
      {/* ========================================================================= */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-[#e2e8f5]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#174DE5] text-white flex items-center justify-center font-bold text-sm">
                  ✦
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#171B68]">GovFix Authorization Request</h3>
                  <div className="text-[11px] text-[#7d8fca]">Purpose-Bound Citizen Consent (DPDP Act 2023)</div>
                </div>
              </div>
              <button
                onClick={() => setShowConsentModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="text-xs text-[#171B68] leading-relaxed">
                The <strong className="text-[#174DE5]">{currentSchema.portalName}</strong> ({currentSchema.portalDepartment}) requests permission to access authorized attributes from your GovFix Profile:
              </div>

              <div className="rounded-2xl border border-slate-100 bg-[#f7f9ff] p-4 space-y-2 text-xs">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#7d8fca] mb-1">
                  Requested Attributes for this service:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs font-medium text-[#171B68]">
                  {fields.map((f) => (
                    <div key={f.fieldKey} className="flex items-center gap-1.5">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span className="truncate">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-amber-50/70 border border-amber-200 p-3 text-[11px] text-amber-900 leading-snug">
                <strong>Data Minimization Guarantee:</strong> Unrelated records (e.g. unrequested tax assessments, biometric hashes, or medical records) will <strong>NOT</strong> be disclosed to this portal.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowConsentModal(false)}
                className="px-4 py-2 rounded-xl border border-[#e2e8f5] bg-white text-xs font-bold text-[#7d8fca] hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAuthorizeConsent}
                className="px-5 py-2 rounded-xl text-xs font-extrabold text-white shadow-sm hover:opacity-95 transition-all cursor-pointer"
                style={{ background: "linear-gradient(135deg, #174DE5, #6A16B8)" }}
              >
                Allow & Continue →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. "FILL WITH GOVFIX" REVIEW & FILL MODAL (Section 11)                    */}
      {/* ========================================================================= */}
      {showReviewFillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-3xl p-6 shadow-2xl space-y-5 border border-[#e2e8f5]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-[#171B68]">Fill with GovFix</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {detectedCount} Fields Detected
                  </span>
                </div>
                <div className="text-[11px] text-[#7d8fca]">Review attributes before populating the form</div>
              </div>
              <button
                onClick={() => setShowReviewFillModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 pr-1">
              {fields.map((f) => (
                <div key={f.fieldKey} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-[#171B68]">{f.label}</div>
                    <div className="font-mono text-[11px] text-slate-500">{f.fieldKey}</div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-[#174DE5] bg-[#174DE5]/5 px-2.5 py-1 rounded-lg">
                      {String(f.value)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="text-[11px] text-[#7d8fca]">
                Identity Key: <code className="font-mono font-bold text-[#171B68]">{profile.citizenKey}</code>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewFillModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#e2e8f5] bg-white text-xs font-bold text-[#7d8fca] hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAutofill}
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold shadow-sm hover:bg-emerald-700 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>Populate Form Fields</span>
                  <span>✓</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
