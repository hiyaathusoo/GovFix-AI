// src/screens/AdminScreen.tsx
// GovFix AI - Administrator Operations Dashboard

import type { Screen } from "../App";
import {
  getMonitoredServices,
  getActiveIncidents,
  calculateHealthScore,
} from "../services/healthMonitoringService";

interface Props {
  nav: (screen: Screen) => void;
}

export default function AdminScreen({ nav }: Props) {
  const services = getMonitoredServices();
  const incidents = getActiveIncidents();
  const scoreData = calculateHealthScore();

  const metrics = [
    ["Connected Services", "24", "7 deep monitored"],
    ["Healthy Services", `${scoreData.details.healthyServices}`, "Meeting target SLA"],
    ["Active Workflows", "148", "Zero data loss"],
    ["AI Recoveries", "31", "Automated re-check"],
    ["SLA Compliance", "99.2%", "Within 99.0% threshold"],
    ["Average API Response", "640 ms", "P50 latency at 395ms"],
  ];

  return (
    <div className="min-h-screen bg-[#f7f9ff] p-6 text-[#171B68] lg:p-10 font-[DM_Sans,system-ui,sans-serif]">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-[#174DE5]">
              GovFix Operations · DEMO DATA
            </div>
            <h1 className="mt-1 text-2xl font-extrabold text-[#171B68]">Administrator Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => nav("interop")}
              className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #171B68, #174DE5)" }}
            >
              <span>🌐 Cross-Department Interoperability Hub</span>
              <span>→</span>
            </button>
            <button
              onClick={() => nav("health")}
              className="rounded-xl px-4 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 transition-all cursor-pointer flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #6A16B8, #C21878)" }}
            >
              <span>● Health Monitoring Hub</span>
              <span>→</span>
            </button>
            <button
              onClick={() => nav("mock-portal")}
              className="rounded-xl border border-[#e2e8f5] bg-white px-3 py-2 text-xs font-bold text-[#171B68] hover:bg-slate-50 cursor-pointer"
            >
              🔑 Citizen Key Portals
            </button>
            <button
              onClick={() => nav("citizen")}
              className="rounded-xl border border-[#e2e8f5] bg-white px-4 py-2 text-xs font-bold text-[#171B68] hover:bg-slate-50 cursor-pointer"
            >
              ← Citizen
            </button>
            <button
              onClick={() => nav("login")}
              className="rounded-xl border border-[#e2e8f5] bg-white px-4 py-2 text-xs font-bold text-[#7d8fca] hover:text-[#171B68] hover:bg-slate-50 cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </header>

        {/* Feature Banners Grid */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Banner 1: Cross-Department ERP Interoperability */}
          <section
            className="rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between gap-5"
            style={{ background: "linear-gradient(135deg, #171B68 0%, #174DE5 100%)" }}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-white text-[#171B68]">
                  CORE ECOSYSTEM
                </span>
                <span className="text-xs font-bold text-white/80">
                  GovFix Common Data Model & Orchestration
                </span>
              </div>
              <h2 className="text-xl font-black text-white">
                Cross-Department ERP & Portal Interoperability Hub
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                Seamlessly connects 4 independent department ERPs (Education, Revenue, Finance, Citizen Services)
                via real-time schema translation, event-driven async messaging, animated data packets, and multi-department audit logs.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/15">
              <div className="text-xs text-white/90">
                <span className="font-extrabold text-white text-base">4</span> Connected ERPs · <span className="font-extrabold text-white text-base">42</span> Live Workflows
              </div>
              <button
                onClick={() => nav("interop")}
                className="px-4 py-2 rounded-xl bg-white text-[#171B68] text-xs font-extrabold shadow-sm hover:bg-slate-100 transition-all cursor-pointer"
              >
                Launch Interop Hub →
              </button>
            </div>
          </section>

          {/* Banner 2: Dedicated Service Health Monitoring */}
          <section
            className="rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between gap-5"
            style={{ background: "linear-gradient(135deg, #6A16B8 0%, #C21878 100%)" }}
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                  HEALTH RADAR
                </span>
                <span className="text-xs font-bold text-white/80">
                  Authorized Health Signal Synthesis
                </span>
              </div>
              <h2 className="text-xl font-black text-white">
                Government Website Health & AI Diagnostics
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                24 monitored government services and APIs with deep component inspection, dependency graph tracing,
                anomaly detection, and automated AI recovery verification.
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/15">
              <div className="text-xs text-white/90">
                Score: <span className="font-extrabold text-white text-base">{scoreData.overallScore}</span>/100 · <span className="font-extrabold text-white text-base">{incidents.filter((i) => i.status !== "RECOVERED").length}</span> incidents
              </div>
              <button
                onClick={() => nav("health")}
                className="px-4 py-2 rounded-xl bg-white text-[#6A16B8] text-xs font-extrabold shadow-sm hover:bg-slate-100 transition-all cursor-pointer"
              >
                Launch Health Hub →
              </button>
            </div>
          </section>
        </div>

        {/* Top Operational Metrics */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map(([label, value, sub]) => (
            <div key={label} className="rounded-2xl border border-[#e2e8f5] bg-white p-5 shadow-2xs">
              <div className="text-2xl font-black text-[#171B68]">{value}</div>
              <div className="mt-1 text-xs font-bold text-[#7d8fca]">{label}</div>
              <div className="text-[10px] text-emerald-600 mt-0.5 font-medium">{sub}</div>
            </div>
          ))}
        </section>

        {/* Quick Monitored Services Preview */}
        <section className="rounded-3xl border border-[#e2e8f5] bg-white p-6 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-[#171B68]">Active Core Endpoints</h2>
              <p className="text-xs text-[#7d8fca]">Real-time latency and status signals</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => nav("health")}
                className="rounded-xl border border-[#e2e8f5] bg-[#f7f9ff] px-3 py-1.5 text-xs font-bold text-[#174DE5] hover:bg-white cursor-pointer"
              >
                View Full Table & Dependencies →
              </button>
              <button
                onClick={() => nav("officer")}
                className="rounded-xl bg-[#171B68] px-3.5 py-1.5 text-xs font-bold text-white cursor-pointer hover:bg-[#171B68]/90"
              >
                Open Officer Portal
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {services.slice(0, 5).map((service) => (
              <div
                key={service.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3.5 text-xs hover:bg-[#f7f9ff]/50 px-2 rounded-xl transition-colors cursor-pointer"
                onClick={() => nav("health")}
              >
                <div>
                  <span className="font-bold text-[#171B68] text-sm">{service.name}</span>
                  <span className="text-[#7d8fca] ml-2 text-[11px]">({service.department})</span>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                      service.status === "HEALTHY"
                        ? "bg-emerald-50 text-emerald-700"
                        : service.status === "DEGRADED"
                        ? "bg-[#FF7A18]/15 text-[#FF7A18]"
                        : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    ● {service.status}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#174DE5]">
                    {service.latency} ms
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Demo Mode Reassurance Controls Card */}
        <section className="rounded-3xl border border-[#FF7A18]/30 bg-[#FF7A18]/5 p-6 space-y-2">
          <h2 className="font-bold text-amber-950 text-base">Demo Simulation & Chaos Testing Mode</h2>
          <p className="text-xs text-amber-900 leading-relaxed max-w-2xl">
            Simulate realistic incidents (high latency spikes, 504 gateway timeouts, 500 internal server errors, ERP crashes, or cascading dependency faults) and watch GovFix detect, analyze, isolate, and recover automatically.
          </p>
          <div className="pt-2 flex items-center gap-2">
            <button
              onClick={() => nav("health")}
              className="rounded-xl bg-[#FF7A18] text-white px-4 py-2 text-xs font-bold hover:bg-[#FF7A18]/90 transition-all cursor-pointer shadow-xs"
            >
              Open Health Simulation Controls →
            </button>
            <button
              onClick={() => nav("dashboard")}
              className="rounded-xl border border-[#e2e8f5] bg-white text-[#171B68] px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
            >
              Open Citizen Service Catalog
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
