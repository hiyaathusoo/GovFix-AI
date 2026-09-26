import type { Screen } from "../App";

interface Props {
  nav: (s: Screen) => void;
}

export default function DuplicateScreen({ nav }: Props) {
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
            <div className="text-amber-400/90 text-[11px] font-medium">Duplicate Guard</div>
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
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white bg-white/10 text-sm font-semibold text-left transition-all cursor-pointer"
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
              Protected Citizen
            </div>
            <div className="text-white text-xs font-bold">Arjun Ramesh</div>
            <div className="font-mono text-amber-400 text-xs mt-1">GF-IN-2026-AR88219</div>
            <div className="text-[#7d8fca] text-[10px] mt-1.5 leading-snug">
              Secure reference identifier
            </div>
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
            {/* Header */}
            <div
              className="px-8 py-6 text-white"
              style={{
                background: "linear-gradient(135deg, #b45309 0%, #d97706 100%)",
                borderBottom: "3px solid #f59e0b",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(255, 255, 255, 0.2)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 9v4M12 17h.01M5 19h14a2 2 0 001.73-3L13.73 4a2 2 0 00-3.46 0L3.27 16A2 2 0 005 19z"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <div>
                  <div className="text-amber-100 text-xs font-bold tracking-wider uppercase mb-1">
                    Application Protection
                  </div>
                  <h1 className="text-white text-2xl font-bold tracking-tight">
                    Duplicate submission prevented
                  </h1>
                </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8 space-y-6">
              {/* Citizen-Friendly Reassurance */}
              <div
                className="p-5 rounded-2xl border"
                style={{ background: "#fffbeb", borderColor: "#fde68a" }}
              >
                <div className="text-amber-950 font-bold text-lg mb-1">
                  “We found an existing application for this government service.”
                </div>
                <p className="text-amber-900 text-sm leading-relaxed">
                  “Your original application is safe. You don't need to submit again.”
                </p>
              </div>

              {/* Application Details Card */}
              <div
                className="p-5 rounded-2xl border"
                style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
              >
                <div className="text-[#0f1729] font-bold text-xs uppercase tracking-wider mb-4">
                  Existing Application on Record
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-[#7d8fca] text-xs font-semibold mb-1">Application ID</div>
                    <div className="font-mono text-base font-bold text-[#0f1729]">GF-2026-10482</div>
                    <div className="text-[11px] text-[#4a5fa8] mt-0.5">
                      Official government portal reference
                    </div>
                  </div>

                  <div>
                    <div className="text-[#7d8fca] text-xs font-semibold mb-1">Current Status</div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span>Submitted & Under Review</span>
                    </div>
                    <div className="text-[11px] text-[#4a5fa8] mt-1">
                      Active in government verification queue
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="text-[#7d8fca] text-xs font-semibold mb-1">Date & Time</div>
                    <div className="text-sm font-semibold text-[#0f1729]">
                      15 Sep 2026, 10:58 IST
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="text-[#7d8fca] text-xs font-semibold mb-1">Applicant Name</div>
                    <div className="text-sm font-semibold text-[#0f1729]">
                      Arjun Ramesh (GF-IN-2026-AR88219)
                    </div>
                  </div>
                </div>
              </div>

              {/* Citizen-facing explanation */}
              <div className="rounded-2xl p-4 bg-slate-50 border border-slate-200">
                <div className="text-[#162040] font-bold text-xs uppercase tracking-wider mb-2">
                  How Duplicate Prevention Helps Citizens
                </div>
                <div className="space-y-2 text-xs text-[#4a5fa8]">
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>
                      Prevents conflicting records that could cause government departments to reject your application.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>
                      Guarantees your position in the government service queue is not reset.
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>
                      Protects you from duplicate processing fees or unnecessary paperwork.
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
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
                  onClick={() => nav("dashboard")}
                  className="px-6 py-4 rounded-2xl font-semibold text-xs border text-[#7d8fca] hover:text-[#1e2d5a] hover:bg-slate-50 transition-all cursor-pointer"
                  style={{ borderColor: "#e0e5f4" }}
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
