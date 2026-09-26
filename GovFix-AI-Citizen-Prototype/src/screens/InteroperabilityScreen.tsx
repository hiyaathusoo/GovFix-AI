// src/screens/InteroperabilityScreen.tsx
// GovFix AI - Cross-Department ERP & Government Portal Interoperability Hub (Admin View)

import React, { useState, useEffect } from "react";
import type { Screen } from "../App";
import {
  type DepartmentSystem,
  type CrossDeptApplication,
  type InteropAuditEvent,
  type InteropScenario,
  getConnectedDepartments,
  getCrossDeptApplication,
  getInteropAuditEvents,
  getInteropScenario,
  getInteropSystemHealth,
  triggerInteropScenario,
  recoverInteropService,
  resetInteropDemo,
  subscribeInteropUpdates,
} from "../services/crossDepartmentErpService";

interface Props {
  nav: (screen: Screen) => void;
}

export default function InteroperabilityScreen({ nav }: Props) {
  const [departments, setDepartments] = useState<DepartmentSystem[]>(getConnectedDepartments());
  const [application, setApplication] = useState<CrossDeptApplication>(getCrossDeptApplication());
  const [auditEvents, setAuditEvents] = useState<InteropAuditEvent[]>(getInteropAuditEvents());
  const [scenario, setScenario] = useState<InteropScenario>(getInteropScenario());
  const [health, setHealth] = useState(getInteropSystemHealth());

  // UI States
  const [selectedDept, setSelectedDept] = useState<DepartmentSystem | null>(null);
  const [activeTab, setActiveTab] = useState<"departments" | "connectionMap" | "dataFlow" | "schemaMapping" | "auditTrail">("departments");
  const [selectedSchemaTab, setSelectedSchemaTab] = useState<"revenue" | "education" | "finance" | "identity">("revenue");
  const [packetStep, setPacketStep] = useState<number>(0);
  const [isPacketAnimating, setIsPacketAnimating] = useState<boolean>(false);

  useEffect(() => {
    const unsub = subscribeInteropUpdates(() => {
      setDepartments([...getConnectedDepartments()]);
      setApplication({ ...getCrossDeptApplication() });
      setAuditEvents([...getInteropAuditEvents()]);
      setScenario(getInteropScenario());
      setHealth(getInteropSystemHealth());
    });
    return () => unsub();
  }, []);

  // Animate transit packet through the pipeline (Section 13)
  const dispatchTestPacket = () => {
    if (isPacketAnimating) return;
    setIsPacketAnimating(true);
    setPacketStep(0);

    const steps = [1, 2, 3, 4, 5, 6, 7];
    steps.forEach((step, idx) => {
      setTimeout(() => {
        setPacketStep(step);
        if (step === 7) {
          setTimeout(() => setIsPacketAnimating(false), 800);
        }
      }, (idx + 1) * 700);
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f9ff] text-[#171B68] font-[DM_Sans,system-ui,sans-serif]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e2e8f5] shadow-xs px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-md text-white shrink-0"
              style={{ background: "linear-gradient(135deg, #174DE5, #6A16B8)" }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="7" cy="8" r="1.5" fill="currentColor" />
                <circle cx="12" cy="8" r="1.5" fill="currentColor" />
                <circle cx="17" cy="8" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#171B68]">
                  Cross-Department ERP & Portal Interoperability Hub
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF7A18]/15 text-[#FF7A18] border border-[#FF7A18]/30">
                  DEMO DATA
                </span>
              </div>
              <p className="text-xs text-[#7d8fca] mt-0.5">
                GovFix AI Orchestration Layer · Connecting Independent Department ERPs & Citizen Portals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => nav("health")}
              className="px-3.5 py-2 rounded-xl border border-[#e2e8f5] bg-[#f7f9ff] text-xs font-bold text-[#174DE5] hover:bg-white hover:border-[#174DE5] transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>● Service Health</span>
            </button>
            <button
              onClick={() => nav("admin")}
              className="px-3.5 py-2 rounded-xl border border-[#e2e8f5] bg-white text-xs font-bold text-[#171B68] hover:bg-slate-50 transition-all cursor-pointer"
            >
              ← Admin Overview
            </button>
            <button
              onClick={() => nav("login")}
              className="px-3.5 py-2 rounded-xl border border-[#e2e8f5] bg-white text-xs font-bold text-[#7d8fca] hover:text-[#171B68] hover:bg-slate-50 transition-all cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Core Value Banner: Without GovFix vs With GovFix (Section 28, 29) */}
        <section
          className="rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          style={{ background: "linear-gradient(135deg, #171B68 0%, #174DE5 100%)" }}
        >
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                ARCHITECTURE HIGHLIGHT
              </span>
              <span className="text-xs font-bold text-white/80">
                Interoperability Layer — Not an ERP Replacement
              </span>
            </div>
            <h2 className="text-xl font-black text-white">
              Unified Government Orchestration without Replacing Existing ERPs
            </h2>
            <p className="text-xs text-white/80 leading-relaxed">
              Each department keeps its own internal ERP, database, schema, and internal workflow.
              GovFix acts as the intelligent bridge: transforming incompatible formats, enforcing citizen consent,
              preventing duplicate requests, and delivering a single unified citizen experience.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0 text-xs">
            <div className="p-3.5 rounded-2xl bg-white/10 border border-white/15">
              <div className="font-bold text-rose-300 text-[11px] uppercase">Without GovFix</div>
              <p className="text-[10px] text-white/80 mt-1 leading-snug">
                Citizen manually visits 4 portals, prints forms, queues at offices, and manually tracks 4 disparate application IDs.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/15 border border-white/25">
              <div className="font-bold text-emerald-300 text-[11px] uppercase">With GovFix</div>
              <p className="text-[10px] text-white leading-snug">
                One unified application <span className="font-mono text-emerald-200">GOV-2026-1042</span> orchestrated across all 4 department ERPs automatically.
              </p>
            </div>
          </div>
        </section>

        {/* Demo Simulation Controls (Section 20) */}
        <div className="rounded-3xl p-5 bg-white border border-[#e2e8f5] shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#174DE5]">
                  Cross-Department Chaos & Failure Simulation
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#171B68] text-white">
                  State: {scenario}
                </span>
              </div>
              <p className="text-xs text-[#7d8fca] mt-0.5">
                Simulate realistic departmental downtime to demonstrate GovFix workflow preservation, state lock, and controlled retry
              </p>
            </div>

            {scenario !== "NORMAL" && (
              <button
                onClick={() => recoverInteropService()}
                className="self-start lg:self-auto px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-95 active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #174DE5, #6A16B8)" }}
              >
                <span>↻ Recover All Services</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => triggerInteropScenario("NORMAL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                scenario === "NORMAL"
                  ? "bg-[#171B68] text-white shadow-xs"
                  : "bg-[#f7f9ff] text-[#171B68] border border-[#e2e8f5] hover:bg-slate-100"
              }`}
            >
              ✓ Normal System
            </button>
            <button
              onClick={() => triggerInteropScenario("SIMULATE_EDUCATION_FAILURE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                scenario === "SIMULATE_EDUCATION_FAILURE"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "bg-[#f7f9ff] text-rose-800 border border-[#e2e8f5] hover:bg-rose-50"
              }`}
            >
              ⚡ Simulate Education ERP Failure (Down)
            </button>
            <button
              onClick={() => triggerInteropScenario("SIMULATE_REVENUE_TIMEOUT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                scenario === "SIMULATE_REVENUE_TIMEOUT"
                  ? "bg-[#FF7A18] text-white shadow-xs"
                  : "bg-[#f7f9ff] text-[#FF7A18] border border-[#e2e8f5] hover:bg-orange-50"
              }`}
            >
              ⚠ Simulate Revenue ERP Timeout (504)
            </button>
            <button
              onClick={() => triggerInteropScenario("SIMULATE_FINANCE_FAILURE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                scenario === "SIMULATE_FINANCE_FAILURE"
                  ? "bg-purple-700 text-white shadow-xs"
                  : "bg-[#f7f9ff] text-[#6A16B8] border border-[#e2e8f5] hover:bg-purple-50"
              }`}
            >
              ✕ Simulate Finance API Failure (500)
            </button>
            <button
              onClick={() => resetInteropDemo()}
              className="ml-auto px-3 py-1.5 rounded-xl text-xs font-semibold text-[#7d8fca] hover:text-[#171B68] hover:bg-slate-100 transition-all cursor-pointer"
            >
              Reset Demo State
            </button>
          </div>
        </div>

        {/* System Health Top-Level Metrics (Section 12) */}
        <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Connected ERPs</div>
            <div className="text-2xl font-black text-[#171B68] mt-1">{health.connectedErps}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">Independent Depts</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Connected Portals</div>
            <div className="text-2xl font-black text-[#171B68] mt-1">{health.connectedPortals}</div>
            <div className="text-[10px] text-[#7d8fca]">Citizen-facing</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Active APIs</div>
            <div className="text-2xl font-black text-[#174DE5] mt-1">{health.activeApis}</div>
            <div className="text-[10px] text-[#7d8fca]">REST / SOAP / Kafka</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Healthy Services</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{health.healthyServices}</div>
            <div className="text-[10px] text-[#7d8fca]">SLA compliant</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Degraded Services</div>
            <div className="text-2xl font-black text-[#FF7A18] mt-1">{health.degradedServices}</div>
            <div className="text-[10px] text-[#7d8fca]">Latency buffered</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Offline Services</div>
            <div className="text-2xl font-black text-rose-600 mt-1">{health.offlineServices}</div>
            <div className="text-[10px] text-[#7d8fca]">State preserved</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Active Workflows</div>
            <div className="text-2xl font-black text-[#6A16B8] mt-1">{health.activeWorkflows}</div>
            <div className="text-[10px] text-emerald-600 font-semibold">Zero data loss</div>
          </div>
        </section>

        {/* View Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#e2e8f5] pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab("departments")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "departments"
                ? "bg-[#171B68] text-white shadow-xs"
                : "bg-white text-[#7d8fca] hover:text-[#171B68] border border-[#e2e8f5]"
            }`}
          >
            🏢 Connected Departments (Section 10)
          </button>
          <button
            onClick={() => setActiveTab("connectionMap")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "connectionMap"
                ? "bg-[#171B68] text-white shadow-xs"
                : "bg-white text-[#7d8fca] hover:text-[#171B68] border border-[#e2e8f5]"
            }`}
          >
            🗺️ Interactive ERP Connection Map (Section 11)
          </button>
          <button
            onClick={() => setActiveTab("dataFlow")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "dataFlow"
                ? "bg-[#171B68] text-white shadow-xs"
                : "bg-white text-[#7d8fca] hover:text-[#171B68] border border-[#e2e8f5]"
            }`}
          >
            📡 Live Data Flow Monitor (Section 13)
          </button>
          <button
            onClick={() => setActiveTab("schemaMapping")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "schemaMapping"
                ? "bg-[#171B68] text-white shadow-xs"
                : "bg-white text-[#7d8fca] hover:text-[#171B68] border border-[#e2e8f5]"
            }`}
          >
            🔄 Common Data Model & Schema Translation (Section 8)
          </button>
          <button
            onClick={() => setActiveTab("auditTrail")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "auditTrail"
                ? "bg-[#171B68] text-white shadow-xs"
                : "bg-white text-[#7d8fca] hover:text-[#171B68] border border-[#e2e8f5]"
            }`}
          >
            📜 Technical Audit Trail ({auditEvents.length})
          </button>
        </div>

        {/* TAB 1: CONNECTED DEPARTMENTS TABLE (Section 10) */}
        {activeTab === "departments" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#171B68]">Connected Government Departments</h2>
                <p className="text-xs text-[#7d8fca]">
                  Overview of independent departmental portals, internal ERP backends, and GovFix interoperability status
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-[#e2e8f5] overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f7f9ff] border-b border-[#e2e8f5] text-[#7d8fca] font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-6">Department</th>
                    <th className="py-3.5 px-4">Citizen Portal</th>
                    <th className="py-3.5 px-4">Departmental ERP</th>
                    <th className="py-3.5 px-4">Protocol & Auth</th>
                    <th className="py-3.5 px-4">Gateway Status</th>
                    <th className="py-3.5 px-4">Latency</th>
                    <th className="py-3.5 px-6 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {departments.map((dept) => (
                    <tr
                      key={dept.id}
                      onClick={() => setSelectedDept(dept)}
                      className="hover:bg-[#f7f9ff]/60 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-6 font-bold text-[#171B68] group-hover:text-[#174DE5]">
                        <div>{dept.name}</div>
                        <div className="text-[#7d8fca] text-[10px] font-mono mt-0.5">{dept.code}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">{dept.portalName}</div>
                        <div className="text-[#7d8fca] text-[10px] font-mono truncate max-w-[180px]">
                          {dept.portalUrl}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#171B68]">{dept.erpName}</div>
                        <div className="text-[#7d8fca] text-[10px] font-mono truncate max-w-[180px]">
                          {dept.erpEndpoint}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-mono font-bold text-slate-700">{dept.protocol}</div>
                        <div className="text-[10px] text-[#7d8fca]">{dept.authMode}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-bold px-2.5 py-1 rounded-full text-xs inline-flex items-center gap-1.5 ${
                            dept.status === "HEALTHY"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : dept.status === "DEGRADED"
                              ? "bg-[#FF7A18]/15 text-[#FF7A18] border border-[#FF7A18]/30"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              dept.status === "HEALTHY"
                                ? "bg-emerald-500"
                                : dept.status === "DEGRADED"
                                ? "bg-[#FF7A18]"
                                : "bg-rose-600"
                            }`}
                          ></span>
                          <span>● {dept.status}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-sm text-[#171B68]">
                        {dept.latencyMs} ms
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDept(dept);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-[#e2e8f5] bg-[#f7f9ff] text-xs font-bold text-[#171B68] hover:border-[#174DE5] hover:text-[#174DE5] cursor-pointer"
                        >
                          Inspect ERP →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 2: INTERACTIVE ERP CONNECTION MAP (Section 11) */}
        {activeTab === "connectionMap" && (
          <section className="bg-white rounded-3xl border border-[#e2e8f5] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-bold text-[#171B68]">Interactive ERP Architecture & Connection Map</h2>
                <p className="text-xs text-[#7d8fca]">
                  Click any connection link or department node to inspect authentication, data mapping, and sync status
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                ✓ 4 Departments Online
              </span>
            </div>

            {/* Architecture Visual Map */}
            <div className="p-8 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] overflow-x-auto">
              <div className="min-w-[800px] flex flex-col items-center gap-8 py-4">
                {/* Level 1: Citizen-Facing Portals */}
                <div className="grid grid-cols-4 gap-4 w-full">
                  {departments.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDept(d)}
                      className="p-3.5 rounded-2xl bg-white border border-[#e2e8f5] shadow-xs text-center cursor-pointer hover:border-[#174DE5] transition-all"
                    >
                      <div className="text-[10px] uppercase font-bold text-[#7d8fca]">Citizen Portal</div>
                      <div className="text-xs font-extrabold text-[#171B68] mt-0.5">{d.portalName}</div>
                      <div className="text-[10px] text-emerald-600 font-bold mt-1">● Online</div>
                    </div>
                  ))}
                </div>

                {/* Connecting Fan-Down Line */}
                <div className="w-full h-0.5 bg-[#e2e8f5] relative">
                  <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-[#174DE5]"></div>
                </div>

                {/* Level 2: GovFix Interoperability Layer */}
                <div
                  className="px-8 py-5 rounded-3xl text-white shadow-lg text-center max-w-lg w-full relative overflow-hidden"
                  style={{ background: "linear-gradient(135deg, #171B68 0%, #174DE5 100%)" }}
                >
                  <div className="text-[10px] uppercase tracking-wider font-bold text-amber-300">
                    CENTRAL RESILIENCE & ORCHESTRATION LAYER
                  </div>
                  <div className="text-lg font-black mt-0.5">GovFix AI Interoperability Gateway</div>
                  <div className="text-xs text-white/80 mt-1">
                    API Gateway · Schema Mapping · Common Data Model · Event Bus
                  </div>
                  <div className="flex justify-center gap-3 mt-3 text-[11px] font-semibold text-emerald-300">
                    <span>✓ Mutual TLS 1.3</span>
                    <span>·</span>
                    <span>✓ Token Masking</span>
                    <span>·</span>
                    <span>✓ State Buffer</span>
                  </div>
                </div>

                {/* Connecting Fan-Out Line */}
                <div className="w-full h-0.5 bg-[#e2e8f5] relative">
                  <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-[#174DE5]"></div>
                </div>

                {/* Level 3: Departmental ERP Systems */}
                <div className="grid grid-cols-4 gap-4 w-full">
                  {departments.map((d) => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDept(d)}
                      className={`p-4 rounded-2xl bg-white border shadow-md text-center cursor-pointer hover:border-[#174DE5] transition-all ${
                        d.status === "DOWN"
                          ? "border-rose-400 bg-rose-50/60 ring-2 ring-rose-300 animate-pulse"
                          : d.status === "DEGRADED"
                          ? "border-amber-400 bg-amber-50/50"
                          : "border-[#e2e8f5]"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-bold text-[#7d8fca]">System of Record</div>
                      <div className="text-xs font-black text-[#171B68] mt-0.5">{d.erpName}</div>
                      <div className="mt-2">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                            d.status === "HEALTHY"
                              ? "bg-emerald-50 text-emerald-700"
                              : d.status === "DEGRADED"
                              ? "bg-[#FF7A18]/15 text-[#FF7A18]"
                              : "bg-rose-50 text-rose-700"
                          }`}
                        >
                          ● {d.status}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono text-[#7d8fca] mt-2">
                        {d.protocol} · {d.latencyMs}ms
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: LIVE DATA FLOW MONITOR (Section 13) */}
        {activeTab === "dataFlow" && (
          <section className="bg-white rounded-3xl border border-[#e2e8f5] p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-[#171B68]">Live Cross-Department Data Flow Monitor</h2>
                <p className="text-xs text-[#7d8fca]">
                  Observe simulated data packets traveling across portals, GovFix gateway, and departmental ERPs
                </p>
              </div>
              <button
                onClick={dispatchTestPacket}
                disabled={isPacketAnimating}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #174DE5, #6A16B8)" }}
              >
                {isPacketAnimating ? "⏳ Packet in Transit..." : "▶ Dispatch Test Data Packet"}
              </button>
            </div>

            {/* Packet Status Legend */}
            <div className="flex flex-wrap items-center gap-4 text-xs p-3 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5]">
              <span className="font-bold text-[#171B68]">Color Legend:</span>
              <span className="flex items-center gap-1.5 text-blue-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span> Blue = Data in Transit
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Green = Successful Hop
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Amber = Delayed / Queued
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> Red = Failed / Circuit Broken
              </span>
            </div>

            {/* Flow Path Visualization */}
            <div className="space-y-4">
              {[
                { step: 1, label: "1. Citizen Submission", sys: "Citizen Services Portal", note: "Citizen submits scholarship request with verified mobile token." },
                { step: 2, label: "2. GovFix API Gateway", sys: "GovFix Resilience Layer", note: "Validates schema, checks idempotency key, prevents duplicate submissions." },
                { step: 3, label: "3. Identity Verification", sys: "Citizen Services ERP (UIDAI)", note: "Mutual TLS e-KYC authentication. Masks 12-digit Aadhaar." },
                { step: 4, label: "4. Revenue & Income Cross-Check", sys: "Revenue Department ERP", note: "Translates SOAP XML response to CDM. Income ₹2,50,000 verified." },
                { step: 5, label: "5. Department Review", sys: "Education Department ERP", note: "Officer Priya Mehta verifies student academic percentile (96.4%)." },
                { step: 6, label: "6. Benefit Disbursement", sys: "Finance Department ERP (PFMS)", note: "Executes Direct Benefit Transfer of ₹25,000 via Kafka event." },
                { step: 7, label: "7. Unified Citizen Result", sys: "GovFix Citizen Interface", note: "Citizen dashboard updated instantly with UTR disbursement reference." },
              ].map((item) => {
                const isCurrent = packetStep === item.step;
                const isDone = packetStep > item.step;
                return (
                  <div
                    key={item.step}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                      isCurrent
                        ? "bg-blue-50 border-blue-400 ring-2 ring-blue-300 shadow-sm"
                        : isDone
                        ? "bg-emerald-50/40 border-emerald-200"
                        : "bg-[#f7f9ff] border-[#e2e8f5]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                          isCurrent
                            ? "bg-blue-600 text-white animate-bounce"
                            : isDone
                            ? "bg-emerald-600 text-white"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isDone ? "✓" : item.step}
                      </div>
                      <div>
                        <div className="font-extrabold text-xs text-[#171B68]">{item.label}</div>
                        <div className="text-[#174DE5] font-semibold text-[11px]">{item.sys}</div>
                        <p className="text-[#7d8fca] text-[11px] mt-0.5">{item.note}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isCurrent
                          ? "bg-blue-600 text-white animate-pulse"
                          : isDone
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {isCurrent ? "IN TRANSIT" : isDone ? "COMPLETED" : "WAITING"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* TAB 4: COMMON DATA MODEL & SCHEMA TRANSLATION (Section 8) */}
        {activeTab === "schemaMapping" && (
          <section className="bg-white rounded-3xl border border-[#e2e8f5] p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#171B68]">GovFix Common Data Model & Schema Transformation</h2>
              <p className="text-xs text-[#7d8fca]">
                Demonstrates how incompatible departmental ERP data schemas are translated into a standardized GovFix structure
              </p>
            </div>

            {/* Architecture Flow Banner */}
            <div className="p-4 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] flex items-center justify-between text-xs font-bold text-[#171B68] overflow-x-auto gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-white border border-[#e2e8f5]">Department ERP Data</span>
              <span>→</span>
              <span className="px-3 py-1.5 rounded-xl bg-white border border-[#e2e8f5]">GovFix Connector</span>
              <span>→</span>
              <span className="px-3 py-1.5 rounded-xl bg-white border border-[#e2e8f5]">Schema Mapping</span>
              <span>→</span>
              <span className="px-3 py-1.5 rounded-xl bg-[#174DE5] text-white shadow-xs">Common Data Model (CDM)</span>
              <span>→</span>
              <span className="px-3 py-1.5 rounded-xl bg-white border border-[#e2e8f5]">Next Department</span>
            </div>

            {/* Sub-Tabs for Different Department Schemas */}
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <button
                onClick={() => setSelectedSchemaTab("revenue")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSchemaTab === "revenue"
                    ? "bg-[#171B68] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Revenue ERP (SOAP XML Format)
              </button>
              <button
                onClick={() => setSelectedSchemaTab("education")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSchemaTab === "education"
                    ? "bg-[#171B68] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Education ERP (Student REST)
              </button>
              <button
                onClick={() => setSelectedSchemaTab("finance")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSchemaTab === "finance"
                    ? "bg-[#171B68] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Finance ERP (PFMS DBT Kafka)
              </button>
              <button
                onClick={() => setSelectedSchemaTab("identity")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSchemaTab === "identity"
                    ? "bg-[#171B68] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                Citizen Services (UIDAI e-KYC)
              </button>
            </div>

            {/* Side-by-Side Code Viewer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-xs font-mono">
              {/* Left Column: Raw Department Payload */}
              <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-amber-300 font-bold border-b border-slate-800 pb-2">
                  <span>RAW INCOMING ERP PAYLOAD</span>
                  <span>{selectedSchemaTab.toUpperCase()} ERP</span>
                </div>
                <pre className="overflow-x-auto text-[11px] leading-relaxed text-emerald-300">
                  {selectedSchemaTab === "revenue" &&
                    JSON.stringify(application.rawPayloads.revenue, null, 2)}
                  {selectedSchemaTab === "education" &&
                    JSON.stringify(application.rawPayloads.education, null, 2)}
                  {selectedSchemaTab === "finance" &&
                    JSON.stringify(application.rawPayloads.finance, null, 2)}
                  {selectedSchemaTab === "identity" &&
                    JSON.stringify(application.rawPayloads.identity, null, 2)}
                </pre>
              </div>

              {/* Right Column: GovFix Common Data Model */}
              <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-2 border border-[#174DE5]/40 shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-[#FFB070] font-bold border-b border-slate-800 pb-2">
                  <span>GOVFIX COMMON DATA MODEL (CDM)</span>
                  <span className="text-emerald-400 font-sans">✓ Standardized</span>
                </div>
                <pre className="overflow-x-auto text-[11px] leading-relaxed text-blue-300">
                  {JSON.stringify(application.commonData, null, 2)}
                </pre>
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: TECHNICAL AUDIT TRAIL (Section 25) */}
        {activeTab === "auditTrail" && (
          <section className="bg-white rounded-3xl border border-[#e2e8f5] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#171B68]">Cross-Department Technical Audit Trail</h2>
                <p className="text-xs text-[#7d8fca]">
                  Complete chronological trace of inter-departmental messages, verification queries, and approval events
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {auditEvents.map((evt) => (
                <div key={evt.id} className="py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#171B68]">{evt.timeDisplay}</span>
                      <span className="font-bold text-slate-700">· {evt.event}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          evt.status === "SUCCESS"
                            ? "bg-emerald-50 text-emerald-700"
                            : evt.status === "FAILED"
                            ? "bg-rose-50 text-rose-700"
                            : "bg-amber-50 text-amber-800"
                        }`}
                      >
                        {evt.status}
                      </span>
                    </div>
                    <div className="text-slate-600 leading-relaxed">{evt.payloadSummary}</div>
                  </div>

                  <div className="text-right text-[11px] text-[#7d8fca] shrink-0 font-mono">
                    <div>From: {evt.source}</div>
                    <div>To: {evt.destination}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Department Inspection Modal / Drawer (Section 11) */}
      {selectedDept && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-[#e2e8f5] space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#174DE5]">
                  Connected System Details · {selectedDept.code}
                </span>
                <h3 className="text-xl font-extrabold text-[#171B68] mt-0.5">
                  {selectedDept.erpName}
                </h3>
                <p className="text-xs text-[#7d8fca]">{selectedDept.name}</p>
              </div>
              <button
                onClick={() => setSelectedDept(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-[#7d8fca]">API Endpoint:</span>
                  <span className="text-[#171B68] font-bold truncate max-w-[280px]">
                    {selectedDept.erpEndpoint}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7d8fca]">Communication Protocol:</span>
                  <span className="text-[#171B68] font-bold">{selectedDept.protocol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7d8fca]">Authentication Scheme:</span>
                  <span className="text-[#174DE5] font-bold">{selectedDept.authMode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7d8fca]">Average Latency:</span>
                  <span className="text-emerald-700 font-bold">{selectedDept.latencyMs} ms</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7d8fca]">Throughput:</span>
                  <span className="text-[#171B68]">{selectedDept.requestsPerMin} req / min</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[#171B68] mb-1.5">Departmental Functions & Scopes</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDept.functions.map((fn, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-medium"
                    >
                      ✓ {fn}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedDept(null)}
              className="w-full py-2.5 rounded-xl bg-[#171B68] text-white font-bold text-xs hover:bg-[#171B68]/90 transition-all cursor-pointer"
            >
              Close Connection Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
