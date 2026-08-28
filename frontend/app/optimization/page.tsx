"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sliders,
  Sparkles,
  MapPin,
  ArrowRight,
  RefreshCw,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Truck,
  Package,
  Boxes,
  Layers,
  ArrowRightCircle,
  ShieldCheck,
  Zap,
  Users,
  RotateCcw,
  Check,
  Info,
} from "lucide-react";
import { ResourceOptimizationData } from "@/types";
import { fetchOptimizationData, fetchDatasetInfo } from "@/lib/api";

function OptimizationContent() {
  const searchParams = useSearchParams();
  const facilityParam = searchParams.get("facility") || "All";

  // State
  const [facility, setFacility] = useState<string>(facilityParam);
  const [facilities, setFacilities] = useState<string[]>([
    "F01-Chennai",
    "F02-Bangalore",
    "F03-Hyderabad",
    "F04-Mumbai",
  ]);

  // Scenario Simulator Multipliers
  const [volumeMult, setVolumeMult] = useState<number>(1.0);
  const [resourceMult, setResourceMult] = useState<number>(1.0);
  const [peakMode, setPeakMode] = useState<boolean>(false);

  const [optData, setOptData] = useState<ResourceOptimizationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async (
    fac: string,
    vMult: number = 1.0,
    rMult: number = 1.0,
    pk: boolean = false
  ) => {
    setIsLoading(true);
    try {
      const data = await fetchOptimizationData({
        facility: fac,
        volume_multiplier: vMult,
        resource_multiplier: rMult,
        peak_mode: pk,
      });
      setOptData(data);
    } catch (err) {
      console.error("Error loading optimization data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasetInfo().then((summary) => {
      if (summary?.facilities && summary.facilities.length > 0) {
        setFacilities(summary.facilities);
      }
    });
    loadData(facility, volumeMult, resourceMult, peakMode);
  }, []);

  const handleFacilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFacility(val);
    loadData(val, volumeMult, resourceMult, peakMode);
  };

  const handleResetScenario = () => {
    setVolumeMult(1.0);
    setResourceMult(1.0);
    setPeakMode(false);
    loadData(facility, 1.0, 1.0, false);
  };

  const metrics = optData?.metrics;
  const balance = optData?.balance;
  const rec = optData?.primary_recommendation;
  const table = optData?.allocation_table || [];
  const opportunities = optData?.opportunities || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
            MODULE 5 — RESOURCE OPTIMIZATION ENGINE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Resource Reallocation & Optimization
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Identify imbalances • Reallocate surplus capacity • Eliminate bottlenecks • Simulate impact
          </p>
        </div>

        {/* Hub Filter */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-semibold text-gray-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-400" /> Hub:
          </label>
          <select
            value={facility}
            onChange={handleFacilityChange}
            className="bg-gray-900 text-gray-200 text-xs font-semibold rounded-xl px-3 py-2 border border-gray-700 focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="All">All Hubs (Network)</option>
            {facilities.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 1. Four Core Resource Metric Cards */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
          {/* Resources Optimizable */}
          <div className="p-4 rounded-3xl bg-gray-900/80 border border-gray-800 space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Resources Optimizable
            </span>
            <div className="text-3xl font-extrabold text-white">
              {metrics.resources_optimizable}
            </div>
            <span className="text-[10px] text-amber-400 font-semibold block">
              Reallocable buffer handlers
            </span>
          </div>

          {/* Underutilized Capacity */}
          <div className="p-4 rounded-3xl bg-gray-900/80 border border-gray-800 space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Underutilized Capacity
            </span>
            <div className="text-3xl font-extrabold text-white">
              {metrics.underutilized_capacity_pct}%
            </div>
            <span className="text-[10px] text-gray-400 block">
              Idle intake capacity margin
            </span>
          </div>

          {/* Resource Gap */}
          <div className="p-4 rounded-3xl bg-gray-900/80 border border-gray-800 space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Resource Gap
            </span>
            <div
              className={`text-3xl font-extrabold ${
                metrics.resource_gap < 0 ? "text-red-400" : "text-emerald-400"
              }`}
            >
              {metrics.resource_gap > 0 ? `+${metrics.resource_gap}` : metrics.resource_gap}
            </div>
            <span className="text-[10px] text-gray-400 block">
              Net deficit before rebalancing
            </span>
          </div>

          {/* Potential Gain */}
          <div className="p-4 rounded-3xl bg-gray-900/80 border border-gray-800 space-y-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
              Potential Throughput Gain
            </span>
            <div className="text-3xl font-extrabold text-emerald-400">
              +{metrics.potential_gain_pct}%
            </div>
            <span className="text-[10px] text-gray-400 block">
              Expected output improvement
            </span>
          </div>
        </div>
      )}

      {/* 2. Resource Balance Visual (SURPLUS vs SHORTAGE) */}
      {balance && (
        <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              RESOURCE BALANCE & IMBALANCE MAPPING
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Where are resources available, and where are they urgently needed?
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-11 gap-4 items-center">
            {/* SURPLUS (Left) */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/40 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> SURPLUS (Excess Capacity)
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-300">
                  +{balance.total_surplus_workers} workers
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {balance.surplus_areas.map((s) => (
                  <div
                    key={s.area}
                    className="flex items-center justify-between p-2 rounded-xl bg-gray-950/60"
                  >
                    <span className="font-semibold text-white">{s.area} Intake</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-emerald-400 font-bold">+{s.surplus}</span>
                      <span className="text-[10px] text-gray-400">({s.utilization_pct}% util)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FLOW ARROW (Center) */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center text-center py-2">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <ArrowRight className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-amber-400 uppercase mt-1">
                Reallocate
              </span>
            </div>

            {/* SHORTAGE (Right) */}
            <div className="lg:col-span-5 p-4 rounded-2xl bg-red-950/20 border border-red-500/40 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-red-500/20">
                <span className="text-xs font-bold text-red-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400" /> SHORTAGE (Bottleneck Pressure)
                </span>
                <span className="text-[11px] font-mono font-bold text-red-300">
                  -{balance.total_shortage_workers} workers
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {balance.shortage_areas.map((s) => (
                  <div
                    key={s.area}
                    className="flex items-center justify-between p-2 rounded-xl bg-gray-950/60"
                  >
                    <span className="font-semibold text-white">{s.area} Dispatch</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-red-400 font-bold">-{s.shortage}</span>
                      <span className="text-[10px] text-gray-400">({s.utilization_pct}% util)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Recommended Reallocation & "Why this recommendation?" */}
      {rec && (
        <div className="ups-glass-card rounded-3xl p-6 border border-amber-500/40 bg-gradient-to-br from-[#1c1810]/40 to-[#181a24] space-y-5">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              OPTIMIZATION RECOMMENDATION
            </span>
            <h3 className="text-base font-extrabold text-white mt-0.5">
              Reallocate Resources Across Operational Lines
            </h3>
          </div>

          {/* Visual Reallocation Block */}
          <div className="p-4 rounded-2xl bg-gray-950/80 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                  Source Area
                </span>
                <span className="text-sm font-bold text-emerald-400">{rec.source_area}</span>
                <span className="text-[10px] text-gray-400 block">+18 Surplus</span>
              </div>

              <div className="flex flex-col items-center px-2">
                <ArrowRightCircle className="w-6 h-6 text-amber-400 animate-pulse" />
                <span className="text-xs font-black text-amber-400 font-mono mt-1">
                  Move {rec.workers_to_move} Workers
                </span>
              </div>

              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
                <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                  Target Area
                </span>
                <span className="text-sm font-bold text-red-400">{rec.target_area}</span>
                <span className="text-[10px] text-gray-400 block">-14 Shortage</span>
              </div>
            </div>

            <div className="text-right sm:border-l sm:border-gray-800 sm:pl-6">
              <span className="text-[10px] text-gray-400 uppercase block font-semibold">
                Expected Improvement
              </span>
              <span className="text-xs font-bold text-emerald-400 block mt-0.5">
                {rec.expected_improvement}
              </span>
            </div>
          </div>

          {/* "Why this recommendation?" Explainable Intelligence */}
          <div className="p-4 rounded-2xl bg-gray-950/70 border border-amber-500/30 text-xs space-y-1.5">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <Info className="w-4 h-4" />
              <span>Why this recommendation?</span>
            </div>
            <p className="text-gray-300 leading-relaxed font-medium pl-6">
              {rec.why_explanation}
            </p>
          </div>
        </div>
      )}

      {/* 4. Resource Allocation Table (The Hard Numbers) */}
      <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            RESOURCE ALLOCATION TABLE
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Breakdown of required manpower, allocated workforce, and capacity utilization per operational area
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-950/60">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-gray-900 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-800">
              <tr>
                <th className="px-4 py-3.5">Operational Area</th>
                <th className="px-4 py-3.5 text-right">Required</th>
                <th className="px-4 py-3.5 text-right">Allocated</th>
                <th className="px-4 py-3.5 text-right">Gap</th>
                <th className="px-4 py-3.5 text-right">Utilization</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 font-mono text-xs">
              {table.map((row) => (
                <tr key={row.area} className="hover:bg-gray-800/40">
                  <td className="px-4 py-3.5 font-sans font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>{row.area} Operations</span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-white">
                    {row.required_workers}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-amber-400">
                    {row.allocated_workers}
                  </td>
                  <td
                    className={`px-4 py-3.5 text-right font-bold ${
                      row.gap < 0 ? "text-red-400" : "text-emerald-400"
                    }`}
                  >
                    {row.gap > 0 ? `+${row.gap}` : row.gap}
                  </td>
                  <td className="px-4 py-3.5 text-right font-bold text-white">
                    {row.utilization_pct}%
                  </td>
                  <td className="px-4 py-3.5 text-center font-sans">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        row.status === "shortage"
                          ? "bg-red-500/10 text-red-400 border-red-500/30"
                          : row.status === "surplus"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {row.status_label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Top 3 Optimization Opportunities */}
      <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            TOP 3 OPTIMIZATION OPPORTUNITIES
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Actionable reallocation priority list to maximize throughput
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {opportunities.map((opp, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border space-y-2 ${
                opp.severity === "critical"
                  ? "bg-red-950/20 border-red-500/40"
                  : opp.severity === "warning"
                  ? "bg-amber-950/20 border-amber-500/40"
                  : "bg-emerald-950/20 border-emerald-500/40"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-base">{opp.icon}</span>
                <h4 className="text-xs font-bold text-white">{opp.title}</h4>
              </div>
              <p className="text-[11px] text-gray-300 leading-relaxed">
                {opp.action}
              </p>
              <span className="text-[10px] font-bold text-emerald-400 block pt-1">
                Expected Lift: {opp.impact}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 6. What-If Scenario Simulator (Scenario-Based Planning) */}
      <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              WHAT-IF OPTIMIZATION SIMULATOR
            </h3>
          </div>
          <span className="text-xs text-gray-400">
            Simulate demand surges, labor variations, and peak mode policies
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Volume Multiplier */}
          <div className="p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Demand Volume Surge:</span>
              <span className="font-mono font-bold text-amber-400">
                {volumeMult > 1 ? `+${Math.round((volumeMult - 1) * 100)}%` : "Baseline (0%)"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {[0, 0.15, 0.25].map((delta) => {
                const target = 1.0 + delta;
                return (
                  <button
                    key={delta}
                    onClick={() => {
                      setVolumeMult(target);
                      loadData(facility, target, resourceMult, peakMode);
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      volumeMult === target
                        ? "bg-amber-500 text-gray-950 shadow-md"
                        : "bg-gray-900 text-gray-400 hover:text-white"
                    }`}
                  >
                    {delta > 0 ? `+${Math.round(delta * 100)}%` : "Base"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Resource Variation */}
          <div className="p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Resource Level:</span>
              <span className="font-mono font-bold text-blue-400">
                {resourceMult < 1 ? `-${Math.round((1 - resourceMult) * 100)}%` : "Normal (100%)"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {[0, -0.05, -0.1].map((delta) => {
                const target = 1.0 + delta;
                return (
                  <button
                    key={delta}
                    onClick={() => {
                      setResourceMult(target);
                      loadData(facility, volumeMult, target, peakMode);
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      resourceMult === target
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-900 text-gray-400 hover:text-white"
                    }`}
                  >
                    {delta < 0 ? `${Math.round(delta * 100)}%` : "Normal"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Peak Mode Toggle */}
          <div className="p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Peak Operating Mode</span>
              <span className="text-[10px] text-gray-400">Auto-prioritize Outbound lane</span>
            </div>
            <button
              onClick={() => {
                const newPeak = !peakMode;
                setPeakMode(newPeak);
                loadData(facility, volumeMult, resourceMult, newPeak);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                peakMode
                  ? "bg-red-500 text-white shadow-md"
                  : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              {peakMode ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{peakMode ? "Active" : "Enable"}</span>
            </button>
          </div>
        </div>

        {/* Live Simulation Before vs After Comparison */}
        {rec && (
          <div className="p-4 rounded-2xl bg-gray-950/90 border border-gray-800 space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
              Simulated Reallocation Impact (Before vs After)
            </span>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/30 space-y-1">
                <span className="font-bold text-red-300 block">Current State (Before):</span>
                <div className="text-gray-400">
                  Outbound: <strong className="text-red-400">{rec.before_state.target_util}% Util</strong> ({rec.before_state.target_shortage} shortage)
                </div>
                <div className="text-gray-400">
                  Receiving: <strong className="text-emerald-400">{rec.before_state.source_util}% Util</strong> (Wasted buffer)
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1">
                <span className="font-bold text-emerald-300 block">Optimized State (After Reallocation):</span>
                <div className="text-gray-400">
                  Outbound: <strong className="text-emerald-400">{rec.after_state.target_util}% Util</strong> (Shortage resolved)
                </div>
                <div className="text-gray-400">
                  Receiving: <strong className="text-white">{rec.after_state.source_util}% Util</strong> (Safe capacity buffer)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reset Scenario */}
        {(volumeMult !== 1.0 || resourceMult !== 1.0 || peakMode) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetScenario}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Simulator to Baseline</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function OptimizationPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400">Loading resource optimization...</div>}>
      <OptimizationContent />
    </Suspense>
  );
}
