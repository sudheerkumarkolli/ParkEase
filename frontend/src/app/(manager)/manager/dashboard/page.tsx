"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ManagerDashboardData } from "@/types";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import { formatDateTime, getStatusBadgeClass } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import {
  LayoutDashboard,
  QrCode,
  Layers,
  Building2,
  TrendingUp,
  Clock,
  Car,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  PlusCircle,
} from "lucide-react";
import GPSPromptModal from "@/components/location/GPSPromptModal";

export default function ManagerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get<ManagerDashboardData>("/manager/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load manager dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
        <Sidebar type="manager" />
        <div className="flex-1 p-8 space-y-6">
          <div className="h-28 rounded-3xl bg-white animate-pulse border border-slate-200" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-3xl bg-white animate-pulse border border-slate-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { stats, recent_bookings, daily_bookings_chart, revenue_chart } = data;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      {/* GPS Location Prompt on Manager Login */}
      <GPSPromptModal />

      <Sidebar type="manager" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl">
        
        {/* Banner with Clear Action Buttons */}
        <div className="relative overflow-hidden rounded-3xl border border-teal-300 bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 p-6 sm:p-8 shadow-xl text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 border border-teal-400/30 px-3 py-0.5 text-xs font-bold text-teal-300">
                <Building2 className="h-3.5 w-3.5" />
                <span>Facility Operations Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Facility Manager Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Scan driver digital smart passes at entry/exit gates, control slot status, and view bay occupancy.
              </p>
            </div>

            {/* High-Visibility Primary Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/manager/scanner"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-300 hover:from-teal-300 shadow-lg shadow-teal-500/30 active:scale-95 transition-all"
              >
                <QrCode className="h-4 w-4" />
                <span>Open QR Gate Scanner</span>
              </Link>
              <Link
                href="/manager/slots"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold text-white bg-teal-700 hover:bg-teal-600 shadow-md shadow-teal-700/20 active:scale-95 transition-all"
              >
                <Layers className="h-4 w-4" />
                <span>Slot Grid Control</span>
              </Link>
              <Link
                href="/manager/parking/add"
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 transition backdrop-blur-md"
              >
                <PlusCircle className="h-4 w-4 text-teal-300" />
                <span>Add Hub</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bays</span>
            <div className="text-3xl font-black text-slate-900">{stats.total_slots}</div>
            <div className="text-[11px] font-semibold text-slate-500">Across {data.parking_locations_count} facilities</div>
          </div>

          <div className="rounded-3xl border border-teal-200 bg-teal-50/60 p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">Occupancy</span>
            <div className="text-3xl font-black text-teal-900">{stats.current_occupancy_percent}%</div>
            <div className="text-[11px] text-teal-700 font-bold">
              {stats.occupied_slots} Occupied · {stats.reserved_slots} Reserved
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Available Bays</span>
            <div className="text-3xl font-black text-emerald-700">{stats.available_slots}</div>
            <div className="text-[11px] text-emerald-600 font-semibold">Ready for drivers</div>
          </div>

          <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Today's Revenue</span>
            <div className="text-3xl font-black text-amber-900">{stats.today_revenue} Cr</div>
            <div className="text-[11px] text-amber-700 font-bold">{stats.today_bookings} Bookings processed</div>
          </div>
        </div>

        {/* 2 Recharts: Daily Bookings & Revenue Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Car className="h-4 w-4 text-teal-600" />
                Booking Inflow (Last 7 Days)
              </h3>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily_bookings_chart}>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="bookings" fill="#0d9488" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Revenue Curve (Credits)
              </h3>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue_chart}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.75rem",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRev)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Facility Bookings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">Live Facility Passes & Verification</h3>
            <Link
              href="/manager/bookings"
              className="text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline flex items-center gap-1"
            >
              Full Bookings Ledger <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#EBEAEE] bg-white shadow-[0_10px_30px_rgba(86,105,255,0.04)]">
            {recent_bookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#747688]">No active bookings recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#EBEAEE] bg-[#F0F1F7] text-[#747688] uppercase font-black text-[10px]">
                    <tr>
                      <th className="p-4">Pass ID</th>
                      <th className="p-4">Vehicle Plate</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Credits</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Created Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F1F7]">
                    {recent_bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-[#F0F1F7]/50 transition">
                        <td className="p-4 font-mono font-black text-teal-800">
                          <span className="inline-block px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-mono font-black text-xs">
                            #{b.booking_number}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-black text-[#120D26]">
                          {b.vehicle_number} <span className="text-[#747688] font-normal">({b.vehicle_type})</span>
                        </td>
                        <td className="p-4 text-[#120D26] font-bold">{b.duration_hours} hrs</td>
                        <td className="p-4 font-black text-teal-700">{b.credits} Cr</td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusBadgeClass(
                              b.status
                            )}`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 text-right text-[#747688] text-[11px] font-mono font-medium">
                          {formatDateTime(b.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
