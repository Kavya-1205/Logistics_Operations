"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  MapPin,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Package,
  Boxes,
  AlertTriangle,
  Flame,
  Gauge,
  Layers,
  Clock,
  RefreshCw,
  TrendingUp,
  Truck,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ForecastResponse } from "@/types";
import { fetchForecastData, fetchDatasetInfo } from "@/lib/api";

const TimelineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const isActual = payload.some((p: any) => p.dataKey?.startsWith("actual_") && p.value !== null);
    return (
      <div className="bg-gray-950/95 border border-gray-800 p-3 rounded-2xl shadow-2xl text-xs space-y-1 min-w-[180px]">
        <div className="flex items-center justify-between pb-1 border-b border-gray-800">
          <span className="font-bold text-white">{label}</span>
          <span
            className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
              isActual
                ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
            }`}
          >
            {isActual ? "Historical Actual" : "Forecast"}
          </span>
        </div>
        {payload.map((entry: any, index: number) => {
          if (entry.value === null || entry.value === undefined) return null;
          return (
            <div key={index} className="flex items-center justify-between gap-3 pt-0.5">
              <span className="flex items-center gap-1.5 text-gray-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                {entry.name}:
              </span>
              <span className="font-mono font-bold text-white">
                {entry.value.toLocaleString()} pkgs
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

function ForecastContent() {
  // Top Filters
  const [facility, setFacility] = useState<string>("All");
  const [anchorDate, setAnchorDate] = useState<string>("2025-12-31");
  const [horizonDays, setHorizonDays] = useState<number>(7);

  const [facilities, setFacilities] = useState<string[]>([
    "F01-Chennai",
    "F02-Bangalore",
    "F03-Hyderabad",
    "F04-Mumbai",
  ]);
  const [forecastData, setForecastData] = useState<ForecastResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async (
    targetFacility: string,
    targetHorizon: number,
    targetAnchor: string
  ) => {
    setIsLoading(true);
    try {
      const data = await fetchForecastData(
        targetFacility,
        targetHorizon,
        targetAnchor
      );
      setForecastData(data);
    } catch (err) {
      console.error("Error loading forecast data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasetInfo().then((summary) => {
      if (summary?.facilities && summary.facilities.length > 0) {
        setFacilities(summary.facilities);
      }
      if (summary?.date_max) {
        setAnchorDate(summary.date_max);
        loadData(facility, horizonDays, summary.date_max);
      } else {
        loadData(facility, horizonDays, anchorDate);
      }
    });
  }, []);

  const handleFacilityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFacility = e.target.value;
    setFacility(newFacility);
    loadData(newFacility, horizonDays, anchorDate);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setAnchorDate(newDate);
    loadData(facility, horizonDays, newDate);
  };

  const handleHorizonChange = (days: number) => {
    setHorizonDays(days);
    localStorage.setItem("ups_selected_horizon", days.toString());
    loadData(facility, days, anchorDate);
  };

  const handleGenerate = () => {
    loadData(facility, horizonDays, anchorDate);
  };

  const summary = forecastData?.summary;
  const inventory = forecastData?.inventory;
  const peakRisk = forecastData?.peak_risk;
  const capacity = forecastData?.capacity_impact;
  const timeline = forecastData?.combined_timeline || [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-2">
      {/* Title */}
      <div>
        <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1">
          MODULE 1 — VOLUME FORECASTING
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          How much work is coming?
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
          Predict future inbound arrivals, outbound dispatches, inventory movements, and total workload.
        </p>
      </div>

      {/* 1. Filter Controls Bar */}
      <div className="ups-glass-card rounded-3xl p-5 border border-gray-800 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
            {/* Hub Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" /> Hub:
              </label>
              <select
                value={facility}
                onChange={handleFacilityChange}
                className="w-full bg-gray-900 text-gray-200 text-xs font-semibold rounded-xl px-3 py-2 border border-gray-700 focus:outline-none focus:border-amber-500 cursor-pointer"
              >
                <option value="All">All Hubs (Network)</option>
                {facilities.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            {/* Anchor Date Picker (e.g. 2025-12-31) */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-400" /> Forecast From Date:
              </label>
              <input
                type="date"
                value={anchorDate}
                onChange={handleDateChange}
                className="w-full bg-gray-900 text-gray-200 text-xs font-semibold rounded-xl px-3 py-2 border border-gray-700 focus:outline-none focus:border-amber-500 font-mono cursor-pointer"
              />
            </div>
          </div>

          {/* Horizon Selection Buttons & Generate Trigger */}
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-gray-400 block">Forecast Horizon:</label>
              <div className="flex items-center bg-gray-900 rounded-xl p-1 border border-gray-800 text-xs">
                {[
                  { label: "Next Day", val: 1 },
                  { label: "Next 7 Days", val: 7 },
                  { label: "Next 30 Days", val: 30 },
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => handleHorizonChange(item.val)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                      horizonDays === item.val
                        ? "bg-amber-500 text-gray-950 shadow-md"
                        : "text-gray-400 hover:text-gray-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-gray-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Calculating..." : "Generate Forecast"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top 3 KPI Cards: Inbound, Outbound, Total Workload */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* INBOUND */}
        <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-400" /> INBOUND
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              ↑ {summary ? Math.abs(summary.inbound_trend_pct) : "8.4"}%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {summary
              ? (horizonDays === 1 ? summary.next_day_inbound : summary.total_inbound).toLocaleString()
              : "448,012"}{" "}
            <span className="text-xs font-semibold text-gray-400">pkgs</span>
          </div>
          <div className="text-[11px] text-gray-400">
            {horizonDays === 1 ? "Next-day arrival volume" : `Next ${horizonDays}-day arrival volume`}
          </div>
        </div>

        {/* OUTBOUND */}
        <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-blue-400" /> OUTBOUND
            </span>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              ↑ {summary ? Math.abs(summary.outbound_trend_pct) : "11.2"}%
            </span>
          </div>
          <div className="text-3xl font-extrabold text-blue-400">
            {summary
              ? (horizonDays === 1 ? summary.next_day_outbound : summary.total_outbound).toLocaleString()
              : "497,036"}{" "}
            <span className="text-xs font-semibold text-gray-400">pkgs</span>
          </div>
          <div className="text-[11px] text-gray-400">
            {horizonDays === 1 ? "Next-day dispatch volume" : `Next ${horizonDays}-day dispatch volume`}
          </div>
        </div>

        {/* TOTAL WORKLOAD */}
        <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" /> TOTAL WORKLOAD
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {summary
              ? (horizonDays === 1
                  ? summary.next_day_inbound + summary.next_day_outbound
                  : summary.total_forecast_volume
                ).toLocaleString()
              : "945,048"}{" "}
            <span className="text-xs font-semibold text-gray-400">packages</span>
          </div>
          <div className="text-[11px] text-gray-400">Total combined package movements</div>
        </div>
      </div>

      {/* 3. Actual vs Forecast Timeline Graph */}
      <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white">Actual vs Forecast Volume Timeline</h3>
            <p className="text-xs text-gray-400">
              Past 7 Days (Actuals prior to {anchorDate}) → Next {horizonDays} Days (Forecast)
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs">
            <span className="flex items-center gap-1.5 text-gray-300 font-medium">
              <span className="w-3 h-1 bg-blue-500 rounded-full" /> Actual Volume (Past)
            </span>
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <span className="w-3 h-1 bg-amber-400 rounded-full" /> Forecast (Future)
            </span>
          </div>
        </div>

        <div className="h-[280px] sm:h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeline} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#252b3b" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#374151" }}
                tickFormatter={(val) => {
                  if (!val) return "";
                  const parts = val.split("-");
                  return parts.length >= 3 ? `${parts[1]}/${parts[2]}` : val;
                }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<TimelineTooltip />} />

              {/* Historical Actual Line */}
              <Line
                type="monotone"
                dataKey="actual_total"
                name="Historical Actual"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 4, fill: "#3B82F6" }}
                connectNulls={false}
              />

              {/* Forecast Line */}
              <Line
                type="monotone"
                dataKey="pred_total"
                name="Predicted Workload"
                stroke="#FFB500"
                strokeWidth={3}
                strokeDasharray="4 4"
                dot={{ r: 5, fill: "#FFB500", strokeWidth: 2, stroke: "#111" }}
                activeDot={{ r: 7, fill: "#FFF", stroke: "#FFB500" }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4 & 5. Inventory Movement and Peak Risk Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* INVENTORY MOVEMENT */}
        <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Boxes className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">INVENTORY MOVEMENT</h4>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Current Inventory:</span>
              <span className="font-mono font-bold text-white">
                {inventory ? inventory.current_inventory.toLocaleString() : "70,400"} pkgs
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Expected Inventory:</span>
              <span className="font-mono font-bold text-amber-400">
                {inventory ? inventory.expected_inventory.toLocaleString() : "86,400"} pkgs
              </span>
            </div>
          </div>

          {/* Alert Badge */}
          <div
            className={`p-3 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
              inventory?.status === "increasing"
                ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
            }`}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              {inventory ? inventory.message : "⚠️ Inventory is expected to increase"}
            </span>
          </div>
        </div>

        {/* PEAK / RISK DAY */}
        <div className="ups-glass-card rounded-3xl p-6 border border-gray-800 space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Flame className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-white text-sm">PEAK / RISK DAY</h4>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-gray-400">
              <span>Peak Date:</span>
              <span className="font-bold text-white">{peakRisk ? peakRisk.peak_date : "Dec 31"}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Peak Volume:</span>
              <span className="font-mono font-bold text-red-400">
                {peakRisk ? peakRisk.peak_volume.toLocaleString() : "137,933"} packages
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 font-bold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
            <span>
              ⚠️ Peak expected: Prepare additional workforce for peak period.
            </span>
          </div>
        </div>
      </div>

      {/* 6. Action Button: Plan Workforce */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-[#181a24] to-[#181a24] border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-white text-base">Next Step: Workforce Planning</h4>
          <p className="text-xs text-gray-400 mt-0.5">
            Convert this volume forecast into required sorter & handler manpower across shifts.
          </p>
        </div>
        <Link
          href={`/workforce?facility=${facility}&horizon=${horizonDays}`}
          className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-sm shadow-xl shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 shrink-0 hover:scale-[1.02] cursor-pointer"
        >
          <span>Plan Workforce →</span>
        </Link>
      </div>

      {/* Model Performance Footnote */}
      {forecastData?.metrics && (
        <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800 flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Model Evaluation: <strong className="text-gray-200">+{forecastData.metrics.accuracy_improvement_pct}% more accurate</strong> than standard moving average baseline.
            </span>
          </div>
          <div className="text-[11px] font-mono text-gray-500">
            XGBoost MAE: {forecastData.metrics.xgboost_mae} vs Baseline: {forecastData.metrics.baseline_mae}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ForecastPage() {
  return (
    <Suspense fallback={<div className="text-center py-12 text-gray-400">Loading forecast...</div>}>
      <ForecastContent />
    </Suspense>
  );
}
