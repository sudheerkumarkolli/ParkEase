"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Booking, ParkingLocation } from "@/types";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import ParkingCard from "@/components/parking/ParkingCard";
import { formatDateTime, getStatusBadgeClass } from "@/lib/utils";
import {
  Car,
  CalendarCheck2,
  Wallet,
  Clock,
  Compass,
  MapPin,
  ChevronRight,
  Sparkles,
  QrCode,
  ArrowRight,
  TrendingUp,
  Plus,
  ShieldCheck,
  Zap,
  Navigation,
} from "lucide-react";
import GPSPromptModal from "@/components/location/GPSPromptModal";

export default function UserDashboard() {
  const { user } = useAuth();
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [nearbyParkings, setNearbyParkings] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [gpsLocation, setGpsLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const savedCoords = localStorage.getItem("parkease_gps_coords");
    if (savedCoords) {
      try {
        setGpsLocation(JSON.parse(savedCoords));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [bookingsRes, parkingsRes] = await Promise.all([
          api.get<Booking[]>("/bookings?limit=5"),
          api.get<ParkingLocation[]>("/parking?limit=4"),
        ]);
        setActiveBookings(bookingsRes.data);
        setNearbyParkings(parkingsRes.data);
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#F8F9FE]">
      {/* GPS Location Prompt on Login */}
      <GPSPromptModal onLocationDetected={(coords) => setGpsLocation(coords)} />

      <Sidebar type="user" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        
        {/* Welcome Header Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-[#5669FF] p-6 sm:p-8 text-white shadow-xl shadow-[#5669FF]/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-0.5 text-xs font-bold text-white backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Driver Smart Pass Portal</span>
                </div>
                {gpsLocation ? (
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-0.5 text-[11px] font-black text-slate-950 shadow-sm">
                    <Navigation className="h-3 w-3 fill-slate-950" />
                    <span>GPS Active 🟢</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem("parkease_gps_prompted");
                      localStorage.removeItem("parkease_gps_status");
                      window.location.reload();
                    }}
                    className="inline-flex items-center gap-1 rounded-full bg-amber-300 hover:bg-amber-400 px-3 py-0.5 text-[11px] font-black text-slate-950 shadow-sm cursor-pointer transition"
                  >
                    <Navigation className="h-3 w-3" />
                    <span>Enable GPS 🛰️</span>
                  </button>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Welcome Back, {user?.full_name?.split(" ")[0] || "Driver"}!
              </h1>
              <p className="text-xs sm:text-sm text-white/80 font-medium">
                Manage your real-time parking passes, digital QR entries, and instant wallet credits.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/parking"
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black text-[#5669FF] bg-white hover:bg-slate-100 shadow-md active:scale-95 transition-all"
              >
                <Compass className="h-4 w-4" />
                <span>Find Parking Hubs</span>
              </Link>
              <Link
                href="/map"
                className="flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition"
              >
                <MapPin className="h-4 w-4" />
                <span>Live GPS Map</span>
              </Link>
            </div>
          </div>

          {/* Glowing Background Ring */}
          <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        </div>

        {/* 3 Metric Cards with EventHub Squircles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Card 1: Wallet Balance */}
          <div className="rounded-3xl border border-[#EBEAEE] bg-white p-5 shadow-[0_10px_30px_rgba(86,105,255,0.05)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#747688]">Available Credits</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#5669FF]/10 text-[#5669FF]">
                <Wallet className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#120D26]">
              {user?.wallet_balance ?? 0} <span className="text-sm font-bold text-[#5669FF]">Credits</span>
            </div>
            <Link
              href="/wallet"
              className="inline-flex items-center gap-1 text-xs font-black text-[#5669FF] hover:underline"
            >
              Top-up Credits <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Card 2: Registered Vehicle */}
          <div className="rounded-3xl border border-[#EBEAEE] bg-white p-5 shadow-[0_10px_30px_rgba(86,105,255,0.05)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#747688]">Active Vehicle</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F0635A]/10 text-[#F0635A]">
                <Car className="h-4 w-4" />
              </div>
            </div>
            <div className="text-xl font-mono font-black text-[#120D26]">
              {user?.vehicle_number || "Not Registered"}
            </div>
            <span className="inline-block text-[11px] font-bold text-[#747688]">
              {user?.vehicle_type || "Standard Vehicle"}
            </span>
          </div>

          {/* Card 3: Total Passes */}
          <div className="rounded-3xl border border-[#EBEAEE] bg-white p-5 shadow-[0_10px_30px_rgba(86,105,255,0.05)] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#747688]">Total Passes</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#29D697]/10 text-[#29D697]">
                <CalendarCheck2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#120D26]">
              {activeBookings.length} <span className="text-sm font-bold text-[#747688]">Passes</span>
            </div>
            <Link
              href="/bookings"
              className="inline-flex items-center gap-1 text-xs font-black text-[#29D697] hover:underline"
            >
              View Passes <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Active Smart Passes Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-[#120D26]">My Active Parking Passes</h2>
            <Link
              href="/bookings"
              className="text-xs font-bold text-[#5669FF] hover:underline flex items-center gap-1"
            >
              All Passes <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#EBEAEE] bg-white shadow-[0_10px_30px_rgba(86,105,255,0.04)]">
            {loading ? (
              <div className="p-8 text-center text-xs text-[#747688]">Loading active passes...</div>
            ) : activeBookings.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5669FF]/10 text-[#5669FF]">
                  <Car className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-black text-[#120D26]">No Active Parking Passes</h3>
                <p className="text-xs text-[#747688] max-w-sm mx-auto font-medium">
                  You don't have any upcoming reservations. Explore nearby smart facilities to reserve a slot!
                </p>
                <Link
                  href="/parking"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#5669FF] hover:bg-[#4657E5] shadow-md shadow-[#5669FF]/20 transition"
                >
                  <Compass className="h-3.5 w-3.5" />
                  <span>Reserve a Bay Now</span>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-[#EBEAEE] bg-[#F0F1F7] text-[#747688] uppercase font-black text-[10px]">
                    <tr>
                      <th className="p-4">Pass No.</th>
                      <th className="p-4">Vehicle Plate</th>
                      <th className="p-4">Schedule</th>
                      <th className="p-4">Duration</th>
                      <th className="p-4">Credits</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Digital Pass</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F0F1F7]">
                    {activeBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-[#F0F1F7]/50 transition">
                        <td className="p-4 font-mono font-black text-[#120D26]">#{b.booking_number}</td>
                        <td className="p-4 font-mono font-bold text-[#120D26]">
                          {b.vehicle_number} <span className="text-[#747688] font-normal">({b.vehicle_type})</span>
                        </td>
                        <td className="p-4 text-[#747688] font-medium">{formatDateTime(b.start_time)}</td>
                        <td className="p-4 text-[#747688]">{b.duration_hours} hrs</td>
                        <td className="p-4 font-black text-[#5669FF]">{b.credits} Cr</td>
                        <td className="p-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusBadgeClass(
                              b.status
                            )}`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Link
                            href={`/bookings/${b.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#5669FF]/10 text-[#5669FF] hover:bg-[#5669FF] hover:text-white font-black transition shadow-sm"
                          >
                            <QrCode className="h-3.5 w-3.5" />
                            <span>View QR</span>
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

        {/* Nearby Facilities Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-[#120D26]">Nearby Parking Facilities</h2>
            <Link
              href="/parking"
              className="text-xs font-bold text-[#5669FF] hover:underline flex items-center gap-1"
            >
              Explore Hubs <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {nearbyParkings.map((p) => (
              <ParkingCard key={p.id} parking={p} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
