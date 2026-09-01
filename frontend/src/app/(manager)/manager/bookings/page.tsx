"use client";

import React, { useState, useEffect } from "react";
import { Booking } from "@/types";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import { formatDateTime, getStatusBadgeClass } from "@/lib/utils";
import {
  CalendarCheck2,
  Search,
  Filter,
  Car,
  Clock,
  Coins,
  QrCode,
} from "lucide-react";

export default function ManagerBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let url = "/manager/bookings?limit=100";
      if (statusFilter !== "ALL") url += `&status=${statusFilter}`;
      if (searchQuery.trim()) url += `&query=${encodeURIComponent(searchQuery.trim())}`;
      const res = await api.get<Booking[]>(url);
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to load manager bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, searchQuery]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="manager" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        
        {/* Header */}
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6 text-teal-400" />
            Facility Bookings Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Search driver reservations, plate numbers, and check-in/check-out timestamps
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by pass number, license plate..."
              className="w-full rounded-2xl border border-slate-100 bg-white/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-teal-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 text-xs">
            {["ALL", "UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  statusFilter === st
                    ? "bg-teal-400 text-slate-950 shadow-md"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white/60 backdrop-blur-xl shadow-xl">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No bookings matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-950/70 text-slate-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-4">Pass ID</th>
                    <th className="p-4">Vehicle Plate</th>
                    <th className="p-4">Start Time</th>
                    <th className="p-4">End Time</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Credits</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Entry / Exit Log</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/30 transition">
                      <td className="p-4 font-mono font-bold text-white">#{b.booking_number}</td>
                      <td className="p-4 font-mono font-bold text-slate-200">
                        {b.vehicle_number} ({b.vehicle_type})
                      </td>
                      <td className="p-4 text-slate-500">{formatDateTime(b.start_time)}</td>
                      <td className="p-4 text-slate-500">{formatDateTime(b.end_time)}</td>
                      <td className="p-4 text-slate-600">{b.duration_hours} hrs</td>
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
                      <td className="p-4 text-slate-500 text-[11px] font-mono">
                        {b.entry_time ? `In: ${formatDateTime(b.entry_time)}` : "Not checked in"}
                        {b.exit_time ? ` · Out: ${formatDateTime(b.exit_time)}` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
