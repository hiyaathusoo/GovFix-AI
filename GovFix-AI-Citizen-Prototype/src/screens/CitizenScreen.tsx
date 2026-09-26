// src/screens/CitizenScreen.tsx
// GovFix AI - Unified Citizen Experience with Cross-Department Workflow & Timeline (Sections 4, 6, 7, 21, 24)

import { useEffect, useState } from "react";
import type { Screen } from "../App";
import { DEMO_APPLICATION, DEMO_CITIZEN } from "../config/demoData";
import { getCurrentUser } from "../services/auth";
import {
  APPLICATIONS_UPDATED_EVENT,
  getApplications,
  type CitizenApplication,
} from "../services/applicationStore";
import {
  getCrossDeptApplication,
  getInteropScenario,
  subscribeInteropUpdates,
  type CrossDeptApplication,
} from "../services/crossDepartmentErpService";
import {
  getCitizenProfile,
  rotateCitizenKey,
  setCitizenKeyStatus,
  getConsentRecords,
  revokeConsentRecord,
  getConnectedServices,
  type CitizenProfile,
  type ConsentRecord,
  type ConnectedService,
} from "../services/citizenKeyService";

interface Props {
  nav: (screen: Screen) => void;
}

export default function CitizenScreen({ nav }: Props) {
  const [applications, setApplications] = useState<CitizenApplication[]>(() => getApplications());
  const [crossApp, setCrossApp] = useState<CrossDeptApplication>(() => getCrossDeptApplication());
  const [interopScenario, setInteropScenario] = useState(() => getInteropScenario());
  const [showTimelineModal, setShowTimelineModal] = useState<boolean>(false);

  // Citizen Key (GCK) & Consent State
  const [profile, setProfile] = useState<CitizenProfile>(() => getCitizenProfile());
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>(() => getConsentRecords());
  const [connectedServices, setConnectedServices] = useState<ConnectedService[]>(() => getConnectedServices());
  const [showAccessHistoryModal, setShowAccessHistoryModal] = useState<boolean>(false);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [copiedKeyToast, setCopiedKeyToast] = useState<boolean>(false);

  useEffect(() => {
    const refresh = () => setApplications(getApplications());
    window.addEventListener(APPLICATIONS_UPDATED_EVENT, refresh);
    window.addEventListener("storage", refresh);

    const onVaultUpdated = () => {
      setProfile(getCitizenProfile());
      setConsentRecords(getConsentRecords());
      setConnectedServices(getConnectedServices());
    };
    window.addEventListener("govfix_vault_updated", onVaultUpdated);

    const unsubInterop = subscribeInteropUpdates(() => {
      setCrossApp({ ...getCrossDeptApplication() });
      setInteropScenario(getInteropScenario());
    });

    return () => {
      window.removeEventListener(APPLICATIONS_UPDATED_EVENT, refresh);
      window.removeEventListener("storage", refresh);
      window.removeEventListener("govfix_vault_updated", onVaultUpdated);
      unsubInterop();
    };
  }, []);

  const handleCopyKey = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(profile.citizenKey);
    }
    setCopiedKeyToast(true);
    setTimeout(() => setCopiedKeyToast(false), 2500);
  };

  const handleRotateKey = () => {
    if (window.confirm("Rotate GovFix Citizen Key? Existing authorized services will be transitioned to the new key.")) {
      rotateCitizenKey("MH");
      setProfile({ ...getCitizenProfile() });
    }
  };

  const handleToggleSuspend = () => {
    const nextStatus = profile.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setCitizenKeyStatus(nextStatus);
    setProfile({ ...getCitizenProfile() });
  };

  const handleRevokeConsent = (recordId: string) => {
    revokeConsentRecord(recordId);
    setConsentRecords(getConsentRecords());
    setConnectedServices(getConnectedServices());
  };

  const user = getCurrentUser();
  const isApproved = crossApp.commonData.departmentApproval === "APPROVED";
  const isDisbursed = crossApp.commonData.paymentStatus === "DISBURSED";
  const isDelayed = interopScenario !== "NORMAL" && interopScenario !== "RECOVERED";

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#171B68] font-[DM_Sans,system-ui,sans-serif]">
      {/* Citizen Navigation Header (Section 4) */}
      <header className="border-b border-[#e2e8f5] bg-white sticky top-0 z-30 shadow-2xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm text-white font-bold"
              style={{ background: "linear-gradient(135deg, #174DE5, #6A16B8)" }}
            >
              <span className="text-lg">✦</span>
            </div>
            <div>
              <div className="font-bold tracking-tight text-[#171B68]">GovFix AI</div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-[#6A16B8]">
                Unified Citizen Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-[#FF7A18]/30 bg-[#FF7A18]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FF7A18] md:inline-flex">
              Citizens First
            </span>
            {user?.role === "OFFICER" && (
              <button
                onClick={() => nav("officer")}
                className="hidden text-xs font-semibold text-[#174DE5] hover:text-[#171B68] md:inline-block cursor-pointer"
              >
                Officer View
              </button>
            )}
            {user?.role === "ADMIN" && (
              <button
                onClick={() => nav("admin")}
                className="hidden text-xs font-semibold text-[#174DE5] hover:text-[#171B68] md:inline-block cursor-pointer"
              >
                Admin Hub
              </button>
            )}
            <button
              onClick={() => nav("applications")}
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-[#f7f9ff] text-sm cursor-pointer border border-[#e2e8f5]"
              aria-label="Notifications"
            >
              🔔
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-[#FF7A18]" />
            </button>
            <div className="hidden text-right sm:block">
              <div className="text-xs font-bold text-[#171B68]">{profile.personal?.fullName || DEMO_CITIZEN.name}</div>
              <div className="text-[11px] text-[#6A16B8]">Citizen ID · {profile.citizenKey || DEMO_CITIZEN.citizenId}</div>
            </div>
            <button
              onClick={() => nav("login")}
              className="rounded-xl border border-[#e2e8f5] px-3 py-2 text-xs font-semibold text-[#171B68] hover:bg-[#f7f9ff] hover:border-[#174DE5]/40 cursor-pointer transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8 lg:px-10">
        {/* Citizen Experience During ERP Failure / Reassurance (Section 21) */}
        {isDelayed && (
          <div className="rounded-3xl p-5 bg-[#FF7A18]/10 border border-[#FF7A18]/40 text-amber-950 text-xs flex items-start gap-3.5 shadow-xs">
            <span className="text-2xl mt-0.5">⚠️</span>
            <div className="flex-1">
              <div className="font-black text-sm text-[#171B68]">
                Service Temporarily Delayed
              </div>
              <p className="text-amber-900 mt-1 leading-relaxed text-xs">
                A government department service is temporarily unavailable. Your application has been safely saved with state protection. GovFix is working to restore the process. No action is required from you.
              </p>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white border border-[#FF7A18]/30 text-[#FF7A18] shrink-0">
              Safe & Saved
            </span>
          </div>
        )}

        {interopScenario === "RECOVERED" && (
          <div className="rounded-3xl p-5 bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs flex items-start gap-3.5 shadow-xs">
            <span className="text-2xl mt-0.5">✓</span>
            <div className="flex-1">
              <div className="font-black text-sm text-emerald-900">
                Service Restored
              </div>
              <p className="text-emerald-800 mt-1 leading-relaxed text-xs">
                Your application has resumed processing. All department connectors are synchronized.
              </p>
            </div>
          </div>
        )}

        {/* Hero Banner */}
        <section
          className="rounded-3xl p-7 text-white shadow-lg lg:p-9"
          style={{
            background: "linear-gradient(135deg, #171B68 0%, #6A16B8 60%, #174DE5 100%)",
            boxShadow: "0 10px 30px rgba(23, 27, 104, 0.2)",
          }}
        >
          <div className="max-w-2xl">
            <div className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[#FFB070]">
              One Unified Interface · All Government Services
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight lg:text-4xl">
              Welcome back, {(profile.personal?.fullName || DEMO_CITIZEN.name).split(" ")[0]}
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#d6ddf8]">
              Apply, track, and manage public services from one secure citizen page. GovFix coordinates across
              independent departmental ERPs so you never have to visit multiple portals or re-enter data.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => nav("dashboard")}
                className="rounded-xl px-5 py-3 text-xs font-bold text-white hover:opacity-95 cursor-pointer shadow-md transition-all"
                style={{ background: "linear-gradient(135deg, #174DE5, #6A16B8)" }}
              >
                Explore Government Services →
              </button>
              <button
                onClick={() => setShowTimelineModal(true)}
                className="rounded-xl px-4 py-3 text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
              >
                View Unified Application Timeline
              </button>
            </div>
          </div>
        </section>

        {/* Top Summary Stats */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Active Applications", value: "2", icon: "▣" },
            { label: "Completed Applications", value: isDisbursed ? "5" : "4", icon: "✓" },
            { label: "Pending Actions", value: "0", icon: "!" },
            { label: "Connected Depts", value: "4", icon: "🏛️" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-extrabold text-[#171B68]">{stat.value}</span>
                <span className="rounded-xl bg-[#f7f9ff] px-3 py-2 text-[#174DE5] border border-[#e2e8f5]">
                  {stat.icon}
                </span>
              </div>
              <div className="mt-2 text-xs font-semibold text-[#6A16B8]">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* ================================================================= */}
        {/* MY GOVFIX IDENTITY (Sections 1, 2, 3, 10, 17)                    */}
        {/* ================================================================= */}
        <section className="rounded-3xl border border-[#174DE5]/20 bg-white p-6 lg:p-7 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#174DE5]/10 text-[#174DE5]">
                  FEDERATED IDENTITY REFERENCE
                </span>
                <span className="text-xs font-bold text-[#7d8fca]">GovFix Citizen Key (GCK)</span>
              </div>
              <h2 className="text-xl font-black text-[#171B68] mt-1">My GovFix Identity</h2>
              <p className="text-xs text-[#7d8fca] mt-0.5 max-w-2xl leading-relaxed">
                One GovFix Identity. Multiple Government Services. Create your profile once, securely authorize connected government services, and reuse verified information without repeatedly entering the same details.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => nav("mock-portal")}
                className="px-4 py-2.5 rounded-xl text-xs font-extrabold text-white shadow-xs hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #174DE5, #6A16B8)" }}
              >
                <span>🚀 Test Connected Portals & Autofill</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* Citizen Key Visual Display Card */}
          <div
            className="rounded-2xl p-6 text-white relative overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
            style={{ background: "linear-gradient(135deg, #171B68 0%, #174DE5 100%)" }}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <span className="text-xs text-white/80 font-bold uppercase tracking-wider">
                  GovFix Citizen Key (GCK)
                </span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                    profile.status === "ACTIVE"
                      ? "bg-emerald-400 text-slate-950"
                      : profile.status === "SUSPENDED"
                      ? "bg-amber-300 text-slate-950"
                      : "bg-rose-400 text-white"
                  }`}
                >
                  ● {profile.status}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="font-mono text-2xl lg:text-3xl font-black tracking-wider text-white">
                  {profile.citizenKey}
                </div>
                <button
                  onClick={handleCopyKey}
                  title="Copy Key to Clipboard"
                  className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>{copiedKeyToast ? "✓ Copied!" : "📋 Copy Key"}</span>
                </button>
              </div>

              <div className="text-[11px] text-white/70 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Created: {new Date(profile.keyCreatedAt).toLocaleDateString("en-IN")}</span>
                <span>•</span>
                <span>Security: Non-bearer identity reference token</span>
                <span>•</span>
                <span>DPDP Act 2023 Compliant</span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <button
                onClick={() => setShowProfileModal(true)}
                className="px-3.5 py-2 rounded-xl bg-white text-[#171B68] text-xs font-extrabold hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
              >
                👤 View Profile
              </button>
              <button
                onClick={handleRotateKey}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer border border-white/20"
                title="Generate a fresh GCK while preserving profile data"
              >
                🔄 Rotate Key
              </button>
              <button
                onClick={handleToggleSuspend}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  profile.status === "ACTIVE"
                    ? "bg-amber-400/20 text-amber-200 border-amber-300/40 hover:bg-amber-400/30"
                    : "bg-emerald-400/20 text-emerald-200 border-emerald-300/40 hover:bg-emerald-400/30"
                }`}
              >
                {profile.status === "ACTIVE" ? "⏸️ Suspend Key" : "▶️ Activate Key"}
              </button>
              <button
                onClick={() => setShowAccessHistoryModal(true)}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer border border-white/20"
              >
                📜 Access History ({consentRecords.length})
              </button>
            </div>
          </div>

          {/* Connected Government Services Table (Section 10) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold text-[#171B68]">Connected Government Services</h3>
                <p className="text-xs text-[#7d8fca]">
                  Portals authorized to receive verified citizen attributes using this Citizen Key.
                </p>
              </div>

              <span className="text-xs font-bold text-[#174DE5] bg-[#174DE5]/10 px-2.5 py-1 rounded-lg">
                {connectedServices.filter((s) => s.status === "Connected" || s.status === "Verified").length} Active Connectors
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200/80">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#f7f9ff] text-[#7d8fca] uppercase text-[10px] font-bold border-b border-slate-200/80">
                  <tr>
                    <th className="py-3 px-4">Government Portal</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Authorized</th>
                    <th className="py-3 px-4">Shared Fields</th>
                    <th className="py-3 px-4 text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {connectedServices.map((svc) => (
                    <tr key={svc.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#171B68]">{svc.name}</div>
                        <div className="text-[10px] text-[#7d8fca]">{svc.purpose}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-700">{svc.department}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[10px] inline-flex items-center gap-1 ${
                            svc.status === "Connected"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : svc.status === "Verified"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}
                        >
                          ● {svc.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#7d8fca]">{svc.lastAccessed}</td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-[#171B68]">{svc.sharedFieldsCount} fields</span>
                        <span className="text-[10px] text-[#7d8fca] ml-1">(minimized)</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => nav("mock-portal")}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-[#174DE5] font-bold text-[11px] hover:bg-slate-50 cursor-pointer"
                          >
                            Open Portal
                          </button>
                          {svc.status !== "Revoked" && svc.id !== "identity" && (
                            <button
                              onClick={() => {
                                const activeRecord = consentRecords.find((r) => r.serviceId === svc.id && r.status === "AUTHORIZED");
                                if (activeRecord) handleRevokeConsent(activeRecord.id);
                              }}
                              className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 font-bold text-[11px] hover:bg-rose-100 cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Unified Cross-Department Application Tracking Card (Sections 6, 7) */}
        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr]">
          <section className="rounded-3xl border border-[#e2e8f5] bg-white p-6 shadow-sm space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#174DE5]">
                  Multi-Department Workflow Track
                </div>
                <h2 className="text-lg font-black text-[#171B68] mt-0.5">
                  {crossApp.serviceTitle}
                </h2>
                <div className="mt-1 font-mono text-xs text-[#7d8fca]">
                  Application ID: <span className="font-bold text-[#171B68]">{crossApp.id}</span> · Reference: {crossApp.citizenId}
                </div>
              </div>

              <span
                className={`rounded-full px-3.5 py-1 text-xs font-bold ${
                  isDisbursed
                    ? "bg-emerald-100 text-emerald-800"
                    : isApproved
                    ? "bg-blue-100 text-blue-800"
                    : "bg-[#FF7A18]/15 text-[#FF7A18]"
                }`}
              >
                {isDisbursed ? "✓ Benefit Disbursed" : isApproved ? "✓ Department Approved" : "⟳ Under Department Review"}
              </span>
            </div>

            {/* Citizen View of the Workflow (Section 7) */}
            <div className="rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] p-5 space-y-3">
              <div className="text-xs font-bold text-[#7d8fca] uppercase tracking-wider">
                Cross-Department Progress
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Step 1: Identity */}
                <div className="p-3 rounded-xl bg-white border border-[#e2e8f5] flex items-center justify-between">
                  <span className="font-semibold text-[#171B68]">Identity Verification</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                    ✓ Completed
                  </span>
                </div>

                {/* Step 2: Revenue */}
                <div className="p-3 rounded-xl bg-white border border-[#e2e8f5] flex items-center justify-between">
                  <span className="font-semibold text-[#171B68]">Revenue Verification</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                    ✓ Completed
                  </span>
                </div>

                {/* Step 3: Education */}
                <div className="p-3 rounded-xl bg-white border border-[#e2e8f5] flex items-center justify-between">
                  <span className="font-semibold text-[#171B68]">Education Verification</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                    ✓ Completed
                  </span>
                </div>

                {/* Step 4: Department Approval */}
                <div className="p-3 rounded-xl bg-white border border-[#e2e8f5] flex items-center justify-between">
                  <span className="font-semibold text-[#171B68]">Department Approval</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                      isApproved
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-[#FF7A18] bg-[#FF7A18]/15"
                    }`}
                  >
                    {isApproved ? "✓ Completed" : "⟳ Processing"}
                  </span>
                </div>

                {/* Step 5: Finance Processing */}
                <div className="p-3 rounded-xl bg-white border border-[#e2e8f5] flex items-center justify-between">
                  <span className="font-semibold text-[#171B68]">Finance Processing</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                      isDisbursed
                        ? "text-emerald-700 bg-emerald-50"
                        : isApproved
                        ? "text-blue-700 bg-blue-50"
                        : "text-slate-500 bg-slate-100"
                    }`}
                  >
                    {isDisbursed ? "✓ Completed" : isApproved ? "⟳ In Progress" : "○ Pending"}
                  </span>
                </div>

                {/* Step 6: Final Status */}
                <div className="p-3 rounded-xl bg-white border border-[#e2e8f5] flex items-center justify-between">
                  <span className="font-semibold text-[#171B68]">Final Status</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                      isDisbursed
                        ? "text-emerald-700 bg-emerald-50"
                        : "text-slate-500 bg-slate-100"
                    }`}
                  >
                    {isDisbursed ? "✓ Completed" : "○ Pending"}
                  </span>
                </div>
              </div>

              {isDisbursed && crossApp.commonData.utrNumber && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 mt-2 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <span>✓ DBT Disbursement Successful</span>
                  </div>
                  <div>
                    Grant value of <span className="font-bold">₹25,000</span> credited to your registered bank account.
                  </div>
                  <div className="font-mono text-[11px] text-emerald-800">
                    Bank Reference (UTR): {crossApp.commonData.utrNumber}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setShowTimelineModal(true)}
                className="text-xs font-bold text-[#174DE5] hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>📜 View Unified Cross-Department Timeline</span>
                <span>→</span>
              </button>

              <button
                onClick={() => nav("applications")}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-xs hover:opacity-95 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #171B68, #174DE5)" }}
              >
                My Applications →
              </button>
            </div>
          </section>

          {/* Right Column: GovFix Assistant & Protection Guarantee */}
          <aside
            className="rounded-3xl border border-[#174DE5]/20 p-6 space-y-5"
            style={{ background: "linear-gradient(180deg, #f7f9ff 0%, #eef2ff 100%)" }}
          >
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl text-xl text-white shadow-sm font-bold"
              style={{ background: "linear-gradient(135deg, #174DE5, #6A16B8)" }}
            >
              ✦
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171B68]">GovFix AI Assistant</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-[#4a569d]">
                GovFix coordinates across Education, Revenue, and Finance so your verification happens automatically in the background.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-[#e2e8f5] p-3.5 text-xs space-y-1.5">
              <div className="font-bold text-[#171B68]">Privacy Protected</div>
              <p className="text-[#7d8fca] text-[11px] leading-relaxed">
                GovFix only requests minimal verified attributes from each department. We never share your credentials across unconnected services.
              </p>
            </div>

            <button
              onClick={() => nav("dashboard")}
              className="w-full py-2.5 rounded-xl border border-[#174DE5]/30 bg-white text-xs font-bold text-[#171B68] hover:bg-slate-50 cursor-pointer transition-all"
            >
              Explore Other Services
            </button>
          </aside>
        </div>
      </main>

      {/* Unified Application Timeline Modal (Section 24) */}
      {showTimelineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e8f5] space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#174DE5]">
                  Cross-Department Lifecycle (Section 24)
                </span>
                <h3 className="text-xl font-extrabold text-[#171B68] mt-0.5">
                  Unified Application Timeline
                </h3>
                <p className="text-xs text-[#7d8fca] font-mono mt-0.5">
                  Application: {crossApp.id}
                </p>
              </div>
              <button
                onClick={() => setShowTimelineModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Step-by-step cross-department timeline */}
            <div className="space-y-3.5 relative pl-6 border-l-2 border-[#174DE5]/30 text-xs">
              {[
                { time: "10:02 AM", title: "Citizen submitted application", dept: "Citizen Portal", done: true },
                { time: "10:03 AM", title: "Identity verified via UIDAI e-KYC", dept: "Citizen Services", done: true },
                { time: "10:04 AM", title: "Revenue verification completed", dept: "Revenue Department", done: true },
                { time: "10:05 AM", title: "Education ERP received application", dept: "Higher Education", done: true },
                { time: "10:07 AM", title: "Education Officer reviewed application", dept: "Higher Education", done: true },
                {
                  time: "10:08 AM",
                  title: isApproved ? "Education approval completed" : "Education approval in progress",
                  dept: "Higher Education",
                  done: isApproved,
                  current: !isApproved,
                },
                {
                  time: "10:09 AM",
                  title: isApproved ? "Finance ERP received approval event" : "Finance ERP awaiting approval",
                  dept: "Finance & Treasury",
                  done: isDisbursed,
                  current: isApproved && !isDisbursed,
                },
                {
                  time: "10:10 AM",
                  title: isDisbursed ? "Payment processing completed & disbursed" : "Payment processing queued",
                  dept: "Finance & Treasury",
                  done: isDisbursed,
                },
              ].map((item, idx) => (
                <div key={idx} className="relative">
                  <div
                    className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-white shadow-2xs ${
                      item.done
                        ? "bg-emerald-600"
                        : item.current
                        ? "bg-[#174DE5] animate-pulse ring-2 ring-blue-300"
                        : "bg-slate-300"
                    }`}
                  ></div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#171B68]">{item.time}</span>
                    <span className="text-[10px] font-semibold text-[#174DE5] px-2 py-0.5 rounded-md bg-[#174DE5]/10">
                      {item.dept}
                    </span>
                  </div>
                  <div
                    className={`mt-0.5 font-medium ${
                      item.done ? "text-[#171B68]" : item.current ? "text-[#174DE5] font-bold" : "text-[#7d8fca]"
                    }`}
                  >
                    {item.title}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowTimelineModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#171B68] text-white font-bold text-xs hover:bg-[#171B68]/90 transition-all cursor-pointer"
            >
              Close Timeline
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ACCESS HISTORY & AUDIT LOG MODAL (Section 13)                            */}
      {/* ========================================================================= */}
      {showAccessHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-[#e2e8f5] space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#174DE5]">
                  Data Access Audit Trail (Section 13)
                </span>
                <h3 className="text-xl font-extrabold text-[#171B68] mt-0.5">
                  Access History & Data Sharing Permissions
                </h3>
                <p className="text-xs text-[#7d8fca] mt-0.5">
                  Chronological record of government portals that accessed your profile attributes via Citizen Key: <code className="font-mono font-bold text-[#174DE5]">{profile.citizenKey}</code>
                </p>
              </div>
              <button
                onClick={() => setShowAccessHistoryModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {consentRecords.map((record) => (
                <div
                  key={record.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    record.status === "AUTHORIZED"
                      ? "bg-white border-[#e2e8f5] shadow-2xs"
                      : "bg-slate-50/80 border-slate-200 opacity-75"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 pb-2 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#171B68]">{record.serviceName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            record.status === "AUTHORIZED"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          ● {record.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#7d8fca] font-medium mt-0.5">
                        {record.recipientDepartment} · Purpose: {record.purpose}
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="font-bold text-[#171B68]">{record.timestamp}</div>
                      <div className="font-mono text-[10px] text-slate-500">Session: {record.sessionToken}</div>
                    </div>
                  </div>

                  <div className="pt-2.5 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-slate-600">Shared Attributes:</span>
                      {record.permittedFields.map((f, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-medium bg-[#f7f9ff] text-[#174DE5] border border-[#e2e8f5] px-2 py-0.5 rounded-md"
                        >
                          ✓ {f}
                        </span>
                      ))}
                    </div>

                    {record.status === "AUTHORIZED" && (
                      <button
                        onClick={() => handleRevokeConsent(record.id)}
                        className="px-3 py-1 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-xs font-bold hover:bg-rose-100 cursor-pointer"
                      >
                        Revoke Permission
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowAccessHistoryModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#171B68] text-white font-bold text-xs hover:bg-[#171B68]/90 cursor-pointer"
              >
                Close Audit Log
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW / EDIT CITIZEN PROFILE MODAL (Section 3 & 9)                        */}
      {/* ========================================================================= */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-[#e2e8f5] space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#174DE5]">
                  Profile Data Vault (Section 3 & 9)
                </span>
                <h3 className="text-xl font-extrabold text-[#171B68] mt-0.5">
                  GovFix Citizen Profile
                </h3>
                <p className="text-xs text-[#7d8fca] mt-0.5">
                  Verified attributes linked to Key: <code className="font-mono font-bold text-[#174DE5]">{profile.citizenKey}</code>
                </p>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Profile Content */}
            <div className="space-y-4 text-xs">
              {/* Personal Information */}
              <div className="rounded-2xl border border-slate-100 bg-[#f7f9ff] p-4 space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-[#174DE5]">
                  1. Personal & Contact Information
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">Full Name:</span>
                    <span className="font-bold text-[#171B68] text-xs">{profile.personal.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">Date of Birth:</span>
                    <span className="font-bold text-[#171B68] text-xs">{profile.personal.dateOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">Gender:</span>
                    <span className="font-bold text-[#171B68] text-xs">{profile.personal.gender}</span>
                  </div>
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">Mobile:</span>
                    <span className="font-bold text-[#171B68] text-xs">{profile.personal.mobile}</span>
                  </div>
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">Email:</span>
                    <span className="font-bold text-[#171B68] text-xs">{profile.personal.email}</span>
                  </div>
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">PIN Code:</span>
                    <span className="font-mono font-bold text-[#171B68] text-xs">{profile.personal.pinCode}</span>
                  </div>
                  <div className="col-span-2 md:col-span-3">
                    <span className="text-[#7d8fca] block text-[10px]">Residential Address:</span>
                    <span className="font-medium text-[#171B68] text-xs">
                      {profile.personal.address}, {profile.personal.district}, {profile.personal.state}
                    </span>
                  </div>
                </div>
              </div>

              {/* Government Identifiers */}
              <div className="rounded-2xl border border-slate-100 bg-[#f7f9ff] p-4 space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-[#6A16B8]">
                  2. Government & Educational Identifiers
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">Aadhaar Reference:</span>
                    <span className="font-mono font-bold text-[#171B68] text-xs">{profile.identifiers.aadhaarRefMasked}</span>
                  </div>
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">PAN Reference:</span>
                    <span className="font-mono font-bold text-[#171B68] text-xs">{profile.identifiers.panRefMasked}</span>
                  </div>
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">Student Roll ID:</span>
                    <span className="font-mono font-bold text-[#171B68] text-xs">{profile.identifiers.studentId}</span>
                  </div>
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">Ration Card:</span>
                    <span className="font-mono font-bold text-[#171B68] text-xs">{profile.identifiers.rationCardNo}</span>
                  </div>
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">Voter ID Token:</span>
                    <span className="font-mono font-bold text-[#171B68] text-xs">{profile.identifiers.voterIdMasked}</span>
                  </div>
                </div>
              </div>

              {/* Verified Attributes & Bank Mandates */}
              <div className="rounded-2xl border border-slate-100 bg-[#f7f9ff] p-4 space-y-3">
                <div className="text-xs font-black uppercase tracking-wider text-[#FF7A18]">
                  3. Verified Scheme Attributes & Bank Mandates
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">Assessed Annual Income:</span>
                    <span className="font-bold text-[#171B68] text-xs">₹{profile.attributes.annualIncome.toLocaleString("en-IN")}</span>
                  </div>
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">Income Cert Reference:</span>
                    <span className="font-mono font-bold text-[#171B68] text-xs">{profile.attributes.incomeCertificateNo}</span>
                  </div>
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">Institution & Program:</span>
                    <span className="font-medium text-[#171B68] text-xs">{profile.attributes.enrolledProgram} ({profile.attributes.cgpaScore} CGPA)</span>
                  </div>
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">Direct Benefit Bank:</span>
                    <span className="font-medium text-[#171B68] text-xs">{profile.attributes.bankName}</span>
                  </div>
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">Masked Account:</span>
                    <span className="font-mono font-bold text-[#171B68] text-xs">{profile.attributes.bankAccountNumberMasked}</span>
                  </div>
                  <div>
                    <span className="text-[#7d8fca] block text-[10px]">Branch IFSC:</span>
                    <span className="font-mono font-bold text-[#171B68] text-xs">{profile.attributes.bankIfsc}</span>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents */}
              <div className="rounded-2xl border border-slate-100 bg-[#f7f9ff] p-4 space-y-2">
                <div className="text-xs font-black uppercase tracking-wider text-[#174DE5]">
                  4. Securely Stored Document Attestations
                </div>
                <div className="divide-y divide-slate-200/60">
                  {profile.documents.map((doc) => (
                    <div key={doc.id} className="py-2 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-[#171B68]">{doc.name}</span>
                        <span className="text-[#7d8fca] text-[10px] ml-2">Issued by: {doc.issuedBy}</span>
                      </div>
                      <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[10px]">
                        ✓ Verified
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-slate-100">
              <span className="text-[11px] text-[#7d8fca]">
                Profile Vault Encrypted at rest (AES-256 simulation)
              </span>
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-5 py-2.5 rounded-xl bg-[#171B68] text-white font-bold text-xs hover:bg-[#171B68]/90 cursor-pointer"
              >
                Close Vault
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
