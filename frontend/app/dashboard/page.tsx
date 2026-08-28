"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Activity,
  Gauge,
  Clock,
  Zap,
  MapPin,
  ArrowRight,
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
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { EfficiencyDashboardData } from "@/types";
import { fetchEfficiencyDashboardData, fetchDatasetInfo } from "@/lib/api";

const EfficiencyTooltip = ({ active, payload, label }: any) => {
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
              {entry.name.includes("Efficiency") ? `${entry.value}%` : `${entry.value?.toLocaleString()} pkgs/hr`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function DashboardContent() {
  const searchParams = useSearchParams();
  const facilityParam = searchParams.get("facility") || "All";

  const [facility, setFacility] = useState<string>(facilityParam);
  const [facilities, setFacilities] = useState<string[]>([
    "F01-Chennai",
    "F02-Bangalore",
    "F03-Hyderabad",
    "F04-Mumbai",
  ]);
  const [dashboardData, setDashboardData] = useState<EfficiencyDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async (fac: string) => {
    setIsLoading(true);
    try {
      const data = await fetchEfficiencyDashboardData(fac);
      setDashboardData(data);
    } catch (err) {
      console.error(err);
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
    loadData(facility);
  }, []);

  const handleFacilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFacility(val);
    loadData(val);
  };

  const kpis = dashboardData?.kpis;
  const flow = dashboardData?.operational_flow || [];
  const bottleneck = dashboardData?.bottleneck;
  const trend = dashboardData?.efficiency_trend || [];
  const area = dashboardData?.area_summary;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Header & Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
            MODULE 3 — OPERATIONS EFFICIENCY DASHBOARD
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Efficiency & Performance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
            Establish KPIs • Measure flow efficiency • Track throughput & cycle times • Identify bottlenecks
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

      {/* 1. Four Core KPI Cards with Benchmarks */}
      {kpis && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Efficiency Score */}
          <div className="p-5 rounded-3xl bg-gray-900/80 border border-gray-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-400" /> Efficiency Score
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                Target: {kpis.efficiency_benchmark}%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-1">
              {kpis.efficiency_score}%
            </div>
            <span
              className={`text-[11px] font-semibold block ${
                kpis.efficiency_score >= kpis.efficiency_benchmark
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >
              {kpis.efficiency_score >= kpis.efficiency_benchmark
                ? "✓ Exceeding benchmark"
                : `${(kpis.efficiency_benchmark - kpis.efficiency_score).toFixed(1)}% below target`}
            </span>
          </div>

          {/* Network Throughput */}
          <div className="p-5 rounded-3xl bg-gray-900/80 border border-gray-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-blue-400" /> Throughput
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                Target: {kpis.throughput_benchmark.toLocaleString()}
              </span>
            </div>
            <div className="text-3xl font-extrabold text-blue-400 mt-1">
              {kpis.throughput.toLocaleString()}{" "}
              <span className="text-xs font-semibold text-gray-400">pkgs/hr</span>
            </div>
            <span className="text-[11px] text-gray-400 block">
              Average parcel processing rate
            </span>
          </div>

          {/* Average Cycle Time */}
          <div className="p-5 rounded-3xl bg-gray-900/80 border border-gray-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-purple-400" /> Avg Cycle Time
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                Target: {kpis.cycle_time_benchmark}m
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-1">
              {kpis.cycle_time}{" "}
              <span className="text-xs font-semibold text-gray-400">mins</span>
            </div>
            <span
              className={`text-[11px] font-semibold block ${
                kpis.cycle_time <= kpis.cycle_time_benchmark
                  ? "text-emerald-400"
                  : "text-red-400"
              }`}
            >
              {kpis.cycle_time <= kpis.cycle_time_benchmark
                ? "✓ Within SLA cycle target"
                : `+${(kpis.cycle_time - kpis.cycle_time_benchmark).toFixed(1)}m excess dwell time`}
            </span>
          </div>

          {/* Capacity Utilization */}
          <div className="p-5 rounded-3xl bg-gray-900/80 border border-gray-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-emerald-400" /> Utilization
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                Optimal: 85–90%
              </span>
            </div>
            <div className="text-3xl font-extrabold text-white mt-1">
              {kpis.capacity_utilization}%
            </div>
            <span className="text-[11px] text-gray-400 block">
              Active facility sorting load
            </span>
          </div>
        </div>
      )}

      {/* 2. Operational Flow: Inbound -> Sortation -> Outbound */}
      <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            OPERATIONAL FLOW (END-TO-END)
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Stage-by-stage efficiency and cycle time tracking to locate bottlenecks
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
          {flow.map((stage, idx) => (
            <div
              key={stage.stage}
              className={`p-4 rounded-2xl border transition-all ${
                stage.status === "bottleneck"
                  ? "bg-red-950/30 border-red-500/50 shadow-lg shadow-red-950/20"
                  : "bg-gray-900/60 border-gray-800"
              }`}
            >
              <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-gray-800 text-[11px] flex items-center justify-center font-mono">
                    {idx + 1}
                  </span>
                  {stage.stage}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    stage.status === "bottleneck"
                      ? "bg-red-500/20 text-red-400 border-red-500/40 animate-pulse"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  }`}
                >
                  {stage.status === "bottleneck" ? "⚠️ Bottleneck" : "Optimal"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 text-center">
                <div className="p-2 rounded-xl bg-gray-950/60">
                  <span className="text-[10px] text-gray-400 block">Efficiency</span>
                  <span className="text-lg font-bold text-white">{stage.efficiency_pct}%</span>
                </div>
                <div className="p-2 rounded-xl bg-gray-950/60">
                  <span className="text-[10px] text-gray-400 block">Cycle Time</span>
                  <span className="text-lg font-bold text-white">{stage.cycle_time_mins}m</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                {stage.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Bottleneck Detector & Operational Performance Insight */}
      {bottleneck && (
        <div className="p-6 rounded-3xl bg-red-950/20 border border-red-500/40 space-y-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <h3 className="text-sm font-bold text-red-300 uppercase tracking-wider">
              BOTTLENECK DETECTOR & PERFORMANCE INSIGHT
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-gray-950/80 border border-red-500/30">
              <span className="text-gray-400 block">Identified Bottleneck:</span>
              <span className="font-bold text-white text-sm">{bottleneck.identified_stage}</span>
            </div>
            <div className="p-3 rounded-2xl bg-gray-950/80 border border-red-500/30">
              <span className="text-gray-400 block">Excess Cycle Delay:</span>
              <span className="font-mono font-bold text-red-400 text-sm">+{bottleneck.excess_delay_mins} mins</span>
            </div>
            <div className="p-3 rounded-2xl bg-gray-950/80 border border-red-500/30">
              <span className="text-gray-400 block">Throughput Impact:</span>
              <span className="font-mono font-bold text-amber-400 text-sm">-{bottleneck.throughput_impact_pct}% loss</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-gray-950/90 border border-gray-800 text-xs space-y-1">
            <span className="font-bold text-amber-400">Recommended Action:</span>
            <p className="text-gray-300 leading-relaxed font-medium">
              {bottleneck.recommended_action}
            </p>
          </div>
        </div>
      )}

      {/* 4. Efficiency vs Benchmark: 7-Day Trend Chart */}
      <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              EFFICIENCY vs BENCHMARK (7-DAY TREND)
            </h3>
            <p className="text-xs text-gray-400">
              Daily operational efficiency score compared against target benchmark (88%)
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-3 h-1 bg-amber-400 rounded-full" /> Actual Efficiency (%)
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <span className="w-3 h-0.5 bg-gray-500" /> Target Benchmark (88%)
            </span>
          </div>
        </div>

        <div className="h-[240px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252b3b" vertical={false} />
              <XAxis dataKey="day" stroke="#6b7280" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                domain={[70, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<EfficiencyTooltip />} />
              <ReferenceLine y={88} stroke="#6b7280" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="actual_efficiency"
                name="Actual Efficiency"
                stroke="#FFB500"
                strokeWidth={3}
                dot={{ r: 4, fill: "#FFB500" }}
                activeDot={{ r: 6, fill: "#FFF", stroke: "#FFB500" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Operational Area Summary: Inbound | Outbound | Inventory */}
      {area && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Inbound Operations */}
          <div className="ups-glass-card rounded-3xl p-5 border border-gray-800 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Package className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">INBOUND OPERATIONS</h4>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Efficiency Score:</span>
                <span className="font-mono font-bold text-white">{area.inbound.efficiency_pct}%</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Total Volume:</span>
                <span className="font-mono font-bold text-gray-200">
                  {area.inbound.total_volume?.toLocaleString()} pkgs
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Intake Cycle:</span>
                <span className="font-mono font-bold text-gray-200">{area.inbound.cycle_time_mins} mins</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{area.inbound.status}</span>
            </div>
          </div>

          {/* Outbound Operations */}
          <div className="ups-glass-card rounded-3xl p-5 border border-gray-800 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Truck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">OUTBOUND OPERATIONS</h4>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Efficiency Score:</span>
                <span className="font-mono font-bold text-white">{area.outbound.efficiency_pct}%</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>On-Time Dispatch:</span>
                <span className="font-mono font-bold text-emerald-400">{area.outbound.on_time_dispatch_pct}%</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Dock Turnaround:</span>
                <span className="font-mono font-bold text-gray-200">{area.outbound.cycle_time_mins} mins</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{area.outbound.status}</span>
            </div>
          </div>

          {/* Inventory Operations */}
          <div className="ups-glass-card rounded-3xl p-5 border border-gray-800 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Boxes className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-white text-sm">INVENTORY OPERATIONS</h4>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Accuracy & Flow:</span>
                <span className="font-mono font-bold text-white">{area.inventory.efficiency_pct}%</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Staged Inventory:</span>
                <span className="font-mono font-bold text-gray-200">
                  {area.inventory.staged_inventory?.toLocaleString()} pkgs
                </span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Accumulation:</span>
                <span className="font-mono font-bold text-emerald-400">{area.inventory.accumulation_status}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 text-xs font-semibold flex items-center gap-1.5">
              <span>{area.inventory.status}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400">Loading efficiency dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
