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
  Settings,
  ArrowRight,
  Layers,
  FileCheck,
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
      <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
        <Sidebar type="admin" />
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

  const { stats, recent_users, recent_bookings, user_growth_chart, revenue_chart, popular_parkings } = data;

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar type="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl">
        
        {/* Banner with Clear Action Buttons */}
        <div className="relative overflow-hidden rounded-3xl border border-purple-300 bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 p-6 sm:p-8 shadow-xl text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/20 border border-purple-400/30 px-3 py-0.5 text-xs font-bold text-purple-300">
                <Shield className="h-3.5 w-3.5" />
                <span>Master Administration Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Admin Control Center
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                Manage all registered users, approve facility hubs, review bookings, and monitor financial liquidity.
              </p>
            </div>

            {/* Prominent Visible Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/users"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 active:scale-95 transition-all"
              >
                <Users className="h-4 w-4" />
                <span>Manage Users</span>
              </Link>
              <Link
                href="/admin/parking"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-extrabold text-slate-900 bg-emerald-400 hover:bg-emerald-300 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
              >
                <Building2 className="h-4 w-4" />
                <span>Parking Approvals</span>
              </Link>
              <Link
                href="/admin/transactions"
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 border border-white/20 transition backdrop-blur-md"
              >
                <CreditCard className="h-4 w-4" />
                <span>Financial Ledger</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Users</span>
            <div className="text-3xl font-black text-slate-900">{stats.total_users}</div>
            <div className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full inline-block">
              {stats.total_managers} Facility Managers
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parking Network</span>
            <div className="text-3xl font-black text-slate-900">{stats.total_parking_locations}</div>
            <div className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full inline-block">
              {stats.total_parking_slots} Smart Bays
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Bookings</span>
            <div className="text-3xl font-black text-emerald-600">{stats.active_bookings}</div>
            <div className="text-[11px] font-medium text-slate-500">{stats.today_bookings} Bookings today</div>
          </div>

          <div className="rounded-3xl border border-purple-200 bg-purple-50/60 p-5 shadow-sm space-y-2">
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Platform Turnover</span>
            <div className="text-3xl font-black text-purple-900">{stats.total_credits_spent} Cr</div>
            <div className="text-[11px] font-bold text-purple-600">{stats.total_credits_issued} Credits Issued</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* User Growth */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              Cumulative User Growth (Last 7 Days)
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={user_growth_chart}>
                  <defs>
                    <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
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
                    dataKey="total_users"
                    stroke="#9333ea"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorUser)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue Curve */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Daily Credit Spend Curve
            </h3>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenue_chart}>
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
                  <Bar dataKey="revenue" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Popular Locations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-slate-900">Top Performing Smart Parking Facilities</h3>
            <Link
              href="/admin/parking"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 hover:underline flex items-center gap-1"
            >
              All Locations <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {popular_parkings.map((p) => (
              <div key={p.id} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-2 hover:border-purple-300 transition">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-purple-700 px-2 py-0.5 rounded-full bg-purple-100 border border-purple-200">
                    {p.city}
                  </span>
                  <span className="text-xs font-bold text-amber-500 flex items-center gap-0.5">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                    {p.rating.toFixed(1)}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{p.name}</h4>
                <div className="text-xs text-slate-500">{p.bookings} Total Bookings Processed</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
