"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import { formatINR } from "@/lib/utils";
import { BarChart3, TrendingUp, Building2, Coins, ArrowRight } from "lucide-react";

export default function ManagerRevenuePage() {
  const [revenueData, setRevenueData] = useState<{
    total_revenue_credits: number;
    parking_breakdown: {
      parking_id: number;
      parking_name: string;
      city: string;
      total_bookings: number;
      revenue_credits: number;
    }[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        setLoading(true);
        const res = await api.get("/manager/revenue");
        setRevenueData(res.data);
      } catch (err) {
        console.error("Failed to load revenue:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="manager" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
        
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-teal-400" />
            Revenue Analytics & Facility Yield
          </h1>
          <p className="text-xs text-slate-500">
            Monitor earnings across your smart parking facilities and booking volumes
          </p>
        </div>

        {/* Total Yield Card */}
        <div className="rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-950/30 via-slate-900 to-slate-950 p-6 backdrop-blur-xl shadow-xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Total Cumulative Revenue
            </span>
            <div className="text-4xl font-black text-slate-800">
              {revenueData?.total_revenue_credits || 0} <span className="text-sm font-bold text-teal-400">Credits</span>
            </div>
            <p className="text-xs text-slate-500">≈ {formatINR(revenueData?.total_revenue_credits || 0)} equivalent gross turnover</p>
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-500/20 text-teal-400">
            <TrendingUp className="h-8 w-8" />
          </div>
        </div>

        {/* Facility Breakdown */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Facility Revenue Breakdown</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-full p-8 text-center text-xs text-slate-500">Loading breakdown...</div>
            ) : revenueData?.parking_breakdown.map((item) => (
              <div
                key={item.parking_id}
                className="p-5 rounded-3xl border border-slate-100 bg-white/60 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-teal-400 px-2 py-0.5 rounded bg-teal-500/10">
                    {item.city}
                  </span>
                  <span className="text-xs font-bold text-slate-500">{item.total_bookings} Bookings</span>
                </div>

                <h4 className="text-base font-bold text-white">{item.parking_name}</h4>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Earned</span>
                  <span className="text-base font-black text-emerald-400">
                    {item.revenue_credits} Credits
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
