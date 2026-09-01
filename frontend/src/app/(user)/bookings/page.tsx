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
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar type="user" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <CalendarCheck2 className="h-6 w-6 text-emerald-600" />
              My Parking Passes
            </h1>
            <p className="text-xs text-slate-500">
              Manage your active reservations, digital QR smart passes, and trip history
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs shadow-sm">
            {["ALL", "UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  statusFilter === status
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
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
              <div key={i} className="h-48 rounded-3xl bg-white animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border border-dashed border-slate-300 bg-white space-y-3 shadow-sm">
            <CalendarCheck2 className="h-10 w-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No bookings found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You don't have any bookings matching the current status filter.
            </p>
            <Link
              href="/parking"
              className="inline-block px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 transition shadow-md"
            >
              Find & Reserve Parking →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-400 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="font-mono font-bold text-xs text-slate-900">
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
                    <h3 className="font-bold text-sm text-slate-900 group-hover:text-emerald-700 transition">
                      {b.parking?.name || "Smart Parking Hub"}
                    </h3>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{b.parking?.address || "Guaranteed reserved parking bay"}</span>
                    </div>
                  </div>


                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Car className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Vehicle</span>
                      </div>
                      <div className="font-semibold text-slate-800">
                        {b.vehicle_number} ({b.vehicle_type})
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-teal-600" />
                        <span>Slot</span>
                      </div>
                      <div className="font-semibold text-slate-800">
                        Bay #{b.slot_id}
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-3 text-xs space-y-1 border border-slate-100">
                    <div className="flex justify-between text-slate-500">
                      <span>Schedule:</span>
                      <span className="font-semibold text-slate-800">
                        {formatDateTime(b.start_time)}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Credits:</span>
                      <span className="font-bold text-emerald-700">
                        {b.credits} Credits (₹{b.credits})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Created: {formatDateTime(b.created_at)}
                  </span>
                  <Link
                    href={`/bookings/${b.id}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 hover:bg-emerald-600 transition shadow-sm"
                  >
                    <QrCode className="h-3.5 w-3.5" />
                    <span>View Smart Pass</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
