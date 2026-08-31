"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Booking } from "@/types";
import { api } from "@/lib/api";
import { formatDateTime, getStatusBadgeClass } from "@/lib/utils";
import Sidebar from "@/components/ui/Sidebar";
import {
  CalendarCheck2,
  Car,
  Clock,
  Coins,
  QrCode,
  MapPin,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function BookingsListPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const url = statusFilter === "ALL" ? "/bookings" : `/bookings?status=${statusFilter}`;
      const res = await api.get<Booking[]>(url);
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to load bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="user" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <CalendarCheck2 className="h-6 w-6 text-emerald-400" />
              My Parking Passes
            </h1>
            <p className="text-xs text-slate-400">
              Manage your active reservations, digital QR passes, and history
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
            {["ALL", "UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  statusFilter === status
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-dashed border-slate-800 bg-slate-900/30 space-y-3">
            <CalendarCheck2 className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No bookings found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You don't have any bookings matching this status.
            </p>
            <Link
              href="/parking"
              className="inline-block px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition shadow-lg shadow-emerald-500/20"
            >
              Find & Reserve Parking →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl transition hover:border-emerald-500/40 hover:shadow-xl"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-mono font-bold text-xs text-white">
                      #{b.booking_number}
                    </span>
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(
                        b.status
                      )}`}
                    >
                      {b.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {b.parking?.name || "Smart Parking Hub"}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1">{b.parking?.address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Plate & Bay</span>
                      <span className="font-bold text-slate-200">
                        {b.vehicle_number} (Bay {b.slot?.slot_number || "A01"})
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Total Paid</span>
                      <span className="font-bold text-emerald-400">{b.credits} Credits</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 space-y-0.5">
                    <div>Valid From: {formatDateTime(b.start_time)}</div>
                    <div>Valid Till: {formatDateTime(b.end_time)}</div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <Link
                    href={`/bookings/${b.id}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:underline"
                  >
                    <QrCode className="h-4 w-4" />
                    Open QR Pass & Details
                  </Link>
                  <ChevronRight className="h-4 w-4 text-slate-500 group-hover:translate-x-1 transition" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
