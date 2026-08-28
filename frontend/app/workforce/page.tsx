"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Users,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Sliders,
  Sparkles,
  Layers,
  ShieldAlert,
  Check,
  Zap,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { WorkforcePlan } from "@/types";
import { fetchWorkforceData, fetchDatasetInfo } from "@/lib/api";

const CapacityTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-950/95 border border-gray-800 p-3 rounded-2xl shadow-2xl text-xs space-y-1 min-w-[180px]">
        <span className="font-bold text-white block pb-1 border-b border-gray-800">{label}</span>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-3 pt-0.5">
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-white">
              {entry.value?.toLocaleString()} pkgs
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function WorkforceContent() {
  const searchParams = useSearchParams();
  const facilityParam = searchParams.get("facility") || "All";
  const horizonParam = searchParams.get("horizon");

  // Filters
  const [facility, setFacility] = useState<string>(facilityParam);
  const [horizonDays, setHorizonDays] = useState<number>(7);
  const [facilities, setFacilities] = useState<string[]>([
    "F01-Chennai",
    "F02-Bangalore",
    "F03-Hyderabad",
    "F04-Mumbai",
  ]);

  // Scenario Multipliers
  const [volMultiplier, setVolMultiplier] = useState<number>(1.0);
  const [workerMultiplier, setWorkerMultiplier] = useState<number>(1.0);
  const [enableOvertime, setEnableOvertime] = useState<boolean>(false);

  const [workforceData, setWorkforceData] = useState<WorkforcePlan | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async (
    fac: string,
    hDays: number,
    vMult: number = 1.0,
    wMult: number = 1.0,
    ot: boolean = false
  ) => {
    setIsLoading(true);
    try {
      const data = await fetchWorkforceData({
        facility: fac,
        horizon_days: hDays,
        volume_multiplier: vMult,
        worker_multiplier: wMult,
        enable_overtime: ot,
      });
      setWorkforceData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Resolve horizon from URL param or localStorage
    let resolvedHorizon = 7;
    if (horizonParam) {
      resolvedHorizon = parseInt(horizonParam, 10);
    } else {
      const savedH = localStorage.getItem("ups_selected_horizon");
      if (savedH) resolvedHorizon = parseInt(savedH, 10);
    }
    setHorizonDays(resolvedHorizon);

    fetchDatasetInfo().then((summary) => {
      if (summary?.facilities && summary.facilities.length > 0) {
        setFacilities(summary.facilities);
      }
    });

    loadData(facility, resolvedHorizon, volMultiplier, workerMultiplier, enableOvertime);
  }, [facilityParam, horizonParam]);

  const handleFacilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFacility(val);
    loadData(val, horizonDays, volMultiplier, workerMultiplier, enableOvertime);
  };

  const handleHorizonChange = (h: number) => {
    setHorizonDays(h);
    localStorage.setItem("ups_selected_horizon", h.toString());
    loadData(facility, h, volMultiplier, workerMultiplier, enableOvertime);
  };

  const handleResetScenario = () => {
    setVolMultiplier(1.0);
    setWorkerMultiplier(1.0);
    setEnableOvertime(false);
    loadData(facility, horizonDays, 1.0, 1.0, false);
  };

  const isShortage = (workforceData?.total_gap || 0) < 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* 1. Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              MODULE 2 — SMART WORKFORCE PLANNING
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30 font-mono">
              📅 Scope: {horizonDays === 1 ? "Next Day" : horizonDays === 7 ? "Next 7 Days" : "Next 30 Days"}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Smart Workforce Planning
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Forecast workload • Identify gaps • Optimize shift allocation
          </p>
        </div>

        {/* Hub & Horizon Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Horizon toggle synced with Volume Forecasting */}
          <div className="flex items-center bg-gray-900 rounded-xl p-1 border border-gray-800 text-xs">
            {[
              { label: "1-Day", val: 1 },
              { label: "7-Day", val: 7 },
              { label: "30-Day", val: 30 },
            ].map((item) => (
              <button
                key={item.val}
                onClick={() => handleHorizonChange(item.val)}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  horizonDays === item.val
                    ? "bg-amber-500 text-gray-950 shadow-md"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Hub Selector */}
          <div className="flex items-center space-x-1.5 bg-gray-900 px-3 py-1.5 rounded-xl border border-gray-800 text-xs">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={facility}
              onChange={handleFacilityChange}
              className="bg-transparent text-gray-200 font-semibold focus:outline-none cursor-pointer"
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
      </div>

      {/* 2. Top 5 KPI Cards: Forecast, Required, Available, Gap, Utilization */}
      {workforceData && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          {/* Forecast Workload */}
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Forecast Workload
            </span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {workforceData.forecast_workload.toLocaleString()}
            </div>
            <span className="text-[10px] text-gray-400">
              {horizonDays === 1 ? "1-day packages" : `${horizonDays}-day packages`}
            </span>
          </div>

          {/* Required Workers */}
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Required Workers
            </span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {workforceData.total_required}
            </div>
            <span className="text-[10px] text-gray-400">calculated daily load</span>
          </div>

          {/* Available Workers */}
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Available Workers
            </span>
            <div className="text-2xl font-extrabold text-amber-400 mt-1">
              {workforceData.total_available}
            </div>
            <span className="text-[10px] text-gray-400">scheduled roster</span>
          </div>

          {/* Labor Gap */}
          <div
            className={`p-4 rounded-2xl border ${
              isShortage
                ? "bg-red-950/20 border-red-500/40 text-red-300"
                : "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
            }`}
          >
            <span className="text-[11px] font-bold uppercase tracking-wider">Labor Gap</span>
            <div className="text-2xl font-extrabold mt-1">
              {workforceData.total_gap > 0
                ? `+${workforceData.total_gap}`
                : workforceData.total_gap}
            </div>
            <span className="text-[10px] opacity-80">
              {isShortage ? "shortage" : "surplus"}
            </span>
          </div>

          {/* Workforce Utilization */}
          <div className="p-4 rounded-2xl bg-gray-900/80 border border-gray-800 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Utilization
            </span>
            <div className="text-2xl font-extrabold text-white mt-1">
              {workforceData.utilization_pct}%
            </div>
            <span className="text-[10px] text-gray-400">of roster capacity</span>
          </div>
        </div>
      )}

      {/* 3. Row 2: Workload Forecast vs Capacity Chart + Staffing Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart: Workload Forecast vs Capacity */}
        <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">WORKLOAD FORECAST vs CAPACITY</h3>
              <p className="text-[11px] text-gray-400">
                Daily expected package volume vs workforce handling threshold
              </p>
            </div>
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Forecast Demand
              </span>
              <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                <span className="w-2.5 h-0.5 bg-blue-400" /> Workforce Capacity
              </span>
            </div>
          </div>

          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={workforceData?.daily_capacity || []}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#252b3b" vertical={false} />
                <XAxis dataKey="day" stroke="#6b7280" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#6b7280"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CapacityTooltip />} />
                <Bar
                  dataKey="forecast_volume"
                  name="Forecast Demand"
                  fill="#FFB500"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="workforce_capacity"
                  name="Workforce Capacity"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staffing Recommendations Card (Math-balanced) */}
        <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              STAFFING RECOMMENDATIONS
            </h3>
          </div>

          <div className="space-y-3">
            {workforceData?.recommendations.map((rec, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-gray-950/60 border border-gray-800/80 space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{rec.icon}</span>
                  <h4 className="text-xs font-bold text-white">{rec.title}</h4>
                </div>
                <p className="text-[11px] text-gray-400 pl-6 leading-relaxed">
                  {rec.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Row 3: Workforce Demand by Shift (The Core Table) */}
      {workforceData?.shifts && (
        <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">WORKFORCE DEMAND BY SHIFT</h3>
              <p className="text-xs text-gray-400">
                Shift-by-shift package workload, required sorters, scheduled headcount, and gaps
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-950/60">
            <table className="w-full text-left text-xs text-gray-300">
              <thead className="bg-gray-900 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-800">
                <tr>
                  <th className="px-4 py-3.5">Operating Shift</th>
                  <th className="px-4 py-3.5 text-right">Volume</th>
                  <th className="px-4 py-3.5 text-right">Required</th>
                  <th className="px-4 py-3.5 text-right">Available</th>
                  <th className="px-4 py-3.5 text-right">Gap</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 font-mono text-xs">
                {workforceData.shifts.map((s) => (
                  <tr key={s.shift} className="hover:bg-gray-800/40">
                    <td className="px-4 py-3.5 font-sans font-bold text-white flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{s.shift} Shift</span>
                    </td>
                    <td className="px-4 py-3.5 text-right text-gray-300">
                      {s.volume.toLocaleString()} pkgs
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-white">
                      {s.required_workers}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-amber-400">
                      {s.available_workers}
                    </td>
                    <td
                      className={`px-4 py-3.5 text-right font-bold ${
                        s.gap < 0 ? "text-red-400" : "text-emerald-400"
                      }`}
                    >
                      {s.gap > 0 ? `+${s.gap}` : s.gap}
                    </td>
                    <td className="px-4 py-3.5 text-center font-sans">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                          s.gap < 0
                            ? "bg-red-500/10 text-red-400 border-red-500/30"
                            : s.gap > 0
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                        }`}
                      >
                        {s.gap < 0 ? "Shortage" : s.gap > 0 ? "Surplus" : "Optimal"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Row 4: Capacity Status Matrix & Planning Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Capacity by Day Status Matrix */}
        <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              CAPACITY BY DAY
            </h3>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center">
            {workforceData?.daily_capacity.map((d) => (
              <div
                key={d.day}
                className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                  d.status === "shortage"
                    ? "bg-red-950/20 border-red-500/40 text-red-300"
                    : d.status === "near_limit"
                    ? "bg-amber-950/20 border-amber-500/40 text-amber-300"
                    : "bg-emerald-950/20 border-emerald-500/40 text-emerald-300"
                }`}
              >
                <div className="font-bold text-[11px] text-white">{d.day}</div>
                <div className="text-sm">
                  {d.status === "shortage" ? "🔴" : d.status === "near_limit" ? "🟡" : "🟢"}
                </div>
                <div className="text-[10px] font-mono opacity-80">{d.utilization_pct}%</div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center space-x-4 text-[10px] text-gray-400 pt-1">
            <span className="flex items-center gap-1">🟢 Normal (&lt;90%)</span>
            <span className="flex items-center gap-1">🟡 Near limit (90–100%)</span>
            <span className="flex items-center gap-1">🔴 Shortage (&gt;100%)</span>
          </div>
        </div>

        {/* Actionable Planning Alerts */}
        <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              PLANNING ALERTS
            </h3>
          </div>

          <div className="space-y-2.5">
            {workforceData?.alerts.map((alert, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-2xl border text-xs flex items-start space-x-2.5 ${
                  alert.severity === "critical"
                    ? "bg-red-950/20 border-red-500/40 text-red-200"
                    : alert.severity === "warning"
                    ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
                    : "bg-emerald-950/20 border-emerald-500/40 text-emerald-200"
                }`}
              >
                <span className="text-sm shrink-0">
                  {alert.severity === "critical"
                    ? "🔴"
                    : alert.severity === "warning"
                    ? "🟠"
                    : "🟢"}
                </span>
                <span className="leading-relaxed font-medium">{alert.message}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 6. Row 5: What-If Scenario Planning (Advanced Feature) */}
      <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              WHAT-IF SCENARIO PLANNING <span className="text-[10px] text-amber-400 font-mono px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">SIMULATOR</span>
            </h3>
          </div>
          <span className="text-xs text-gray-400">
            Simulate demand surges, labor shortages, and overtime policies
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Volume Multiplier */}
          <div className="p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Workload Volume Surge:</span>
              <span className="font-mono font-bold text-amber-400">
                {volMultiplier > 1 ? `+${Math.round((volMultiplier - 1) * 100)}%` : volMultiplier < 1 ? `-${Math.round((1 - volMultiplier) * 100)}%` : "Normal (0%)"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {[-0.1, 0, 0.1, 0.2].map((delta) => {
                const target = 1.0 + delta;
                return (
                  <button
                    key={delta}
                    onClick={() => {
                      setVolMultiplier(target);
                      loadData(facility, horizonDays, target, workerMultiplier, enableOvertime);
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      volMultiplier === target
                        ? "bg-amber-500 text-gray-950 shadow-md"
                        : "bg-gray-900 text-gray-400 hover:text-white"
                    }`}
                  >
                    {delta > 0 ? `+${Math.round(delta * 100)}%` : delta < 0 ? `${Math.round(delta * 100)}%` : "Base"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Workforce Variation */}
          <div className="p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Workforce Availability:</span>
              <span className="font-mono font-bold text-blue-400">
                {workerMultiplier > 1 ? `+${Math.round((workerMultiplier - 1) * 100)}%` : workerMultiplier < 1 ? `-${Math.round((1 - workerMultiplier) * 100)}%` : "Normal (0%)"}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {[-0.1, -0.05, 0, 0.05].map((delta) => {
                const target = 1.0 + delta;
                return (
                  <button
                    key={delta}
                    onClick={() => {
                      setWorkerMultiplier(target);
                      loadData(facility, horizonDays, volMultiplier, target, enableOvertime);
                    }}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      workerMultiplier === target
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-900 text-gray-400 hover:text-white"
                    }`}
                  >
                    {delta > 0 ? `+${Math.round(delta * 100)}%` : delta < 0 ? `${Math.round(delta * 100)}%` : "Base"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Overtime Policy Toggle */}
          <div className="p-3.5 rounded-2xl bg-gray-950/60 border border-gray-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-white block">Authorize Overtime</span>
              <span className="text-[10px] text-gray-400">+15% shift capacity boost</span>
            </div>
            <button
              onClick={() => {
                const newOt = !enableOvertime;
                setEnableOvertime(newOt);
                loadData(facility, horizonDays, volMultiplier, workerMultiplier, newOt);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all cursor-pointer ${
                enableOvertime
                  ? "bg-emerald-500 text-gray-950 shadow-md"
                  : "bg-gray-900 text-gray-400 hover:text-white border border-gray-800"
              }`}
            >
              {enableOvertime ? <Check className="w-3.5 h-3.5" /> : null}
              <span>{enableOvertime ? "Active (✓)" : "Enable"}</span>
            </button>
          </div>
        </div>

        {/* Reset Scenario */}
        {(volMultiplier !== 1.0 || workerMultiplier !== 1.0 || enableOvertime) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={handleResetScenario}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 cursor-pointer font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Scenario to Baseline</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function WorkforcePage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400">Loading workforce plan...</div>}>
      <WorkforceContent />
    </Suspense>
  );
}
