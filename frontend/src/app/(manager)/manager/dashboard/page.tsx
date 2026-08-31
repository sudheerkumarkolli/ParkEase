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
} from "lucide-react";

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
      <div className="flex">
        <Sidebar type="manager" />
        <div className="flex-1 p-8 space-y-6">
          <div className="h-28 rounded-3xl bg-slate-900/60 animate-pulse border border-slate-800" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-3xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const { stats, recent_bookings, daily_bookings_chart, revenue_chart } = data;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="manager" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl">
        
        {/* Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400">
              Operations Center
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Parking Manager Dashboard
            </h1>
            <p className="text-xs text-slate-400">
              Real-time occupancy tracking, QR verification scanner, and slot control
            </p>
          </div>

          <Link
            href="/manager/scanner"
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-300 hover:from-teal-300 transition shadow-lg shadow-teal-500/20 active:scale-95"
          >
            <QrCode className="h-4 w-4" />
            Open Gate QR Scanner
          </Link>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          {/* Stat 1: Total Slots */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl space-y-2">
            <span className="text-xs font-bold text-slate-400">Total Bays</span>
            <div className="text-3xl font-black text-white">{stats.total_slots}</div>
            <div className="text-[11px] text-slate-400">Across {data.parking_locations_count} facilities</div>
          </div>

          {/* Stat 2: Occupancy % */}
          <div className="rounded-3xl border border-teal-500/30 bg-teal-950/20 p-5 backdrop-blur-xl space-y-2">
            <span className="text-xs font-bold text-teal-400">Occupancy</span>
            <div className="text-3xl font-black text-white">{stats.current_occupancy_percent}%</div>
            <div className="text-[11px] text-teal-300 font-semibold">
              {stats.occupied_slots} Occupied · {stats.reserved_slots} Reserved
            </div>
          </div>

          {/* Stat 3: Available Slots */}
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-5 backdrop-blur-xl space-y-2">
            <span className="text-xs font-bold text-emerald-400">Available Bays</span>
            <div className="text-3xl font-black text-emerald-400">{stats.available_slots}</div>
            <div className="text-[11px] text-emerald-300/80">Ready for booking</div>
          </div>

          {/* Stat 4: Today Revenue */}
          <div className="rounded-3xl border border-amber-500/30 bg-amber-950/20 p-5 backdrop-blur-xl space-y-2">
            <span className="text-xs font-bold text-amber-400">Today's Revenue</span>
            <div className="text-3xl font-black text-amber-400">{stats.today_revenue} Cr</div>
            <div className="text-[11px] text-amber-300/80">{stats.today_bookings} Bookings today</div>
          </div>
        </div>

        {/* 2 Recharts: Daily Bookings & Revenue Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Daily Bookings */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Car className="h-4 w-4 text-teal-400" />
                Booking Inflow (Last 7 Days)
              </h3>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={daily_bookings_chart}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "1rem",
                      fontSize: "12px",
                    }}
                  />
                  <Bar dataKey="bookings" fill="#14b8a6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Revenue Trend */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                Revenue Curve (Credits)
              </h3>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenue_chart}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "1rem",
                      fontSize: "12px",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
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
            <h3 className="text-base font-bold text-white">Live Facility Bookings</h3>
            <Link
              href="/manager/bookings"
              className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1"
            >
              View Full List <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            {recent_bookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No active bookings recorded.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-4">Pass ID</th>
                      <th className="p-4">Vehicle Plate</th>
                      <th className="p-4">Start Time</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Credits</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {recent_bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4 font-mono font-bold text-white">#{b.booking_number}</td>
                        <td className="p-4 font-mono text-slate-200">
                          {b.vehicle_number} ({b.vehicle_type})
                        </td>
                        <td className="p-4 text-slate-400">{formatDateTime(b.start_time)}</td>
                        <td className="p-4 text-slate-300">{b.duration_hours} hrs</td>
                        <td className="p-4 font-bold text-emerald-400">{b.credits} Cr</td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(
                              b.status
                            )}`}
                          >
                            {b.status}
                          </span>
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
