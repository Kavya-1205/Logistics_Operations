"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UploadCloud,
  TrendingUp,
  Users,
  Activity,
  Sliders,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "1. Upload Operations Data",
    href: "/upload",
    icon: UploadCloud,
    description: "Input CSV / Excel dataset",
  },
  {
    name: "2. Volume Forecasting",
    href: "/forecast",
    icon: TrendingUp,
    description: "How much work is coming?",
  },
  {
    name: "3. Workforce Planning",
    href: "/workforce",
    icon: Users,
    description: "Do we have enough people?",
  },
  {
    name: "4. Efficiency Dashboard",
    href: "/dashboard",
    icon: Activity,
    description: "KPIs & bottleneck detection",
  },
  {
    name: "5. Resource Optimization",
    href: "/optimization",
    icon: Sliders,
    description: "Reallocate surplus resources",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-[calc(100vh-61px)] bg-[#111319]/95 border-r border-gray-800 p-4 flex flex-col shrink-0 hidden md:flex">
      <div className="space-y-4">
        <p className="px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
          Operations Platform
        </p>
        <nav className="space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname === "/" && item.href === "/upload");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3.5 py-3 rounded-2xl transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border border-amber-500/40 shadow-sm"
                    : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/60 border border-transparent"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-amber-400" : "text-gray-400"
                    }`}
                  />
                  <span className="font-bold text-xs text-white">{item.name}</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 pl-7">{item.description}</p>
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
