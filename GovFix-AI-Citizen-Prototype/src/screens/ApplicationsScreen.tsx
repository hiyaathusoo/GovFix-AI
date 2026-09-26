import { useEffect, useMemo, useState } from "react";
import type { Screen } from "../App";
import {
  APPLICATIONS_UPDATED_EVENT,
  getApplications,
  type CitizenApplication,
} from "../services/applicationStore";

interface Props {
  nav: (s: Screen) => void;
}

type ApplicationRecord = CitizenApplication;

export default function ApplicationsScreen({ nav }: Props) {
  const [filter, setFilter] = useState<"all" | "processing" | "completed">("all");
  const [selectedRecord, setSelectedRecord] = useState<ApplicationRecord | null>(null);
  const [records, setRecords] = useState<ApplicationRecord[]>(() => getApplications());

  useEffect(() => {
    const refreshApplications = () => setRecords(getApplications());
    window.addEventListener(APPLICATIONS_UPDATED_EVENT, refreshApplications);
    window.addEventListener("storage", refreshApplications);

    return () => {
      window.removeEventListener(APPLICATIONS_UPDATED_EVENT, refreshApplications);
      window.removeEventListener("storage", refreshApplications);
    };
  }, []);

  const applicationCounts = useMemo(() => ({
    all: records.length,
    processing: records.filter((record) => record.status === "Processing").length,
    completed: records.filter((record) => record.status !== "Processing").length,
  }), [records]);

  const filteredRecords = records.filter((r) => {
    if (filter === "processing") return r.status === "Processing";
    if (filter === "completed") return r.status !== "Processing";
    return true;
  });

  return (
    <div className="min-h-screen flex" style={{ background: "#f7f9ff" }}>
      {/* Sidebar */}
      <aside
        className="w-64 shrink-0 flex flex-col"
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
            <div className="text-white font-bold text-sm">GovFix AI</div>
            <div className="text-white/80 text-[11px] font-medium">My Applications</div>
          </div>
        </div>

        <nav className="p-4 space-y-1.5 flex-1">
          <button
            onClick={() => nav("citizen")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#7d8fca] hover:text-white hover:bg-white/5 text-sm font-semibold text-left transition-all cursor-pointer"
          >
            <span className="text-base">←</span>
            <span>Citizen Dashboard</span>
          </button>

          <button
            onClick={() => nav("dashboard")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#7d8fca] hover:text-white hover:bg-white/5 text-sm font-semibold text-left transition-all cursor-pointer"
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
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white bg-white/10 text-sm font-semibold text-left transition-all cursor-pointer shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 2h10v12H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <div className="flex-1 flex items-center justify-between">
              <span>My Applications</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-[#174DE5] text-white">
                {records.length}
              </span>
            </div>
          </button>
        </nav>

        <div className="p-4">
          <div
            className="rounded-2xl p-4 border border-white/10"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div className="text-[#7d8fca] text-[10px] uppercase font-semibold mb-1">
              Registered Citizen
            </div>
            <div className="text-white text-xs font-bold">Aarav Sharma</div>
            <div className="font-mono text-[#FF7A18] text-xs mt-1">CIT-2026-001</div>
            <div className="text-[#7d8fca] text-[10px] mt-1.5 leading-snug">
              Secure reference identifier
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="px-8 py-5 bg-white border-b" style={{ borderColor: "#e2e8f5" }}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs text-[#7d8fca] mb-1">
                <button
                  onClick={() => nav("dashboard")}
                  className="hover:text-[#171B68] transition-colors cursor-pointer"
                >
                  Dashboard
                </button>
                <span>/</span>
                <span className="text-[#171B68] font-semibold">My Applications</span>
              </div>
              <h1 className="text-[#171B68] text-xl font-bold">
                My Applications & Government Services
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => nav("dashboard")}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#171B68] border border-[#e2e8f5] hover:border-[#174DE5] hover:text-[#174DE5] hover:bg-slate-50 transition-all cursor-pointer"
              >
                + Apply for New Service
              </button>
              <button
                onClick={() => nav("login")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#171B68] border border-[#e2e8f5] hover:bg-slate-50 transition-all cursor-pointer"
                title="Sign out and return to Login"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-5xl space-y-6">
          {/* Reassurance Banner */}
          <div
            className="p-5 rounded-3xl border flex items-center justify-between"
            style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 2L3 5.5v6c0 5 3.5 7.5 7 8.5 3.5-1 7-3.5 7-8.5v-6L10 2z"
                    stroke="white"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M7 10l2 2 4-4"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <div className="text-emerald-950 font-bold text-sm">
                  GovFix Continuous Application Protection
                </div>
                <div className="text-emerald-800 text-xs">
                  All applications are monitored by GovFix. Disrupted requests are automatically
                  resumed with zero loss of progress.
                </div>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {[
              { id: "all", label: `All Applications (${applicationCounts.all})` },
              { id: "processing", label: `In Progress (${applicationCounts.processing})` },
              { id: "completed", label: `Completed / Approved (${applicationCounts.completed})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  filter === tab.id
                    ? "bg-[#171B68] text-white shadow-sm"
                    : "bg-white text-[#171B68] border border-[#e2e8f5] hover:border-[#174DE5] hover:text-[#174DE5]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Records List */}
          <div className="space-y-4">
            {filteredRecords.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="p-6 rounded-3xl bg-white border border-[#e2e8f5] hover:border-[#174DE5]/50 transition-all shadow-xs"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs font-bold text-[#174DE5] uppercase tracking-wider">
                        {item.category} · {item.service}
                      </span>
                      {item.recovered && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF7A18]/15 text-[#FF7A18] border border-[#FF7A18]/30 flex items-center gap-1">
                          <span>⚡</span> Auto-Recovered by GovFix
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-[#171B68]">{item.scheme}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                        item.statusColor === "emerald"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : "bg-[#FF7A18]/10 text-[#FF7A18] border border-[#FF7A18]/25"
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          item.statusColor === "emerald" ? "bg-emerald-500" : "bg-[#FF7A18]"
                        }`}
                      ></span>
                      <span>{item.status}</span>
                    </span>

                    <button
                      onClick={() => setSelectedRecord(item)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold text-[#171B68] bg-[#f7f9ff] hover:bg-[#e2e8f5] transition-all cursor-pointer border border-[#e2e8f5]"
                    >
                      View Details
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[#7d8fca] block mb-0.5">GovFix Application ID</span>
                    <span className="font-mono font-bold text-[#171B68]">{item.id}</span>
                  </div>

                  <div>
                    <span className="text-[#7d8fca] block mb-0.5">Department Ref</span>
                    <span className="font-mono text-[#174DE5] font-semibold">{item.govRef}</span>
                  </div>

                  <div>
                    <span className="text-[#7d8fca] block mb-0.5">Submitted / Updated</span>
                    <span className="text-[#171B68] font-medium">{item.date}</span>
                  </div>

                  <div>
                    <span className="text-[#7d8fca] block mb-0.5">Disbursement / Value</span>
                    <span className="text-[#171B68] font-bold">{item.amount || "N/A"}</span>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-50 text-xs text-[#174DE5] flex items-center gap-2">
                  <span className="text-emerald-600 font-bold">ℹ</span>
                  <span>{item.note}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Application Details Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-[#174DE5] uppercase">
                  Application Record
                </span>
                <h3 className="text-xl font-bold text-[#171B68] mt-0.5">
                  {selectedRecord.service}
                </h3>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs mb-6">
              <div className="p-4 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#7d8fca]">GovFix Application ID</span>
                  <span className="font-mono font-bold text-[#171B68]">{selectedRecord.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7d8fca]">Department Reference</span>
                  <span className="font-mono text-[#171B68]">{selectedRecord.govRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7d8fca]">Applicant</span>
                  <span className="font-semibold text-[#171B68]">
                    Aarav Sharma (CIT-2026-001)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7d8fca]">Status</span>
                  <span className="font-bold text-emerald-700">{selectedRecord.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7d8fca]">Date & Time</span>
                  <span className="text-[#171B68]">{selectedRecord.date}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200">
                <div className="font-bold text-emerald-950 mb-1">Protection Log</div>
                <p className="text-emerald-800 leading-relaxed">{selectedRecord.note}</p>
              </div>
            </div>

            <button
              onClick={() => setSelectedRecord(null)}
              className="w-full py-3 rounded-xl text-white font-semibold text-xs cursor-pointer transition-all hover:opacity-95"
              style={{ background: "linear-gradient(135deg, #171B68, #174DE5)" }}
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
