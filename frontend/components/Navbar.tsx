"use client";

import React from "react";
import Link from "next/link";
import { Truck } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#111319]/95 backdrop-blur-md border-b border-gray-800 px-4 lg:px-8 py-3.5">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand only - no redundant right corner buttons */}
        <Link href="/upload" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <Truck className="w-5 h-5 text-gray-950 font-bold" />
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              UPS <span className="text-amber-400 font-bold text-xs px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">OPERATIONS PLATFORM</span>
            </span>
            <p className="text-[11px] text-gray-400">Predictive Analytics & Workforce Planning</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
