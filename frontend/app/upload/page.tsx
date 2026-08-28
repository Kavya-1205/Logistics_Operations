"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Database,
  ArrowRight,
  RefreshCw,
  MapPin,
  Calendar,
  Clock,
  RotateCcw,
} from "lucide-react";
import { uploadOperationsFile } from "@/lib/api";
import { DatasetSummary } from "@/types";

export default function UploadPage() {
  const router = useRouter();
  const [dataset, setDataset] = useState<DatasetSummary | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({ type: "idle", message: "" });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. On Mount: Check if a dataset was already uploaded in this session to persist it
  useEffect(() => {
    const saved = localStorage.getItem("ups_active_dataset");
    if (saved) {
      try {
        const parsed: DatasetSummary = JSON.parse(saved);
        setDataset(parsed);
      } catch (e) {
        console.error("Failed to parse saved dataset", e);
      }
    }
  }, []);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus({ type: "idle", message: "Reading and validating records..." });

    const res = await uploadOperationsFile(file);
    setIsUploading(false);

    if (res.success && res.summary) {
      setDataset(res.summary);
      localStorage.setItem("ups_active_dataset", JSON.stringify(res.summary));
      
      setUploadStatus({
        type: "success",
        message: `Validated ${res.summary.total_records.toLocaleString()} records successfully!`,
      });
    } else {
      setUploadStatus({
        type: "error",
        message: res.message || "Failed to process dataset. Check column names.",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleContinue = () => {
    router.push("/forecast");
  };

  const handleResetUpload = () => {
    setDataset(null);
    localStorage.removeItem("ups_active_dataset");
    setUploadStatus({ type: "idle", message: "" });
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center max-w-3xl mx-auto py-6 space-y-6">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Upload Operations Data
        </h1>
        <p className="text-xs sm:text-sm text-gray-400">
          Upload your UPS logistics spreadsheet (<code className="text-amber-400 font-mono">.csv</code> or <code className="text-amber-400 font-mono">.xlsx</code>)
        </p>
      </div>

      {/* 1. Drag & Drop Zone */}
      {!dataset ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`ups-glass-card rounded-3xl p-10 sm:p-14 border-2 border-dashed transition-all text-center cursor-pointer ${
            isDragging
              ? "border-amber-400 bg-amber-500/10 scale-[1.01]"
              : "border-gray-700 hover:border-amber-500/60 bg-[#161822]"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />

          <div className="max-w-sm mx-auto space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
              {isUploading ? (
                <RefreshCw className="w-8 h-8 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">
                {isUploading ? "Validating Spreadsheet..." : "Upload CSV / Excel File"}
              </h3>
              <p className="text-xs text-gray-400">Supports .csv and .xlsx operational data</p>
            </div>

            <button
              type="button"
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-bold text-xs shadow-md transition-colors cursor-pointer"
            >
              Browse File
            </button>
          </div>
        </div>
      ) : null}

      {/* Error / Upload Status */}
      {uploadStatus.type === "error" && (
        <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{uploadStatus.message}</span>
        </div>
      )}

      {/* 2. Clean Validated Dataset Summary */}
      {dataset && (
        <div className="ups-glass-card rounded-3xl p-6 sm:p-8 border border-emerald-500/40 bg-gradient-to-br from-[#122019]/40 to-[#181b24] space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                Active Operations Dataset
              </span>
              <div className="flex items-center space-x-2 mt-0.5">
                <h3 className="text-lg font-extrabold text-white">{dataset.filename}</h3>
                <span className="bg-emerald-500/10 text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Dataset Validated
                </span>
              </div>
            </div>

            <button
              onClick={handleResetUpload}
              className="text-xs text-gray-400 hover:text-amber-400 flex items-center gap-1.5 self-start sm:self-center transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Upload different file</span>
            </button>
          </div>

          {/* 4 Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
            <div className="p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800">
              <div className="text-xs text-gray-400 mb-1 flex items-center justify-center sm:justify-start gap-1">
                <Database className="w-3.5 h-3.5 text-amber-400" /> Records
              </div>
              <div className="text-xl font-extrabold text-white">
                {dataset.total_records.toLocaleString()}
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800">
              <div className="text-xs text-gray-400 mb-1 flex items-center justify-center sm:justify-start gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-400" /> Hubs
              </div>
              <div className="text-xl font-extrabold text-white">{dataset.facilities.length} Hubs</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800">
              <div className="text-xs text-gray-400 mb-1 flex items-center justify-center sm:justify-start gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Date Range
              </div>
              <div className="text-xs font-bold text-white mt-1">{dataset.date_min}</div>
              <div className="text-[10px] text-gray-400">to {dataset.date_max}</div>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-900/80 border border-gray-800">
              <div className="text-xs text-gray-400 mb-1 flex items-center justify-center sm:justify-start gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Shifts
              </div>
              <div className="text-xl font-extrabold text-white">
                {dataset.shifts.length} per day
              </div>
            </div>
          </div>

          {/* Clean Historical Data Scope */}
          <div className="p-4 rounded-2xl bg-gray-950/70 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-amber-400" />
              <span className="font-semibold text-gray-300">Historical Operational Scope:</span>
            </div>
            <span className="bg-gray-900 text-amber-300 font-mono font-bold px-3 py-1.5 rounded-xl border border-gray-700">
              Entire Dataset ({dataset.date_min} → {dataset.date_max})
            </span>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              onClick={handleContinue}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-gray-950 font-black text-sm shadow-xl shadow-amber-500/20 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <span>Continue to Forecast</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
