// src/screens/OfficerScreen.tsx
// GovFix AI - Education Department Officer Review Portal & ERP Interface (Sections 14-18, 23)

import { useState, useEffect } from "react";
import type { Screen } from "../App";
import { DEMO_APPLICATION, DEMO_CITIZEN } from "../config/demoData";
import { updateApplicationStatus } from "../services/applicationStore";
import {
  getCrossDeptApplication,
  approveByEducationOfficer,
  requestInfoByOfficer,
  getInteropScenario,
  subscribeInteropUpdates,
  type CrossDeptApplication,
} from "../services/crossDepartmentErpService";
import {
  getDepartmentServices,
  getDepartmentIncidents,
  subscribeHealthUpdates,
  type MonitoredService,
  type HealthIncident,
} from "../services/healthMonitoringService";

interface Props {
  nav: (screen: Screen) => void;
}

export default function OfficerScreen({ nav }: Props) {
  const [crossApp, setCrossApp] = useState<CrossDeptApplication>(getCrossDeptApplication());
  const [activeOfficerTab, setActiveOfficerTab] = useState<"dashboard" | "applications" | "erp" | "workflow">("dashboard");
  const [actionMessage, setActionMessage] = useState<string>("");
  const [showAffectedModal, setShowAffectedModal] = useState(false);

  // Health and Interop state subscriptions
  const [educationServices, setEducationServices] = useState<MonitoredService[]>(() =>
    getDepartmentServices("Education")
  );
  const [educationIncidents, setEducationIncidents] = useState<HealthIncident[]>(() =>
    getDepartmentIncidents("Education")
  );
  const [scenario, setScenario] = useState(getInteropScenario());

  useEffect(() => {
    const unsubInterop = subscribeInteropUpdates(() => {
      setCrossApp({ ...getCrossDeptApplication() });
      setScenario(getInteropScenario());
    });
    const unsubHealth = subscribeHealthUpdates(() => {
      setEducationServices([...getDepartmentServices("Education")]);
      setEducationIncidents([...getDepartmentIncidents("Education")]);
    });
    return () => {
      unsubInterop();
      unsubHealth();
    };
  }, []);

  // Department Applications Requiring Action (Section 15, 16)
  const departmentApplications = [
    {
      id: "GOV-2026-1042",
      citizenId: "CIT-001",
      name: "Aarav Sharma",
      program: "B.Tech Computer Science",
      meritScore: "96.4%",
      status: crossApp.commonData.departmentApproval === "APPROVED" ? "Approved" : "Under Review",
      priority: "High",
      isTarget: true,
    },
    {
      id: "GOV-2026-1048",
      citizenId: "CIT-014",
      name: "Rohit Verma",
      program: "B.Sc Physics",
      meritScore: "88.2%",
      status: "Document Issue",
      priority: "Normal",
      isTarget: false,
    },
    {
      id: "GOV-2026-1052",
      citizenId: "CIT-021",
      name: "Meera Patel",
      program: "B.Com Honors",
      meritScore: "91.5%",
      status: "Verification Pending",
      priority: "Normal",
      isTarget: false,
    },
  ];

  const handleApprove = () => {
    if (!window.confirm(`Approve scholarship application ${crossApp.id} for ${crossApp.citizenName}?`)) return;
    approveByEducationOfficer("Academic credentials verified. Forwarding to Finance ERP for DBT disbursement.");
    updateApplicationStatus(
      DEMO_APPLICATION.id,
      "Approved",
      "Approved by Education Officer Priya Mehta. Forwarded to Finance ERP for direct benefit disbursement."
    );
    setActionMessage("✓ Approval event DEPARTMENT_APPROVED emitted to GovFix. Workflow forwarded to Finance ERP.");
  };

  const handleRequestInfo = () => {
    const reason = window.prompt("Specify required documentation / information:", "Institutional enrollment certificate");
    if (!reason) return;
    requestInfoByOfficer(reason);
    updateApplicationStatus(
      DEMO_APPLICATION.id,
      "Action required",
      `Education Officer requested: ${reason}`
    );
    setActionMessage(`⚠️ Information request sent to citizen: ${reason}`);
  };

  const isApproved = crossApp.commonData.departmentApproval === "APPROVED";
  const hasFinanceIssue = scenario === "SIMULATE_FINANCE_FAILURE";
  const activeServiceIssue = educationServices.find((s) => s.status !== "HEALTHY");

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#171B68] font-[DM_Sans,system-ui,sans-serif]">
      {/* Officer Header */}
      <header className="bg-white border-b border-[#e2e8f5] shadow-xs px-6 py-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md text-white shrink-0 font-bold"
              style={{ background: "linear-gradient(135deg, #171B68, #174DE5)" }}
            >
              🎓
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#171B68]">
                  Education Department ERP · Officer Portal
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  EDU-OFF-021
                </span>
              </div>
              <p className="text-xs text-[#7d8fca] mt-0.5">
                Officer: Priya Mehta · Departmental Review & Scholarship Processing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => nav("citizen")}
              className="rounded-xl border border-[#e2e8f5] bg-white px-3.5 py-2 text-xs font-bold text-[#171B68] hover:bg-slate-50 cursor-pointer transition-all"
            >
              ← Citizen Dashboard
            </button>
            <button
              onClick={() => nav("login")}
              className="rounded-xl border border-[#e2e8f5] bg-white px-3.5 py-2 text-xs font-bold text-[#7d8fca] hover:text-[#171B68] hover:bg-slate-50 cursor-pointer transition-all"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Officer Navigation (Section 14) */}
      <div className="bg-white border-b border-[#e2e8f5] px-6">
        <div className="max-w-6xl mx-auto flex items-center gap-2 overflow-x-auto py-2.5 text-xs">
          <button
            onClick={() => setActiveOfficerTab("dashboard")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeOfficerTab === "dashboard"
                ? "bg-[#171B68] text-white shadow-xs"
                : "text-[#7d8fca] hover:text-[#171B68] hover:bg-slate-50"
            }`}
          >
            📊 Department Dashboard
          </button>
          <button
            onClick={() => setActiveOfficerTab("applications")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeOfficerTab === "applications"
                ? "bg-[#171B68] text-white shadow-xs"
                : "text-[#7d8fca] hover:text-[#171B68] hover:bg-slate-50"
            }`}
          >
            📑 Applications Requiring Action (3)
          </button>
          <button
            onClick={() => setActiveOfficerTab("erp")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeOfficerTab === "erp"
                ? "bg-[#171B68] text-white shadow-xs"
                : "text-[#7d8fca] hover:text-[#171B68] hover:bg-slate-50"
            }`}
          >
            💻 Department ERP View
          </button>
          <button
            onClick={() => setActiveOfficerTab("workflow")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeOfficerTab === "workflow"
                ? "bg-[#171B68] text-white shadow-xs"
                : "text-[#7d8fca] hover:text-[#171B68] hover:bg-slate-50"
            }`}
          >
            🔄 Cross-Department Data & Approval
          </button>
        </div>
      </div>

      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Officer Failure Alert Banner (Section 23) */}
        {(hasFinanceIssue || activeServiceIssue) && (
          <section className="rounded-3xl p-5 border border-[#FF7A18]/40 bg-[#FF7A18]/10 text-amber-950 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <span className="text-2xl mt-0.5">⚠️</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#FF7A18]">
                    DEPARTMENT SERVICE ISSUE DETECTED
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white border border-[#FF7A18]/30 text-[#FF7A18]">
                    Workflow Preserved
                  </span>
                </div>
                <div className="text-sm font-bold text-[#171B68] mt-1">
                  {hasFinanceIssue
                    ? "Finance verification / DBT settlement gateway is temporarily unavailable."
                    : `${activeServiceIssue?.name} is experiencing elevated latency.`}
                </div>
                <div className="text-xs text-amber-900 mt-0.5">
                  Affected applications: 8. GovFix resilience engine has preserved all pending workflows. No officer re-entry is required.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAffectedModal(true)}
              className="self-start md:self-auto px-4 py-2 rounded-xl bg-white border border-[#FF7A18]/40 text-xs font-bold text-[#171B68] hover:bg-orange-50 transition-all cursor-pointer shadow-2xs whitespace-nowrap"
            >
              View Affected Applications (8) →
            </button>
          </section>
        )}

        {/* Action Message Banner */}
        {actionMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 shadow-2xs flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage("")} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
        )}

        {/* Department Dashboard Metrics (Section 15) */}
        <section className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Applications Received</div>
            <div className="text-2xl font-black text-[#171B68] mt-1">148</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Academic Year 2025-26</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Under Review</div>
            <div className="text-2xl font-black text-[#FF7A18] mt-1">27</div>
            <div className="text-[10px] text-[#FF7A18] mt-0.5 font-semibold">Active Queue</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Approved</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {isApproved ? 90 : 89}
            </div>
            <div className="text-[10px] text-emerald-600 mt-0.5 font-semibold">Forwarded to Finance</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Pending Information</div>
            <div className="text-2xl font-black text-amber-600 mt-1">18</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Citizen Clarification</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Exceptions</div>
            <div className="text-2xl font-black text-rose-600 mt-1">4</div>
            <div className="text-[10px] text-rose-600 mt-0.5 font-semibold">Escalated to HoD</div>
          </div>
        </section>

        {/* TAB: DASHBOARD & WORKFLOW ACTION (Section 15, 17, 18) */}
        {(activeOfficerTab === "dashboard" || activeOfficerTab === "workflow") && (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr]">
            {/* Left Column: Targeted Application Detail */}
            <section className="rounded-3xl border border-[#e2e8f5] bg-white p-6 shadow-xs space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#174DE5] uppercase tracking-wider">
                      Targeted Application
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      National Scholarship Portal
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-[#171B68] mt-1">{crossApp.id}</h2>
                  <p className="text-xs text-[#7d8fca] mt-0.5">
                    Beneficiary: {crossApp.citizenName} ({crossApp.citizenId}) · <span className="font-mono font-bold text-[#174DE5]">GCK-MH-7F42-K9P8-X2Q6</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-lg">
                    🔒 Minimized Profile Access
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      isApproved
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-[#FF7A18]/15 text-[#FF7A18] border border-[#FF7A18]/30"
                    }`}
                  >
                    ● {crossApp.commonData.departmentApproval}
                  </span>
                </div>
              </div>

              {/* Cross-Department Verified Data (Section 17) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#7d8fca]">
                    Cross-Department Verified Attributes (Section 17)
                  </h3>
                  <span className="text-[10px] text-emerald-700 font-semibold">
                    ✓ Verified via GovFix Connectors
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Identity Verification Check */}
                  <div className="p-3.5 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#171B68]">Identity Verification</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                        ✓ Verified
                      </span>
                    </div>
                    <div className="text-[#7d8fca] text-[11px]">
                      Source: Citizen Services ERP (UIDAI)
                    </div>
                    <div className="font-mono text-[11px] text-slate-700 mt-1">
                      Token: {crossApp.commonData.aadhaarMasked} (e-KYC Valid)
                    </div>
                  </div>

                  {/* Revenue / Income Check */}
                  <div className="p-3.5 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#171B68]">Revenue & Income</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
                        ✓ Verified
                      </span>
                    </div>
                    <div className="text-[#7d8fca] text-[11px]">
                      Source: Revenue Department ERP
                    </div>
                    <div className="font-mono text-[11px] text-slate-700 mt-1">
                      Income: ₹2,50,000 / yr (Tier-1 Subsidized)
                    </div>
                  </div>

                  {/* Education Verification */}
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-950">Education Record</span>
                      <span className="font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                        ⟳ Current Department
                      </span>
                    </div>
                    <div className="text-amber-800 text-[11px]">
                      Source: Education Department ERP
                    </div>
                    <div className="font-mono text-[11px] text-amber-900 mt-1">
                      Merit: 96.4% · {crossApp.commonData.institution}
                    </div>
                  </div>

                  {/* Finance / DBT Status */}
                  <div className="p-3.5 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#171B68]">Finance DBT Processing</span>
                      <span
                        className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          crossApp.commonData.paymentStatus === "DISBURSED"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {crossApp.commonData.paymentStatus === "DISBURSED" ? "✓ Disbursed" : "○ Pending Approval"}
                      </span>
                    </div>
                    <div className="text-[#7d8fca] text-[11px]">
                      Destination: Finance ERP (PFMS DBT)
                    </div>
                    <div className="font-mono text-[11px] text-slate-700 mt-1">
                      Grant: {crossApp.commonData.disbursementAmount}
                    </div>
                  </div>
                </div>
              </div>

              {/* Officer Decision Actions (Section 18) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="text-xs font-bold text-[#171B68]">
                  Officer Action: Complete Department Review
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={handleApprove}
                    disabled={isApproved}
                    className="px-5 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs hover:bg-emerald-700 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <span>✓ {isApproved ? "Application Approved" : "Approve Application & Route to Finance"}</span>
                  </button>
                  <button
                    onClick={handleRequestInfo}
                    className="px-4 py-3 rounded-xl bg-[#FF7A18]/15 text-[#FF7A18] border border-[#FF7A18]/30 font-bold text-xs hover:bg-[#FF7A18]/25 transition-all cursor-pointer"
                  >
                    Request Information
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm("Reject this application?")) {
                        alert("Application rejected. Notification sent.");
                      }
                    }}
                    className="px-4 py-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 font-bold text-xs hover:bg-rose-100 transition-all cursor-pointer"
                  >
                    Reject
                  </button>
                </div>

                <p className="text-[11px] text-[#7d8fca] leading-relaxed">
                  Approving this application automatically generates the signed <span className="font-mono font-bold text-[#171B68]">DEPARTMENT_APPROVED</span> event,
                  routing the validated citizen credential to the Finance Department ERP for automated Direct Benefit Transfer disbursement.
                </p>
              </div>
            </section>

            {/* Right Column: Applications Requiring Action (Section 15) */}
            <section className="rounded-3xl border border-[#e2e8f5] bg-white p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#171B68]">Applications Requiring Action</h3>
                  <p className="text-xs text-[#7d8fca]">Education department officer review queue</p>
                </div>
                <span className="text-xs font-bold text-[#174DE5] bg-[#174DE5]/10 px-2 py-0.5 rounded-full">
                  {departmentApplications.length} Pending
                </span>
              </div>

              <div className="space-y-3">
                {departmentApplications.map((app) => (
                  <div
                    key={app.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      app.isTarget
                        ? "bg-white border-[#174DE5] shadow-sm ring-1 ring-[#174DE5]/30"
                        : "bg-[#f7f9ff] border-[#e2e8f5]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#171B68]">{app.id}</span>
                        <span className="text-[10px] text-[#7d8fca]">({app.citizenId})</span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          app.status === "Approved"
                            ? "bg-emerald-50 text-emerald-800"
                            : app.status === "Document Issue"
                            ? "bg-rose-50 text-rose-800"
                            : "bg-[#FF7A18]/15 text-[#FF7A18]"
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="font-bold text-xs text-[#171B68]">{app.name}</div>
                    <div className="text-[11px] text-[#7d8fca] mt-0.5">
                      {app.program} · Merit: {app.meritScore}
                    </div>
                  </div>
                ))}
              </div>

              {/* Event Bridge Reassurance Box */}
              <div
                className="p-4 rounded-2xl text-white space-y-2 mt-4"
                style={{ background: "linear-gradient(135deg, #171B68, #174DE5)" }}
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  GovFix Event Bus Connected
                </div>
                <p className="text-xs text-white/90 leading-relaxed">
                  Officer decisions are broadcast securely across the GovFix event bus. The citizen application and downstream Treasury DBT pipelines update automatically.
                </p>
              </div>
            </section>
          </div>
        )}

        {/* TAB: DEPARTMENT ERP VIEW (Section 16) */}
        {activeOfficerTab === "erp" && (
          <section className="bg-white rounded-3xl border border-[#e2e8f5] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#171B68]">
                  Education Department Internal ERP System (Section 16)
                </h2>
                <p className="text-xs text-[#7d8fca]">
                  Department internal record view · Synced with GovFix resilience gateway
                </p>
              </div>
              <span className="font-mono text-xs text-[#174DE5] font-bold bg-[#f7f9ff] px-3 py-1 rounded-xl border border-[#e2e8f5]">
                ERP NODE: highereducation.gov.in:8443
              </span>
            </div>

            <div className="bg-[#f7f9ff] rounded-2xl border border-[#e2e8f5] overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-white border-b border-[#e2e8f5] text-[#7d8fca] font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Application ID</th>
                    <th className="py-3 px-4">Citizen ID</th>
                    <th className="py-3 px-4">Applicant Name</th>
                    <th className="py-3 px-4">Program & Institution</th>
                    <th className="py-3 px-4">Merit</th>
                    <th className="py-3 px-4">ERP Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/60">
                  {departmentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-white transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#171B68]">{app.id}</td>
                      <td className="py-3.5 px-4 font-mono text-[#7d8fca]">{app.citizenId}</td>
                      <td className="py-3.5 px-4 font-bold text-[#171B68]">{app.name}</td>
                      <td className="py-3.5 px-4 text-[#7d8fca]">{app.program}</td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">{app.meritScore}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            app.status === "Approved"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-[#FF7A18]/15 text-[#FF7A18]"
                          }`}
                        >
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => setActiveOfficerTab("workflow")}
                          className="px-3 py-1 rounded-xl bg-white border border-[#e2e8f5] text-xs font-bold text-[#174DE5] hover:bg-[#f7f9ff] cursor-pointer"
                        >
                          Review →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </main>

      {/* Affected Applications Modal (Section 23) */}
      {showAffectedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e2e8f5] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#174DE5]">
                  Department Service Issue (Section 23)
                </span>
                <h3 className="text-xl font-extrabold text-[#171B68] mt-0.5">
                  Affected Education Applications
                </h3>
              </div>
              <button
                onClick={() => setShowAffectedModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#7d8fca] leading-relaxed">
              The following applications are experiencing processing delay due to external ERP response timeout. GovFix has securely buffered all citizen states.
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {[
                { id: "GOV-2026-1042", name: "Aarav Sharma", step: "Education Approval", status: "Preserved in Buffer" },
                { id: "GOV-2026-1048", name: "Rohit Verma", step: "Document Verification", status: "Preserved in Buffer" },
                { id: "GOV-2026-1052", name: "Meera Patel", step: "Approval Pending", status: "Preserved in Buffer" },
                { id: "GOV-2026-1059", name: "Kunal Iyer", step: "Disbursement Prep", status: "Preserved in Buffer" },
              ].map((app) => (
                <div key={app.id} className="p-3 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-mono font-bold text-[#171B68]">{app.id}</div>
                    <div className="text-[11px] text-[#7d8fca]">{app.name} · {app.step}</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {app.status}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAffectedModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#171B68] text-white font-bold text-xs hover:bg-[#171B68]/90 transition-all cursor-pointer"
            >
              Close Applications List
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
