"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Booking, ParkingLocation, Wallet } from "@/types";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import ParkingCard from "@/components/parking/ParkingCard";
import { formatDateTime, getStatusBadgeClass } from "@/lib/utils";
import {
  Wallet as WalletIcon,
  Compass,
  CalendarCheck2,
  QrCode,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Car,
} from "lucide-react";

export default function UserDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [upcomingBooking, setUpcomingBooking] = useState<Booking | null>(null);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [nearbyParkings, setNearbyParkings] = useState<ParkingLocation[]>([]);
  const [totalBookingsCount, setTotalBookingsCount] = useState(0);
  const [totalCreditsSpent, setTotalCreditsSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // 1. Fetch user bookings
        const bookingsRes = await api.get<Booking[]>("/bookings?limit=20");
        const all = bookingsRes.data;
        setTotalBookingsCount(all.length);

        const spent = all
          .filter((b) => b.status !== "CANCELLED")
          .reduce((acc, b) => acc + b.credits, 0);
        setTotalCreditsSpent(spent);

        const active = all.find((b) => b.status === "ACTIVE") || null;
        const upcoming = all.find((b) => b.status === "UPCOMING") || null;
        setActiveBooking(active);
        setUpcomingBooking(upcoming);
        setRecentBookings(all.slice(0, 5));

        // 2. Fetch featured nearby parkings
        const parkingsRes = await api.get<ParkingLocation[]>("/parking?sort_by=slots_desc");
        setNearbyParkings(parkingsRes.data.slice(0, 3));
      } catch (err) {
        console.error("Dashboard data error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="flex">
        <Sidebar type="user" />
        <div className="flex-1 p-8 space-y-6">
          <div className="h-28 rounded-3xl bg-slate-900/60 animate-pulse border border-slate-800" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="h-36 rounded-3xl bg-slate-900/60 animate-pulse border border-slate-800" />
            <div className="h-36 rounded-3xl bg-slate-900/60 animate-pulse border border-slate-800" />
            <div className="h-36 rounded-3xl bg-slate-900/60 animate-pulse border border-slate-800" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="user" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl">
        
        {/* Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/90 via-slate-900/40 to-slate-950 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Driver Command Hub
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Hello, {user?.full_name || "Driver"} 👋
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                {user?.vehicle_number ? `Registered Vehicle: ${user.vehicle_number} (${user.vehicle_type})` : "Find and reserve guaranteed parking spaces in real-time."}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/parking"
                className="flex items-center gap-1.5 px-5 py-3 rounded-2xl text-xs font-extrabold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 transition shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <Compass className="h-4 w-4" />
                Find Parking
              </Link>
            </div>
          </div>
        </div>

        {/* 3 Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Card 1: Wallet Credits */}
          <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-900/90 p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Available Credits</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                <WalletIcon className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{user?.wallet_balance ?? 0}</span>
              <span className="text-xs font-bold text-emerald-400">Credits</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">1 Credit ≈ ₹1</span>
              <Link
                href="/wallet"
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                Top Up <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 2: Total Bookings */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Total Reservations</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400">
                <CalendarCheck2 className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{totalBookingsCount}</span>
              <span className="text-xs text-slate-400">Trips</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">All-time history</span>
              <Link
                href="/bookings"
                className="text-xs font-bold text-teal-400 hover:underline flex items-center gap-1"
              >
                View Ledger <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card 3: Total Credits Spent */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400">Credits Spent</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">{totalCreditsSpent}</span>
              <span className="text-xs text-slate-400">Credits</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">Cumulative parking spend</span>
              <Link
                href="/wallet/transactions"
                className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                Transactions <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

        {/* Live Active / Upcoming Reservation Banner */}
        {(activeBooking || upcomingBooking) && (
          <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 p-6 shadow-2xl backdrop-blur-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                    {activeBooking ? "Currently Parked (Active Session)" : "Upcoming Confirmed Reservation"}
                  </span>
                </div>

                <h3 className="text-xl font-extrabold text-white">
                  Booking #{activeBooking?.booking_number || upcomingBooking?.booking_number}
                </h3>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <div className="flex items-center gap-1">
                    <Car className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Plate: {activeBooking?.vehicle_number || upcomingBooking?.vehicle_number}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-teal-400" />
                    <span>
                      {formatDateTime(activeBooking?.start_time || upcomingBooking?.start_time)} - {formatDateTime(activeBooking?.end_time || upcomingBooking?.end_time)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/bookings/${activeBooking?.id || upcomingBooking?.id}`}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 transition shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                <QrCode className="h-4 w-4" />
                Open QR Smart Pass
              </Link>
            </div>
          </div>
        )}

        {/* Nearby Parking Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-white">Featured Smart Parking Hubs</h2>
              <p className="text-xs text-slate-400">Real-time availability near city centers</p>
            </div>
            <Link
              href="/parking"
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
            >
              See All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {nearbyParkings.map((p) => (
              <ParkingCard key={p.id} parking={p} />
            ))}
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-white">Recent Activity</h2>
              <p className="text-xs text-slate-400">Your latest parking sessions and status</p>
            </div>
            <Link
              href="/bookings"
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
            >
              View Full History <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            {recentBookings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No recent bookings found. Start by exploring parking hubs!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-semibold text-[10px]">
                    <tr>
                      <th className="p-4">Booking ID</th>
                      <th className="p-4">Vehicle</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Credits</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {recentBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-4 font-mono font-bold text-white">{b.booking_number}</td>
                        <td className="p-4 text-slate-300">
                          {b.vehicle_number} ({b.vehicle_type})
                        </td>
                        <td className="p-4 text-slate-400">{b.duration_hours} hrs</td>
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
                        <td className="p-4 text-right">
                          <Link
                            href={`/bookings/${b.id}`}
                            className="text-xs font-bold text-emerald-400 hover:underline"
                          >
                            Pass →
                          </Link>
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
