import type { Screen } from "../App";

interface Props {
  nav: (s: Screen) => void;
}

export default function ErrorScreen({ nav }: Props) {
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
            <div className="text-amber-400/90 text-[11px] font-medium">Citizen Protection</div>
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
              Active Session
            </div>
            <div className="text-white text-xs font-bold">Arjun Ramesh</div>
            <div className="font-mono text-amber-400 text-xs mt-1">GF-IN-2026-AR88219</div>
            <div className="text-emerald-400 text-[10px] mt-1.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Application Safely Saved
            </div>
          </div>
        </div>
      </aside>

      {/* Main error card */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 overflow-auto">
        <div className="w-full max-w-2xl">
          <div
            className="rounded-3xl overflow-hidden bg-white border border-slate-200"
            style={{ boxShadow: "0 16px 48px rgba(15, 23, 41, 0.12)" }}
          >
            {/* Header banner */}
            <div
              className="px-8 py-6 text-white"
              style={{
                background: "linear-gradient(135deg, #1e2d5a 0%, #263670 100%)",
                borderBottom: "3px solid #f59e0b",
              }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(245, 158, 11, 0.2)", border: "1px solid rgba(245, 158, 11, 0.4)" }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="#fbbf24" strokeWidth="2" />
                    <line x1="12" y1="8" x2="12" y2="12" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="1.25" fill="#fbbf24" />
                  </svg>
                </div>
                <div>
                  <div className="text-amber-300 text-xs font-bold tracking-wider uppercase mb-1">
                    Service Notice
                  </div>
                  <h1 className="text-white text-2xl font-bold tracking-tight">
                    The selected government service is temporarily unavailable.
                  </h1>
                </div>
              </div>
            </div>

            {/* Reassuring Citizen Body */}
            <div className="p-8 space-y-6">
              {/* Primary Citizen Assurance */}
              <div
                className="rounded-2xl p-5 border"
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
                      “Your application has been safely saved.”
                    </h2>
                    <p className="text-emerald-800 text-sm leading-relaxed">
                      GovFix intercepted the disruption so you do not have to worry. All your
                      verified details and form inputs have been safely saved.
                      <span className="block font-bold mt-1.5 text-emerald-900">
                        “You don't need to submit again.”
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirement Specified Checkmarks */}
              <div
                className="rounded-2xl p-5 border"
                style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
              >
                <div className="text-[#0f1729] font-bold text-xs uppercase tracking-wider mb-3">
                  Application Status
                </div>
                <div className="space-y-3">
                  {[
                    { text: "Application state preserved", desc: "Verified details and inputs safely retained" },
                    { text: "Transaction created", desc: "Reference ticket established for automated recovery" },
                    { text: "You don't need to submit again", desc: "GovFix will complete the submission as soon as the service recovers" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                        ✓
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#162040]">✓ {item.text}</div>
                        <div className="text-xs text-[#7d8fca]">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction ID & Status Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  className="p-4 rounded-2xl border"
                  style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
                >
                  <div className="text-[#7d8fca] text-xs font-semibold mb-1">Application ID</div>
                  <div className="font-mono text-base font-bold text-[#0f1729]">GF-2026-10482</div>
                  <div className="text-[11px] text-[#4a5fa8] mt-1">
                    Selected government service
                  </div>
                </div>

                <div
                  className="p-4 rounded-2xl border"
                  style={{ background: "#fffbeb", borderColor: "#fde68a" }}
                >
                  <div className="text-amber-800 text-xs font-semibold mb-1">Status</div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                    <span className="font-bold text-amber-900 text-base">Recovery in Progress</span>
                  </div>
                  <div className="text-[11px] text-amber-700 mt-1">
                    GovFix monitoring for portal recovery
                  </div>
                </div>
              </div>

              {/* Action Button: View Status */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => nav("recovery")}
                  className="flex-1 py-4 rounded-2xl text-white font-bold text-sm transition-all hover:opacity-95 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  style={{ background: "linear-gradient(135deg, #1e2d5a, #263670)" }}
                >
                  <span>View Status</span>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3.5 8h9M8.5 4l4 4-4 4"
                      stroke="white"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <button
                  onClick={() => nav("dashboard")}
                  className="px-6 py-4 rounded-2xl font-semibold text-xs border text-[#7d8fca] hover:text-[#1e2d5a] hover:bg-slate-50 transition-all cursor-pointer"
                  style={{ borderColor: "#e0e5f4" }}
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-[#7d8fca] mt-6 leading-relaxed">
            GovFix AI operates continuously in the background to ensure technical portal downtime
            does not interrupt your citizen journey.
          </p>
        </div>
      </main>
    </div>
  );
}
