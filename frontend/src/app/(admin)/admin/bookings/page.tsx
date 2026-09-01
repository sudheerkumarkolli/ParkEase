"use client";

import React, { useState, useEffect } from "react";
import { Booking } from "@/types";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import { formatDateTime, getStatusBadgeClass } from "@/lib/utils";
import { CalendarCheck2, Search, Filter } from "lucide-react";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBookings = async () => {
    try {
      setLoading(true);
      let url = "/admin/bookings?limit=100";
      if (statusFilter !== "ALL") url += `&status=${statusFilter}`;
      if (searchQuery.trim()) url += `&query=${encodeURIComponent(searchQuery.trim())}`;
      const res = await api.get<Booking[]>(url);
      setBookings(res.data);
    } catch (err) {
      console.error("Failed to load admin bookings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [statusFilter, searchQuery]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6 text-purple-400" />
            Global Bookings Master Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Audit all customer reservations, slot assignments, and status transitions system-wide
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by booking number, plate number..."
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none shadow-sm"
            />
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs shadow-sm">
            {["ALL", "UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  statusFilter === st
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No bookings recorded.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Pass ID</th>
                    <th className="p-4">Vehicle Plate</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Credits</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 font-mono font-black text-xs shadow-xs">
                          #{b.booking_number}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {b.vehicle_number} <span className="text-slate-500 font-normal">({b.vehicle_type})</span>
                      </td>
                      <td className="p-4 text-slate-700 font-semibold">{b.duration_hours} hrs</td>
                      <td className="p-4 font-black text-emerald-700">{b.credits} Cr</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeClass(
                            b.status
                          )}`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-slate-700 text-[11px] font-mono">
                        {formatDateTime(b.created_at)}
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
