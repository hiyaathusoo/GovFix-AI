import { useState, useEffect } from "react";
import type { Screen } from "../App";

interface Props {
  nav: (s: Screen) => void;
}

export default function RecoveryScreen({ nav }: Props) {
  const [phase, setPhase] = useState<"waiting" | "recovered">("waiting");
  const [timerSeconds, setTimerSeconds] = useState(3);

  // Auto-transition from waiting to recovered after 3 seconds for realistic simulation
  useEffect(() => {
    if (phase === "waiting") {
      const timer = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase("recovered");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  return (
    <div className="min-h-screen flex" style={{ background: "#f0f3fa" }}>
      {/* Sidebar */}
      <aside
        className="w-64 shrink-0 flex flex-col"
        style={{ background: "#0f1729", minHeight: "100vh" }}
      >
        <div
          className="p-6 flex items-center gap-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shadow"
            style={{ background: "#f59e0b" }}
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
            <div className="text-amber-400/90 text-[11px] font-medium">Automatic Recovery</div>
          </div>
        </div>

        <div className="p-4 space-y-1.5 flex-1">
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
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#7d8fca] hover:text-white hover:bg-white/5 text-sm font-semibold text-left transition-all cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 2h10v12H3z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M5 6h6M5 9h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>My Applications</span>
          </button>

          <button
            onClick={() => nav("login")}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[#7d8fca] hover:text-rose-300 hover:bg-white/5 text-sm font-semibold text-left transition-all cursor-pointer"
            title="Sign out and return to Login"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 14H3a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h3" />
              <polyline points="11 11 14 8 11 5" />
              <line x1="14" y1="8" x2="5" y2="8" />
            </svg>
            <span>Sign Out</span>
          </button>
        </div>

        <div className="p-4">
          <div
            className="rounded-2xl p-4 border border-white/10"
            style={{ background: "rgba(255,255,255,0.05)" }}
          >
            <div className="text-[#7d8fca] text-[10px] uppercase font-semibold mb-1">
              Tracked Transaction
            </div>
            <div className="font-mono text-amber-400 text-xs font-bold">GF-2026-10482</div>
            <div className="text-white text-xs mt-1">Arjun Ramesh</div>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-auto">
        <div className="w-full max-w-2xl">
          <div
            className="rounded-3xl overflow-hidden bg-white border border-slate-200"
            style={{ boxShadow: "0 16px 48px rgba(15, 23, 41, 0.12)" }}
          >
            {/* Header: Changes color based on phase */}
            <div
              className="px-8 py-6 text-white transition-all duration-500"
              style={{
                background:
                  phase === "waiting"
                    ? "linear-gradient(135deg, #1e2d5a 0%, #263670 100%)"
                    : "linear-gradient(135deg, #059669 0%, #047857 100%)",
                borderBottom: phase === "waiting" ? "3px solid #f59e0b" : "3px solid #10b981",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    background: phase === "waiting" ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {phase === "waiting" ? (
                    <svg className="animate-spin text-amber-400" width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" />
                      <path d="M7 12l3.5 3.5 7-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold tracking-wider uppercase mb-1 opacity-90">
                    {phase === "waiting" ? "Recovery in progress" : "Submission Confirmed"}
                  </div>
                  <h1 className="text-white text-2xl font-bold tracking-tight">
                    {phase === "waiting"
                      ? "Recovering your application…"
                      : "Application successfully submitted."}
                  </h1>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6">
              {/* Phase 1: Waiting for recovery */}
              {phase === "waiting" ? (
                <div className="space-y-6">
                  <div
                    className="p-4 rounded-2xl border"
                    style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold uppercase tracking-wider text-[#162040]">
                        Your saved application is being processed
                      </span>
                      <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                        Auto-resuming in {timerSeconds}s
                      </span>
                    </div>

                    <div className="space-y-3.5">
                      {[
                        { label: "Application saved", done: true },
                        { label: "Recovery in progress", done: true },
                      ].map((step) => (
                        <div key={step.label} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">
                            ✓
                          </div>
                          <span className="text-sm font-semibold text-[#162040]">
                            {step.label}
                          </span>
                        </div>
                      ))}

                      {/* Active retrying step */}
                      <div className="flex items-center gap-3 pt-0.5">
                        <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 text-xs font-bold animate-spin">
                          ⟳
                        </div>
                        <span className="text-sm font-bold text-amber-900 animate-pulse">
                          Request being retried
                        </span>
                      </div>

                      {/* Next step */}
                      <div className="flex items-center gap-3 opacity-60">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center shrink-0 text-[10px] text-slate-400">
                          ○
                        </div>
                        <span className="text-sm text-slate-500">
                          Application restored & submitted
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-[#7d8fca] pt-2">
                    <span>Application ID: GF-2026-10482</span>
                    <button
                      onClick={() => setPhase("recovered")}
                      className="text-[#1e2d5a] font-bold hover:underline cursor-pointer"
                    >
                      Skip simulation timer →
                    </button>
                  </div>
                </div>
              ) : (
                /* Phase 2: Recovered & Submitted successfully */
                <div className="space-y-6">
                  {/* Requirement #6 Specified Key Reassurance Message */}
                  <div
                    className="p-5 rounded-2xl border"
                    style={{ background: "#ecfdf5", borderColor: "#a7f3d0" }}
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                          <path
                            d="M3.75 9l3.75 3.75 6.75-7.5"
                            stroke="white"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <h2 className="text-emerald-950 font-bold text-lg mb-1">
                          Application successfully submitted.
                        </h2>
                        <p className="text-emerald-800 text-sm leading-relaxed">
                          Your application was recovered successfully. No action is required.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Transition steps checklist */}
                  <div
                    className="p-5 rounded-2xl border"
                    style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
                  >
                    <div className="text-[#0f1729] font-bold text-xs uppercase tracking-wider mb-3">
                      Completed Recovery Actions
                    </div>
                    <div className="space-y-2.5">
                      {[
                        "Service recovered",
                        "Application automatically resumed",
                        "Application submitted successfully",
                      ].map((label) => (
                        <div key={label} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">
                            ✓
                          </div>
                          <span className="text-sm font-bold text-[#162040]">
                            {label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Confirmed Details Table */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div
                      className="p-3.5 rounded-xl border bg-emerald-50/40 border-emerald-200"
                    >
                      <div className="text-emerald-800 font-medium mb-1">Application ID</div>
                      <div className="font-mono text-base font-bold text-emerald-950">
                        GF-2026-10482
                      </div>
                    </div>

                    <div
                      className="p-3.5 rounded-xl border"
                      style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
                    >
                      <div className="text-[#7d8fca] mb-1">Service & Scheme</div>
                      <div className="font-semibold text-[#0f1729]">
                        Selected government service
                      </div>
                    </div>

                    <div
                      className="p-3.5 rounded-xl border"
                      style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
                    >
                      <div className="text-[#7d8fca] mb-1">Applicant Reference</div>
                      <div className="font-semibold text-[#0f1729]">
                        Arjun Ramesh · GF-IN-2026-AR88219
                      </div>
                    </div>

                    <div
                      className="p-3.5 rounded-xl border"
                      style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
                    >
                      <div className="text-[#7d8fca] mb-1">Current Status</div>
                      <div className="font-bold text-emerald-700 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Recovery completed · Submitted</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions connecting to Requirement 7 & 8 */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => nav("applications")}
                      className="flex-1 py-4 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-95 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                      style={{ background: "linear-gradient(135deg, #1e2d5a, #263670)" }}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 2h10v12H3z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
                        <path d="M5 6h6M5 9h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      <span>View Application Status</span>
                    </button>

                    <button
                      onClick={() => nav("duplicate")}
                      className="px-5 py-4 rounded-2xl font-semibold text-xs border text-[#1e2d5a] hover:bg-slate-50 transition-all cursor-pointer"
                      style={{ borderColor: "#e0e5f4" }}
                    >
                      Try Submitting Again (Test Duplicate Prevention) →
                    </button>

                    <button
                      onClick={() => nav("dashboard")}
                      className="px-5 py-4 rounded-2xl font-semibold text-xs border text-[#7d8fca] hover:text-[#1e2d5a] hover:bg-slate-50 transition-all cursor-pointer"
                      style={{ borderColor: "#e0e5f4" }}
                    >
                      Dashboard
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
