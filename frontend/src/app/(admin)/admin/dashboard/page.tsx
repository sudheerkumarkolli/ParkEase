"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AdminDashboardData } from "@/types";
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
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Shield,
  Users,
  Building2,
  CalendarCheck2,
  CreditCard,
  TrendingUp,
  Activity,
  ChevronRight,
  Star,
} from "lucide-react";

export default function AdminDashboard() {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const res = await api.get<AdminDashboardData>("/admin/dashboard");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load admin dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex">
        <Sidebar type="admin" />
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

  const { stats, recent_users, recent_bookings, user_growth_chart, revenue_chart, popular_parkings } = data;

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl">
        
        {/* Banner */}
        <div className="border-b border-slate-800 pb-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-purple-400">
            System Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-center gap-2">
            <Shield className="h-7 w-7 text-purple-400" />
            ParkEase Master Dashboard
          </h1>
          <p className="text-xs text-slate-400">
            Global metrics, driver base, facility approvals, and platform financials
          </p>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl space-y-2">
            <span className="text-xs font-bold text-slate-400">Total Users</span>
            <div className="text-3xl font-black text-white">{stats.total_users}</div>
            <div className="text-[11px] text-purple-400">{stats.total_managers} Facility Managers</div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl space-y-2">
            <span className="text-xs font-bold text-slate-400">Parking Network</span>
            <div className="text-3xl font-black text-white">{stats.total_parking_locations}</div>
            <div className="text-[11px] text-teal-400">{stats.total_parking_slots} Total Smart Bays</div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl space-y-2">
            <span className="text-xs font-bold text-slate-400">Active Bookings</span>
            <div className="text-3xl font-black text-emerald-400">{stats.active_bookings}</div>
            <div className="text-[11px] text-slate-400">{stats.today_bookings} Bookings today</div>
          </div>

          <div className="rounded-3xl border border-purple-500/30 bg-purple-950/20 p-5 backdrop-blur-xl space-y-2">
            <span className="text-xs font-bold text-purple-400">Platform Turnover</span>
            <div className="text-3xl font-black text-purple-300">{stats.total_credits_spent} Cr</div>
            <div className="text-[11px] text-purple-400/80">{stats.total_credits_issued} Credits Issued</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* User Growth */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-400" />
              Cumulative User Growth (Last 7 Days)
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={user_growth_chart}>
                  <defs>
                    <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
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
                    dataKey="total_users"
                    stroke="#a855f7"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorUser)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Curve */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              Daily Credit Spend Curve
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue_chart}>
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
                  <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Popular Locations */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Top Performing Smart Parking Facilities</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {popular_parkings.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-purple-400 px-2 py-0.5 rounded bg-purple-500/10">
                    {p.city}
                  </span>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5">
                    <Star className="h-3 w-3 fill-amber-400" />
                    {p.rating.toFixed(1)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white line-clamp-1">{p.name}</h4>
                <div className="text-xs text-slate-400">{p.bookings} Total Bookings Processed</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
