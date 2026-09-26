// src/screens/ServiceHealthScreen.tsx
// GovFix AI - Dedicated Government Service Health Monitoring & AI Diagnostics Dashboard (Module 31)

import React, { useState, useEffect } from "react";
import type { Screen } from "../App";
import {
  type MonitoredService,
  type HealthIncident,
  type HealthState,
  type SimulationScenario,
  getMonitoredServices,
  getActiveIncidents,
  getLastUpdatedTime,
  getCurrentScenario,
  calculateHealthScore,
  triggerSimulation,
  acknowledgeIncident,
  triggerRecovery,
  resetMonitoring,
  subscribeHealthUpdates,
} from "../services/healthMonitoringService";

interface Props {
  nav: (screen: Screen) => void;
}

export default function ServiceHealthScreen({ nav }: Props) {
  const [services, setServices] = useState<MonitoredService[]>(getMonitoredServices());
  const [incidents, setIncidents] = useState<HealthIncident[]>(getActiveIncidents());
  const [lastUpdated, setLastUpdated] = useState<string>(getLastUpdatedTime());
  const [scenario, setScenario] = useState<SimulationScenario>(getCurrentScenario());
  const [scoreData, setScoreData] = useState(calculateHealthScore());

  // Modals & Drawers
  const [showScoreModal, setShowScoreModal] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<MonitoredService | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<HealthIncident | null>(null);
  const [errorCategoryFilter, setErrorCategoryFilter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "dependency" | "analytics" | "incidents">("overview");

  useEffect(() => {
    const unsubscribe = subscribeHealthUpdates(() => {
      setServices([...getMonitoredServices()]);
      setIncidents([...getActiveIncidents()]);
      setLastUpdated(getLastUpdatedTime());
      setScenario(getCurrentScenario());
      setScoreData(calculateHealthScore());
    });
    return () => unsubscribe();
  }, []);

  // Helper for Status Badge Rendering
  const renderStatusBadge = (status: HealthState, size: "sm" | "md" = "md") => {
    switch (status) {
      case "HEALTHY":
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${
              size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>● HEALTHY</span>
          </span>
        );
      case "DEGRADED":
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-[#FF7A18]/15 text-[#FF7A18] border border-[#FF7A18]/30 ${
              size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#FF7A18]"></span>
            <span>● DEGRADED</span>
          </span>
        );
      case "WARNING":
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-amber-50 text-amber-800 border border-amber-300 ${
              size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>● WARNING</span>
          </span>
        );
      case "DOWN":
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${
              size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            <span>● DOWN</span>
          </span>
        );
      case "RECOVERING":
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-bold rounded-full bg-[#174DE5]/10 text-[#174DE5] border border-[#174DE5]/25 ${
              size === "sm" ? "text-[11px] px-2 py-0.5" : "text-xs px-2.5 py-1"
            }`}
          >
            <span className="animate-spin text-sm">↻</span>
            <span>RECOVERING</span>
          </span>
        );
    }
  };

  // Filtered Services
  const displayedServices = errorCategoryFilter
    ? services.filter((s) => {
        if (errorCategoryFilter === "timeouts") return s.errorBreakdown.timeouts > 5;
        if (errorCategoryFilter === "5xx") return s.errorBreakdown.err5xx > 10;
        if (errorCategoryFilter === "4xx") return s.errorBreakdown.err4xx > 30;
        if (errorCategoryFilter === "failures") return s.status === "DOWN" || s.status === "DEGRADED";
        return true;
      })
    : services;

  const activeCriticalIncidents = incidents.filter((i) => i.status !== "RECOVERED");

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
                <path
                  d="M12 2L3 7v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7l-9-5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 12l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-[#171B68]">
                  Service Health Monitoring & AI Analysis
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF7A18]/15 text-[#FF7A18] border border-[#FF7A18]/30">
                  DEMO DATA
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#7d8fca] mt-0.5">
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  ● Live Monitoring
                </span>
                <span>·</span>
                <span>Last updated: {lastUpdated}</span>
                <span>·</span>
                <span className="hidden sm:inline">Authorized endpoints only</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Transparent Health Score Button */}
            <button
              onClick={() => setShowScoreModal(true)}
              className="px-3.5 py-2 rounded-xl border border-[#e2e8f5] bg-[#f7f9ff] hover:bg-white hover:border-[#174DE5] transition-all cursor-pointer flex items-center gap-2 group"
              title="Click to view transparent score calculation"
            >
              <div className="text-left">
                <div className="text-[10px] uppercase font-bold text-[#7d8fca]">System Score</div>
                <div className="text-sm font-extrabold text-[#174DE5] group-hover:underline">
                  {scoreData.overallScore}/100
                </div>
              </div>
              <span className="text-xs text-[#174DE5]">ℹ</span>
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
        {/* Security & Non-Invasive Notice (31.26) */}
        <div className="px-4 py-2.5 rounded-2xl bg-white border border-[#e2e8f5] text-xs text-[#7d8fca] flex flex-wrap items-center justify-between gap-2 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600 font-bold">🔒 Non-Invasive Protocol:</span>
            <span>
              Monitoring uses authorized health-check endpoints and synthetic/demo services. Never collects passwords or authentication tokens.
            </span>
          </div>
          <span className="font-mono text-[11px] text-[#174DE5]">RBAC: ADMIN_READ_OPERATIONS</span>
        </div>

        {/* Demo Simulation Controls Bar (31.22) */}
        <div className="rounded-3xl p-5 bg-white border border-[#e2e8f5] shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#174DE5]">
                  Demo Health Simulation Engine
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#171B68] text-white">
                  Active: {scenario}
                </span>
              </div>
              <p className="text-xs text-[#7d8fca] mt-0.5">
                Simulate incidents to witness the complete real-time chain: Service → Anomaly → AI Analysis → Affected Workflows → Recovery
              </p>
            </div>
            {scenario !== "NORMAL" && (
              <button
                onClick={() => triggerRecovery()}
                className="self-start lg:self-auto px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-95 active:scale-95 cursor-pointer flex items-center gap-1.5"
                style={{ background: "linear-gradient(135deg, #174DE5, #6A16B8)" }}
              >
                <span>↻ Trigger GovFix Auto-Recovery</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => triggerSimulation("NORMAL")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                scenario === "NORMAL"
                  ? "bg-[#171B68] text-white shadow-xs"
                  : "bg-[#f7f9ff] text-[#171B68] border border-[#e2e8f5] hover:bg-slate-100"
              }`}
            >
              ✓ Normal System
            </button>
            <button
              onClick={() => triggerSimulation("HIGH_LATENCY")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                scenario === "HIGH_LATENCY"
                  ? "bg-[#FF7A18] text-white shadow-xs"
                  : "bg-[#f7f9ff] text-[#FF7A18] border border-[#e2e8f5] hover:bg-orange-50"
              }`}
            >
              ⚠ Simulate High Latency (ERP +143%)
            </button>
            <button
              onClick={() => triggerSimulation("API_TIMEOUT")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                scenario === "API_TIMEOUT"
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-[#f7f9ff] text-rose-700 border border-[#e2e8f5] hover:bg-rose-50"
              }`}
            >
              ✕ Simulate API Timeout (Income 504)
            </button>
            <button
              onClick={() => triggerSimulation("ERROR_500")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                scenario === "ERROR_500"
                  ? "bg-rose-700 text-white shadow-xs"
                  : "bg-[#f7f9ff] text-rose-800 border border-[#e2e8f5] hover:bg-rose-50"
              }`}
            >
              ✕ Simulate 500 Error (Payment API 14.2%)
            </button>
            <button
              onClick={() => triggerSimulation("ERP_FAILURE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                scenario === "ERP_FAILURE"
                  ? "bg-rose-900 text-white shadow-xs"
                  : "bg-[#f7f9ff] text-rose-900 border border-[#e2e8f5] hover:bg-rose-50"
              }`}
            >
              ⚡ Simulate ERP Failure (Service Down)
            </button>
            <button
              onClick={() => triggerSimulation("DEPENDENCY_FAILURE")}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                scenario === "DEPENDENCY_FAILURE"
                  ? "bg-[#6A16B8] text-white shadow-xs"
                  : "bg-[#f7f9ff] text-[#6A16B8] border border-[#e2e8f5] hover:bg-purple-50"
              }`}
            >
              🔗 Simulate Cascade Dependency Failure
            </button>
            <button
              onClick={() => resetMonitoring()}
              className="ml-auto px-3 py-1.5 rounded-xl text-xs font-semibold text-[#7d8fca] hover:text-[#171B68] hover:bg-slate-100 transition-all cursor-pointer"
            >
              Reset Monitoring
            </button>
          </div>
        </div>

        {/* System Alerts Bar (31.18) */}
        {activeCriticalIncidents.length > 0 && (
          <div className="space-y-3">
            {activeCriticalIncidents.map((inc) => (
              <div
                key={inc.id}
                className={`p-4 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs ${
                  inc.severity === "CRITICAL"
                    ? "bg-rose-50 border-rose-200 text-rose-900"
                    : "bg-[#FF7A18]/10 border-[#FF7A18]/30 text-amber-950"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0 mt-0.5">
                    {inc.severity === "CRITICAL" ? "🔴" : "🟡"}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm">{inc.id}</span>
                      <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80">
                        {inc.severity}
                      </span>
                      <span className="text-xs text-slate-600">Detected: {inc.detectedTime}</span>
                    </div>
                    <div className="text-xs font-semibold mt-0.5">
                      {inc.serviceName}: {inc.trigger}. {inc.affectedWorkflowCount} citizen workflows preserved by GovFix.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  <button
                    onClick={() => {
                      setSelectedIncident(inc);
                      setActiveTab("incidents");
                    }}
                    className="px-3 py-1.5 rounded-xl bg-white text-xs font-bold shadow-2xs border border-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Investigate Incident
                  </button>
                  {inc.status === "ACTIVE" && (
                    <button
                      onClick={() => acknowledgeIncident(inc.id)}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-all cursor-pointer"
                    >
                      Acknowledge
                    </button>
                  )}
                  <button
                    onClick={() => triggerRecovery(inc.serviceId)}
                    className="px-3 py-1.5 rounded-xl bg-[#174DE5] text-white text-xs font-bold hover:bg-[#174DE5]/90 transition-all cursor-pointer"
                  >
                    Recover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Top-Level Metrics (31.4) */}
        <section className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Connected Services</div>
            <div className="text-2xl font-black text-[#171B68] mt-1">24</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">7 core deep-monitored</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Healthy</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {scoreData.details.healthyServices}
            </div>
            <div className="text-[10px] text-[#7d8fca] mt-0.5">Operational</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Degraded</div>
            <div className="text-2xl font-black text-[#FF7A18] mt-1">
              {scoreData.details.degradedServices}
            </div>
            <div className="text-[10px] text-[#7d8fca] mt-0.5">Latency elevated</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Offline</div>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {scoreData.details.downServices}
            </div>
            <div className="text-[10px] text-[#7d8fca] mt-0.5">Failing probes</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Avg Response Time</div>
            <div className="text-2xl font-black text-[#174DE5] mt-1">
              {Math.round(services.reduce((acc, s) => acc + s.latency, 0) / services.length)} ms
            </div>
            <div className="text-[10px] text-[#7d8fca] mt-0.5">Synthetic P50: 610ms</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Error Rate</div>
            <div className="text-2xl font-black text-[#171B68] mt-1">
              {(services.reduce((acc, s) => acc + s.errorRate, 0) / services.length).toFixed(1)}%
            </div>
            <div className="text-[10px] text-[#7d8fca] mt-0.5">Target &lt; 2.0%</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Availability</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {(services.reduce((acc, s) => acc + s.availability, 0) / services.length).toFixed(1)}%
            </div>
            <div className="text-[10px] text-[#7d8fca] mt-0.5">SLA: 99.2%</div>
          </div>
          <div className="rounded-2xl p-4 bg-white border border-[#e2e8f5] shadow-2xs">
            <div className="text-[11px] font-bold text-[#7d8fca] uppercase">Active Incidents</div>
            <div
              className={`text-2xl font-black mt-1 ${
                activeCriticalIncidents.length > 0 ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {activeCriticalIncidents.length}
            </div>
            <div className="text-[10px] text-[#7d8fca] mt-0.5">GovFix Auto-Guarded</div>
          </div>
        </section>

        {/* View Tabs */}
        <div className="flex items-center gap-2 border-b border-[#e2e8f5] pb-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "overview"
                ? "bg-[#171B68] text-white shadow-xs"
                : "bg-white text-[#7d8fca] hover:text-[#171B68] border border-[#e2e8f5]"
            }`}
          >
            📋 Service Health Table
          </button>
          <button
            onClick={() => setActiveTab("dependency")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "dependency"
                ? "bg-[#171B68] text-white shadow-xs"
                : "bg-white text-[#7d8fca] hover:text-[#171B68] border border-[#e2e8f5]"
            }`}
          >
            🔗 Service Dependency Map (31.20)
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "analytics"
                ? "bg-[#171B68] text-white shadow-xs"
                : "bg-white text-[#7d8fca] hover:text-[#171B68] border border-[#e2e8f5]"
            }`}
          >
            📈 Latency & Error Analytics (31.8 / 31.9)
          </button>
          <button
            onClick={() => setActiveTab("incidents")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "incidents"
                ? "bg-[#171B68] text-white shadow-xs"
                : "bg-white text-[#7d8fca] hover:text-[#171B68] border border-[#e2e8f5]"
            }`}
          >
            <span>🚨 Incidents & AI Timeline ({incidents.length})</span>
          </button>
        </div>

        {/* AI Health Analyst Widget (31.11, 31.12, 31.15) */}
        {incidents.length > 0 && (
          <section
            className="rounded-3xl p-6 text-white shadow-lg relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, #171B68 0%, #174DE5 100%)" }}
          >
            <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl pointer-events-none"></div>

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-xl shrink-0">
                  🤖
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-white">AI Health Analyst</h2>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                      CONFIDENCE: {incidents[0].aiAnalysis.confidence}%
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF7A18] text-white">
                      SEVERITY: {incidents[0].severity}
                    </span>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">
                    Continuous monitoring signal synthesis · Distinguishing observed facts from inferred causes
                  </p>
                </div>
              </div>

              {incidents[0].aiAnalysis.anomalyMetric && (
                <div className="px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs flex items-center gap-3">
                  <span className="text-white/70">Anomaly Detection:</span>
                  <span className="font-mono text-white/90">
                    {incidents[0].aiAnalysis.anomalyMetric.baseline}
                  </span>
                  <span>→</span>
                  <span className="font-mono font-bold text-amber-300">
                    {incidents[0].aiAnalysis.anomalyMetric.current}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FF7A18]/30 text-amber-200 font-bold text-[10px]">
                    {incidents[0].aiAnalysis.anomalyMetric.deviation}
                  </span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="font-bold text-amber-300 uppercase tracking-wider text-[10px] mb-1">
                  Observed Problem (Fact)
                </div>
                <div className="font-semibold text-white leading-relaxed">
                  {incidents[0].aiAnalysis.problem}
                </div>
                <div className="mt-2 text-[11px] text-white/70">
                  {incidents[0].aiAnalysis.observedFact}
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="font-bold text-[#FFB070] uppercase tracking-wider text-[10px] mb-1">
                  Likely Root Cause (Inferred)
                </div>
                <div className="font-semibold text-white leading-relaxed">
                  {incidents[0].aiAnalysis.possibleCause}
                </div>
                <div className="mt-2 text-[11px] text-white/70">
                  Component: {incidents[0].serviceName}
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                <div className="font-bold text-pink-300 uppercase tracking-wider text-[10px] mb-1">
                  Citizen Workflow Impact
                </div>
                <div className="font-semibold text-white leading-relaxed">
                  {incidents[0].aiAnalysis.impact}
                </div>
                <div className="mt-2 text-[11px] text-emerald-300 font-bold">
                  ✓ GovFix state lock active
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/20 p-4">
                <div className="font-bold text-emerald-300 uppercase tracking-wider text-[10px] mb-1">
                  Recommended Action (AI)
                </div>
                <div className="font-semibold text-white leading-relaxed">
                  {incidents[0].aiAnalysis.recommendedAction}
                </div>
                <button
                  onClick={() => triggerRecovery(incidents[0].serviceId)}
                  className="mt-3 w-full py-2 rounded-xl bg-white text-[#171B68] font-bold text-xs hover:bg-slate-100 transition-all cursor-pointer shadow-xs"
                >
                  Execute Recommended Recovery
                </button>
              </div>
            </div>
          </section>
        )}

        {/* TAB 1: OVERVIEW & TABLE (31.5) */}
        {activeTab === "overview" && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#171B68]">Connected Government Services</h2>
                <p className="text-xs text-[#7d8fca]">
                  Authorized health signals, latency percentiles, and component breakdown
                </p>
              </div>
              {errorCategoryFilter && (
                <button
                  onClick={() => setErrorCategoryFilter(null)}
                  className="px-3 py-1 rounded-xl text-xs font-bold text-[#174DE5] bg-[#174DE5]/10 border border-[#174DE5]/20 cursor-pointer"
                >
                  Clear Filter: {errorCategoryFilter} ✕
                </button>
              )}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-3xl border border-[#e2e8f5] overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f7f9ff] border-b border-[#e2e8f5] text-[#7d8fca] font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-6">Service & Department</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Latency (vs Baseline)</th>
                    <th className="py-3.5 px-4">Error Rate</th>
                    <th className="py-3.5 px-4">Availability</th>
                    <th className="py-3.5 px-4">SLA Compliance</th>
                    <th className="py-3.5 px-6 text-right">Deep Diagnostic</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedServices.map((svc) => (
                    <tr
                      key={svc.id}
                      className="hover:bg-[#f7f9ff]/60 transition-colors group cursor-pointer"
                      onClick={() => setSelectedService(svc)}
                    >
                      <td className="py-4 px-6">
                        <div className="font-bold text-[#171B68] text-sm group-hover:text-[#174DE5] transition-colors">
                          {svc.name}
                        </div>
                        <div className="text-[#7d8fca] text-[11px] mt-0.5">
                          {svc.department} ·{" "}
                          <span className="font-mono text-[10px]">{svc.serviceType}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">{renderStatusBadge(svc.status)}</td>
                      <td className="py-4 px-4">
                        <div className="font-mono font-bold text-sm text-[#171B68]">
                          {svc.latency} ms
                        </div>
                        <div className="text-[10px] text-[#7d8fca]">
                          Baseline: {svc.baselineLatency} ms (P95: {svc.metrics.p95}ms)
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div
                          className={`font-mono font-bold text-sm ${
                            svc.errorRate > 2 ? "text-rose-600" : "text-[#171B68]"
                          }`}
                        >
                          {svc.errorRate}%
                        </div>
                        <div className="text-[10px] text-[#7d8fca]">
                          {svc.errorBreakdown.successful.toLocaleString()} /{" "}
                          {svc.errorBreakdown.total.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-sm text-emerald-700">
                        {svc.availability}%
                      </td>
                      <td className="py-4 px-4">
                        {svc.sla.breached ? (
                          <span className="text-[11px] font-bold text-rose-600 flex items-center gap-1">
                            <span>⚠</span> Breached
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                            <span>✓</span> Within Target
                          </span>
                        )}
                        <div className="text-[10px] text-[#7d8fca]">
                          Target: {svc.sla.targetAvailability}%
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedService(svc);
                          }}
                          className="px-3.5 py-1.5 rounded-xl border border-[#e2e8f5] bg-[#f7f9ff] text-[#171B68] font-bold text-xs hover:border-[#174DE5] hover:text-[#174DE5] hover:bg-white transition-all cursor-pointer"
                        >
                          View Health →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (31.5) */}
            <div className="grid grid-cols-1 gap-3 md:hidden">
              {displayedServices.map((svc) => (
                <div
                  key={svc.id}
                  className="bg-white rounded-2xl border border-[#e2e8f5] p-5 shadow-2xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-[#171B68] text-base">{svc.name}</h3>
                      <p className="text-[#7d8fca] text-xs">{svc.department}</p>
                    </div>
                    {renderStatusBadge(svc.status, "sm")}
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <div className="text-[#7d8fca] text-[10px] uppercase">Latency</div>
                      <div className="font-mono font-bold text-[#171B68]">{svc.latency} ms</div>
                    </div>
                    <div>
                      <div className="text-[#7d8fca] text-[10px] uppercase">Error Rate</div>
                      <div className="font-mono font-bold text-[#171B68]">{svc.errorRate}%</div>
                    </div>
                    <div>
                      <div className="text-[#7d8fca] text-[10px] uppercase">Availability</div>
                      <div className="font-mono font-bold text-emerald-700">{svc.availability}%</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedService(svc)}
                    className="w-full py-2.5 rounded-xl bg-[#f7f9ff] border border-[#e2e8f5] text-xs font-bold text-[#174DE5] hover:bg-white transition-all cursor-pointer"
                  >
                    View Health & Diagnostics
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 2: SERVICE DEPENDENCY MAP (31.20) */}
        {activeTab === "dependency" && (
          <section className="bg-white rounded-3xl border border-[#e2e8f5] p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-base font-bold text-[#171B68]">Service Dependency Architecture Map</h2>
              <p className="text-xs text-[#7d8fca]">
                Real-time visual data flow with cascading dependency fault isolation and circuit breaker indicators
              </p>
            </div>

            {/* Interactive Visual Map */}
            <div className="p-6 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] overflow-x-auto">
              <div className="min-w-[700px] flex flex-col items-center gap-8 py-4">
                {/* Level 1: Govt Citizen Portal */}
                <div className="flex flex-col items-center">
                  <div className="px-5 py-3 rounded-2xl bg-white border border-[#e2e8f5] shadow-xs text-center">
                    <div className="text-[10px] uppercase font-bold text-[#7d8fca]">Entrypoint</div>
                    <div className="text-sm font-extrabold text-[#171B68]">Official Govt Citizen Portal</div>
                    <div className="text-[10px] text-emerald-600 font-bold">● Active / SSL Valid</div>
                  </div>
                  <div className="w-0.5 h-8 bg-[#174DE5]"></div>
                  <div className="text-[10px] text-[#174DE5] font-mono">https / REST</div>
                  <div className="w-0.5 h-4 bg-[#174DE5]"></div>
                </div>

                {/* Level 2: GovFix Gateway */}
                <div className="flex flex-col items-center">
                  <div
                    className="px-6 py-3.5 rounded-2xl text-white shadow-md text-center"
                    style={{ background: "linear-gradient(135deg, #171B68, #174DE5)" }}
                  >
                    <div className="text-[10px] uppercase tracking-wider font-bold text-white/80">
                      Central Resilience Gateway
                    </div>
                    <div className="text-base font-black">GovFix AI Gateway & Circuit Breaker</div>
                    <div className="text-[10px] text-emerald-300 font-semibold mt-0.5">
                      Mutual TLS · Token Masking · Zero Data Leakage
                    </div>
                  </div>
                </div>

                {/* Connecting Fan-Out Line */}
                <div className="w-3/4 h-0.5 bg-[#e2e8f5] relative">
                  <div className="absolute left-1/2 -top-1.5 -translate-x-1/2 w-3 h-3 rounded-full bg-[#174DE5]"></div>
                </div>

                {/* Level 3: Horizontal Tier (Identity, Income, Document) */}
                <div className="grid grid-cols-3 gap-6 w-full max-w-3xl">
                  {/* Identity */}
                  <div
                    onClick={() => setSelectedService(services.find((s) => s.id === "svc-identity") || null)}
                    className="p-4 rounded-2xl bg-white border border-[#e2e8f5] shadow-xs text-center cursor-pointer hover:border-[#174DE5] transition-all"
                  >
                    <div className="text-[10px] uppercase font-bold text-[#7d8fca]">Authentication</div>
                    <div className="text-xs font-bold text-[#171B68] mt-0.5">Identity API (UIDAI)</div>
                    <div className="mt-2">{renderStatusBadge(services.find((s) => s.id === "svc-identity")?.status || "HEALTHY", "sm")}</div>
                    <div className="text-[10px] font-mono text-[#7d8fca] mt-1.5">
                      {services.find((s) => s.id === "svc-identity")?.latency} ms
                    </div>
                  </div>

                  {/* Income */}
                  <div
                    onClick={() => setSelectedService(services.find((s) => s.id === "svc-income") || null)}
                    className={`p-4 rounded-2xl bg-white border shadow-xs text-center cursor-pointer hover:border-[#174DE5] transition-all ${
                      services.find((s) => s.id === "svc-income")?.status === "DOWN"
                        ? "border-rose-400 bg-rose-50/50 ring-2 ring-rose-300 animate-pulse"
                        : "border-[#e2e8f5]"
                    }`}
                  >
                    <div className="text-[10px] uppercase font-bold text-[#7d8fca]">Tax & Revenue</div>
                    <div className="text-xs font-bold text-[#171B68] mt-0.5">Income API (CBDT)</div>
                    <div className="mt-2">{renderStatusBadge(services.find((s) => s.id === "svc-income")?.status || "HEALTHY", "sm")}</div>
                    <div className="text-[10px] font-mono text-[#7d8fca] mt-1.5">
                      {services.find((s) => s.id === "svc-income")?.latency} ms
                    </div>
                  </div>

                  {/* Document */}
                  <div
                    onClick={() => setSelectedService(services.find((s) => s.id === "svc-document") || null)}
                    className="p-4 rounded-2xl bg-white border border-[#e2e8f5] shadow-xs text-center cursor-pointer hover:border-[#174DE5] transition-all"
                  >
                    <div className="text-[10px] uppercase font-bold text-[#7d8fca]">DigiLocker</div>
                    <div className="text-xs font-bold text-[#171B68] mt-0.5">Document API</div>
                    <div className="mt-2">{renderStatusBadge(services.find((s) => s.id === "svc-document")?.status || "HEALTHY", "sm")}</div>
                    <div className="text-[10px] font-mono text-[#7d8fca] mt-1.5">
                      {services.find((s) => s.id === "svc-document")?.latency} ms
                    </div>
                  </div>
                </div>

                {/* Connecting Lines into Education ERP */}
                <div className="flex flex-col items-center">
                  <div className="w-0.5 h-6 bg-[#174DE5]"></div>
                  <div className="text-[10px] text-[#7d8fca]">Aggregated Pre-Verification</div>
                  <div className="w-0.5 h-6 bg-[#174DE5]"></div>
                </div>

                {/* Level 4: Education ERP */}
                <div
                  onClick={() => setSelectedService(services.find((s) => s.id === "svc-education-erp") || null)}
                  className={`p-5 rounded-2xl bg-white border shadow-md text-center max-w-md w-full cursor-pointer hover:border-[#174DE5] transition-all ${
                    services.find((s) => s.id === "svc-education-erp")?.status === "DEGRADED"
                      ? "border-amber-400 bg-amber-50/50 ring-2 ring-amber-300"
                      : services.find((s) => s.id === "svc-education-erp")?.status === "DOWN"
                      ? "border-rose-500 bg-rose-50 ring-2 ring-rose-400 animate-pulse"
                      : "border-[#e2e8f5]"
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-[#7d8fca]">Department Processing Hub</div>
                  <div className="text-sm font-extrabold text-[#171B68] mt-0.5">Education Department ERP</div>
                  <div className="mt-2">{renderStatusBadge(services.find((s) => s.id === "svc-education-erp")?.status || "HEALTHY")}</div>
                  <div className="text-xs text-[#7d8fca] mt-1.5">
                    Latency: {services.find((s) => s.id === "svc-education-erp")?.latency} ms · Queue Depth:{" "}
                    {services.find((s) => s.id === "svc-education-erp")?.components.backend.queueDepth}
                  </div>
                </div>

                {/* Connecting Line into Payment */}
                <div className="w-0.5 h-6 bg-[#174DE5]"></div>

                {/* Level 5: Payment Gateway */}
                <div
                  onClick={() => setSelectedService(services.find((s) => s.id === "svc-payment") || null)}
                  className={`p-4 rounded-2xl bg-white border shadow-xs text-center max-w-sm w-full cursor-pointer hover:border-[#174DE5] transition-all ${
                    services.find((s) => s.id === "svc-payment")?.status === "DOWN"
                      ? "border-rose-400 bg-rose-50/50 ring-2 ring-rose-300 animate-pulse"
                      : "border-[#e2e8f5]"
                  }`}
                >
                  <div className="text-[10px] uppercase font-bold text-[#7d8fca]">Public Treasury</div>
                  <div className="text-xs font-bold text-[#171B68] mt-0.5">Payment Gateway (PFMS / BharatKosh)</div>
                  <div className="mt-2">{renderStatusBadge(services.find((s) => s.id === "svc-payment")?.status || "HEALTHY", "sm")}</div>
                  <div className="text-[10px] text-[#7d8fca] mt-1">
                    Idempotent DBT Disbursement Channel
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 3: LATENCY & ERROR ANALYTICS (31.8 / 31.9) */}
        {activeTab === "analytics" && (
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Response Time Monitoring Graph (31.8) */}
            <div className="bg-white rounded-3xl border border-[#e2e8f5] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#171B68]">Response-Time Percentiles (Last 60m)</h3>
                  <p className="text-xs text-[#7d8fca]">Synthetic benchmark timeline across all endpoints</p>
                </div>
                <span className="text-xs font-mono font-bold text-[#174DE5]">Avg: 640 ms</span>
              </div>

              {/* SVG Timeline Graph */}
              <div className="p-4 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5]">
                <div className="flex justify-between text-[10px] font-mono text-[#7d8fca] mb-1">
                  <span>2000 ms</span>
                  <span>1000 ms</span>
                  <span>500 ms</span>
                  <span>0 ms</span>
                </div>
                <svg viewBox="0 0 500 160" className="w-full h-40 overflow-visible">
                  {/* Grid lines */}
                  <line x1="0" y1="20" x2="500" y2="20" stroke="#e2e8f5" strokeDasharray="3 3" />
                  <line x1="0" y1="65" x2="500" y2="65" stroke="#e2e8f5" strokeDasharray="3 3" />
                  <line x1="0" y1="110" x2="500" y2="110" stroke="#e2e8f5" strokeDasharray="3 3" />
                  <line x1="0" y1="150" x2="500" y2="150" stroke="#e2e8f5" />

                  {/* Curve Path */}
                  <path
                    d="M 0 115 Q 60 120, 100 110 T 200 95 T 280 50 T 360 30 T 420 70 T 500 85"
                    fill="none"
                    stroke="#174DE5"
                    strokeWidth="2.5"
                  />
                  {/* Fill below curve */}
                  <path
                    d="M 0 115 Q 60 120, 100 110 T 200 95 T 280 50 T 360 30 T 420 70 T 500 85 L 500 150 L 0 150 Z"
                    fill="url(#latencyGrad)"
                    opacity="0.15"
                  />
                  <defs>
                    <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#174DE5" />
                      <stop offset="100%" stopColor="#174DE5" stopOpacity="0" />
                    </linearGradient>
                  </defs>

                  {/* Anomaly peak highlight */}
                  <circle cx="360" cy="30" r="5" fill="#FF7A18" />
                  <text x="360" y="20" fill="#FF7A18" fontSize="10" fontWeight="bold" textAnchor="middle">
                    Peak: 1,850 ms
                  </text>
                </svg>

                <div className="flex justify-between text-[10px] text-[#7d8fca] mt-2 font-mono">
                  <span>-60 min</span>
                  <span>-40 min</span>
                  <span>-20 min</span>
                  <span>Now</span>
                </div>
              </div>

              {/* Percentiles Metric Pills */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#f7f9ff] border border-[#e2e8f5] text-center">
                  <div className="text-[10px] text-[#7d8fca]">Min</div>
                  <div className="font-mono font-bold text-[#171B68]">140 ms</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f7f9ff] border border-[#e2e8f5] text-center">
                  <div className="text-[10px] text-[#7d8fca]">P50</div>
                  <div className="font-mono font-bold text-[#171B68]">395 ms</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f7f9ff] border border-[#e2e8f5] text-center">
                  <div className="text-[10px] text-[#7d8fca]">Average</div>
                  <div className="font-mono font-bold text-[#174DE5]">640 ms</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f7f9ff] border border-[#e2e8f5] text-center">
                  <div className="text-[10px] text-[#7d8fca]">P95</div>
                  <div className="font-mono font-bold text-[#171B68]">890 ms</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f7f9ff] border border-[#e2e8f5] text-center">
                  <div className="text-[10px] text-[#7d8fca]">P99</div>
                  <div className="font-mono font-bold text-[#FF7A18]">1,250 ms</div>
                </div>
                <div className="p-2.5 rounded-xl bg-[#f7f9ff] border border-[#e2e8f5] text-center">
                  <div className="text-[10px] text-[#7d8fca]">Max</div>
                  <div className="font-mono font-bold text-rose-600">1,850 ms</div>
                </div>
              </div>
            </div>

            {/* Error Rate Monitoring (31.9) */}
            <div className="bg-white rounded-3xl border border-[#e2e8f5] p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#171B68]">Error Rate Breakdown & Filter</h3>
                  <p className="text-xs text-[#7d8fca]">Click a category to filter affected services</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700">98.2% Successful</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    setErrorCategoryFilter(null);
                    setActiveTab("overview");
                  }}
                  className="p-3.5 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] hover:border-[#174DE5] text-left transition-all cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-[#7d8fca] uppercase">Total Requests</div>
                  <div className="text-lg font-black text-[#171B68]">169,400</div>
                  <div className="text-[10px] text-emerald-600">166,358 successful</div>
                </button>

                <button
                  onClick={() => {
                    setErrorCategoryFilter("4xx");
                    setActiveTab("overview");
                  }}
                  className="p-3.5 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] hover:border-[#174DE5] text-left transition-all cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-[#7d8fca] uppercase">4xx Errors</div>
                  <div className="text-lg font-black text-amber-600">264</div>
                  <div className="text-[10px] text-[#7d8fca]">Invalid inputs / token</div>
                </button>

                <button
                  onClick={() => {
                    setErrorCategoryFilter("5xx");
                    setActiveTab("overview");
                  }}
                  className="p-3.5 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] hover:border-[#174DE5] text-left transition-all cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-[#7d8fca] uppercase">5xx Server Errors</div>
                  <div className="text-lg font-black text-rose-600">114</div>
                  <div className="text-[10px] text-rose-600 font-semibold">Click to inspect</div>
                </button>

                <button
                  onClick={() => {
                    setErrorCategoryFilter("timeouts");
                    setActiveTab("overview");
                  }}
                  className="p-3.5 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] hover:border-[#174DE5] text-left transition-all cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-[#7d8fca] uppercase">504 Timeouts</div>
                  <div className="text-lg font-black text-[#FF7A18]">67</div>
                  <div className="text-[10px] text-[#FF7A18] font-semibold">Gateway timeout</div>
                </button>

                <button
                  onClick={() => {
                    setErrorCategoryFilter("failures");
                    setActiveTab("overview");
                  }}
                  className="p-3.5 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] hover:border-[#174DE5] text-left transition-all cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-[#7d8fca] uppercase">Conn Failures</div>
                  <div className="text-lg font-black text-slate-800">12</div>
                  <div className="text-[10px] text-[#7d8fca]">Socket reset / refused</div>
                </button>

                <button
                  onClick={() => {
                    setErrorCategoryFilter("failures");
                    setActiveTab("overview");
                  }}
                  className="p-3.5 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] hover:border-[#174DE5] text-left transition-all cursor-pointer"
                >
                  <div className="text-[10px] font-bold text-[#7d8fca] uppercase">Validation Failures</div>
                  <div className="text-lg font-black text-slate-800">11</div>
                  <div className="text-[10px] text-[#7d8fca]">Schema mismatch</div>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-[#7d8fca]">
                💡 <span className="font-semibold text-[#171B68]">Protection Tip:</span> GovFix applies
                idempotent retry policies to all 5xx errors and gateway timeouts, guaranteeing that citizen
                bank transfers or submission quotas are never duplicated.
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: INCIDENTS & LIFECYCLE TIMELINE (31.13, 31.14, 31.19) */}
        {activeTab === "incidents" && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-[#171B68]">Active Incidents & Lifecycle Timeline</h2>
                <p className="text-xs text-[#7d8fca]">
                  Complete incident tracking: Detection → AI Diagnosis → Workflow Safeguard → Recovery → Verification
                </p>
              </div>
            </div>

            {incidents.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#e2e8f5] p-12 text-center shadow-xs">
                <div className="text-3xl mb-2">🎉</div>
                <h3 className="text-base font-bold text-[#171B68]">No Active Incidents</h3>
                <p className="text-xs text-[#7d8fca] mt-1 max-w-md mx-auto">
                  All monitored government endpoints are currently responding within normal SLA parameters. Use the Demo Simulation Engine above to test incident handling.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Incident Cards Column */}
                <div className="space-y-3">
                  {incidents.map((inc) => (
                    <div
                      key={inc.id}
                      onClick={() => setSelectedIncident(inc)}
                      className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                        selectedIncident?.id === inc.id
                          ? "bg-white border-[#174DE5] shadow-md ring-2 ring-[#174DE5]/20"
                          : "bg-white border-[#e2e8f5] hover:border-slate-300 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono font-bold text-xs text-[#171B68]">{inc.id}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            inc.severity === "CRITICAL"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-[#FF7A18]/15 text-[#FF7A18] border border-[#FF7A18]/30"
                          }`}
                        >
                          {inc.severity}
                        </span>
                      </div>
                      <h4 className="font-bold text-sm text-[#171B68]">{inc.serviceName}</h4>
                      <p className="text-xs text-[#7d8fca] mt-1 leading-snug">{inc.trigger}</p>
                      <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t border-slate-100">
                        <span className="text-[#7d8fca]">Status: {inc.status}</span>
                        <span className="font-bold text-[#174DE5]">
                          {inc.affectedWorkflowCount} Workflows
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Incident Details & Timeline Column */}
                {selectedIncident || incidents[0] ? (
                  <div className="lg:col-span-2 bg-white rounded-3xl border border-[#e2e8f5] p-6 shadow-xs space-y-6">
                    {(() => {
                      const inc = selectedIncident || incidents[0];
                      return (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-black text-base text-[#171B68]">
                                  {inc.id}
                                </span>
                                <span className="text-xs text-[#7d8fca]">· {inc.department}</span>
                              </div>
                              <h3 className="text-lg font-extrabold text-[#171B68] mt-0.5">
                                {inc.serviceName}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2">
                              {inc.status === "ACTIVE" && (
                                <button
                                  onClick={() => acknowledgeIncident(inc.id)}
                                  className="px-3.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
                                >
                                  Acknowledge
                                </button>
                              )}
                              <button
                                onClick={() => triggerRecovery(inc.serviceId)}
                                className="px-4 py-1.5 rounded-xl bg-[#174DE5] text-white text-xs font-bold shadow-xs hover:bg-[#174DE5]/90 transition-all cursor-pointer"
                              >
                                Trigger Recovery
                              </button>
                            </div>
                          </div>

                          {/* Incident Timeline (31.14) */}
                          <div>
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#7d8fca] mb-3">
                              Incident Lifecycle Timeline
                            </h4>
                            <div className="space-y-3 relative pl-6 border-l-2 border-[#174DE5]/30">
                              {inc.timeline.map((event, idx) => (
                                <div key={idx} className="relative group">
                                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#174DE5] border-2 border-white shadow-2xs"></div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-[#171B68]">
                                      {event.time}
                                    </span>
                                    <span className="text-xs font-semibold text-[#174DE5] px-2 py-0.5 rounded-md bg-[#174DE5]/10">
                                      {event.actor}
                                    </span>
                                    <span className="text-xs font-bold text-slate-700">
                                      · {event.stage}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#7d8fca] mt-0.5 leading-relaxed">
                                    {event.description}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Affected Applications List (31.19) */}
                          <div className="pt-4 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7d8fca]">
                                Affected Workflows ({inc.affectedApplications.length} Loaded)
                              </h4>
                              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                                ✓ All Workflows Preserved
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {inc.affectedApplications.map((app) => (
                                <div
                                  key={app.id}
                                  className="p-3 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] text-xs space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono font-bold text-[#171B68]">
                                      {app.id}
                                    </span>
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                      {app.status}
                                    </span>
                                  </div>
                                  <div className="text-[#7d8fca]">{app.applicant}</div>
                                  <div className="text-[#174DE5] font-semibold text-[11px]">
                                    Step: {app.workflowStep}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                ) : null}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Deep Component Diagnostic Drawer / Modal (31.6, 31.10) */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#e2e8f5] max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#174DE5]">
                    Deep Diagnostic View · {selectedService.serviceType}
                  </span>
                  {renderStatusBadge(selectedService.status, "sm")}
                </div>
                <h3 className="text-xl font-extrabold text-[#171B68] mt-1">
                  {selectedService.name}
                </h3>
                <p className="text-xs text-[#7d8fca]">{selectedService.department}</p>
              </div>
              <button
                onClick={() => setSelectedService(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Sub-Component Breakdown (31.10) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#7d8fca]">
                Sub-Component Health Inspection
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5]">
                  <div className="text-[10px] text-[#7d8fca]">Website Availability</div>
                  <div className="font-bold text-[#171B68] mt-0.5">
                    {selectedService.components.website.label}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-1">
                    {renderStatusBadge(selectedService.components.website.status, "sm")}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5]">
                  <div className="text-[10px] text-[#7d8fca]">Frontend Health</div>
                  <div className="font-bold text-[#171B68] mt-0.5">
                    {selectedService.components.frontend.label}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-1">
                    {renderStatusBadge(selectedService.components.frontend.status, "sm")}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5]">
                  <div className="text-[10px] text-[#7d8fca]">API Health</div>
                  <div className="font-bold text-[#171B68] mt-0.5">
                    {selectedService.components.api.label}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-1">
                    {renderStatusBadge(selectedService.components.api.status, "sm")}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5]">
                  <div className="text-[10px] text-[#7d8fca]">Authentication Health</div>
                  <div className="font-bold text-[#171B68] mt-0.5">
                    {selectedService.components.auth.label}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-1">
                    {renderStatusBadge(selectedService.components.auth.status, "sm")}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5]">
                  <div className="text-[10px] text-[#7d8fca]">Backend Service Health</div>
                  <div className="font-bold text-[#171B68] mt-0.5">
                    {selectedService.components.backend.label}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-1">
                    {renderStatusBadge(selectedService.components.backend.status, "sm")}
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5]">
                  <div className="text-[10px] text-[#7d8fca]">Database Health</div>
                  <div className="font-bold text-[#171B68] mt-0.5">
                    {selectedService.components.database.label}
                  </div>
                  <div className="text-[10px] text-emerald-600 mt-1">
                    {renderStatusBadge(selectedService.components.database.status, "sm")}
                  </div>
                </div>
              </div>
            </div>

            {/* SSL/TLS & Schema Validation (31.6) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white border border-[#e2e8f5] space-y-1">
                <div className="text-[10px] font-bold uppercase text-[#7d8fca]">SSL / TLS Certificate</div>
                <div className="font-bold text-emerald-700 flex items-center gap-1">
                  <span>✓</span> Valid ({selectedService.sslStatus.tlsVersion})
                </div>
                <div className="text-[11px] text-[#7d8fca]">
                  Issuer: {selectedService.sslStatus.issuer} · Expires in {selectedService.sslStatus.expiresDays} days
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#e2e8f5] space-y-1">
                <div className="text-[10px] font-bold uppercase text-[#7d8fca]">Data Schema Validation</div>
                <div className="font-bold text-emerald-700 flex items-center gap-1">
                  <span>✓</span> Schema {selectedService.schemaValidation.schemaVersion} ({selectedService.schemaValidation.status})
                </div>
                <div className="text-[11px] text-[#7d8fca]">
                  {selectedService.schemaValidation.details}
                </div>
              </div>
            </div>

            {/* Endpoint & 24h Stats (31.23) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#7d8fca]">Endpoint:</span>
                <span className="font-mono text-[#171B68]">{selectedService.url}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7d8fca]">24h Availability:</span>
                <span className="font-bold text-emerald-700">{selectedService.history24h.availability}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7d8fca]">24h Total Requests:</span>
                <span className="font-mono text-[#171B68]">
                  {selectedService.history24h.requests.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedService(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#e2e8f5] text-xs font-bold text-[#171B68] hover:bg-slate-50 cursor-pointer"
              >
                Close Diagnostic
              </button>
              <button
                onClick={() => {
                  triggerRecovery(selectedService.id);
                  setSelectedService(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#174DE5] text-white text-xs font-bold hover:bg-[#174DE5]/90 cursor-pointer"
              >
                Trigger Re-Check / Recover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transparent Health Score Breakdown Modal (31.7) */}
      {showScoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e2e8f5] space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#174DE5]">
                  Transparent Health Score (31.7)
                </span>
                <h3 className="text-2xl font-black text-[#171B68] mt-0.5">
                  {scoreData.overallScore} / 100
                </h3>
              </div>
              <button
                onClick={() => setShowScoreModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-[#7d8fca] leading-relaxed">
              GovFix health scores are mathematically computed from measurable operational factors, not a black-box estimate.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#171B68]">Availability (30% Weight)</div>
                  <div className="text-[11px] text-[#7d8fca]">{scoreData.availabilityPct}% across all services</div>
                </div>
                <span className="font-mono font-bold text-[#174DE5]">{scoreData.availabilityScore} / 30</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#171B68]">API Success Rate (25% Weight)</div>
                  <div className="text-[11px] text-[#7d8fca]">{scoreData.apiSuccessPct}% successful requests</div>
                </div>
                <span className="font-mono font-bold text-[#174DE5]">{scoreData.apiSuccessScore} / 25</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#171B68]">Latency vs Baseline (20% Weight)</div>
                  <div className="text-[11px] text-[#7d8fca]">Rating: {scoreData.latencyRating}</div>
                </div>
                <span className="font-mono font-bold text-[#174DE5]">{scoreData.latencyScore} / 20</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#171B68]">Dependencies (15% Weight)</div>
                  <div className="text-[11px] text-[#7d8fca]">Rating: {scoreData.dependencyRating}</div>
                </div>
                <span className="font-mono font-bold text-[#174DE5]">{scoreData.dependencyScore} / 15</span>
              </div>

              <div className="p-3 rounded-2xl bg-[#f7f9ff] border border-[#e2e8f5] flex items-center justify-between">
                <div>
                  <div className="font-bold text-rose-600">Active Incident Penalty (Up to -10%)</div>
                  <div className="text-[11px] text-[#7d8fca]">
                    {incidents.filter((i) => i.status !== "RECOVERED").length} unresolved incidents
                  </div>
                </div>
                <span className="font-mono font-bold text-rose-600">-{scoreData.incidentPenalty}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-bold text-[#171B68]">Overall Calculated Score:</span>
              <span className="font-mono font-black text-base text-[#174DE5]">
                {scoreData.overallScore} / 100
              </span>
            </div>

            <button
              onClick={() => setShowScoreModal(false)}
              className="w-full py-2.5 rounded-xl bg-[#171B68] text-white font-bold text-xs hover:bg-[#171B68]/90 transition-all cursor-pointer"
            >
              Close Score Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
