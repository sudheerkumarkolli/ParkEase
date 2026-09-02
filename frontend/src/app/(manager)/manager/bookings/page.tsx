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
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#F8F9FE]">
      <Sidebar type="manager" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        
        {/* Header */}
        <div className="border-b border-[#EBEAEE] pb-4">
          <h1 className="text-2xl font-black text-[#120D26] flex items-center gap-2">
            <CalendarCheck2 className="h-6 w-6 text-teal-600" />
            Facility Bookings Ledger
          </h1>
          <p className="text-xs text-[#747688] font-medium">
            Search driver reservations, plate numbers, and check-in/check-out timestamps
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#747688]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by pass number, license plate..."
              className="w-full rounded-2xl border border-[#EBEAEE] bg-white pl-10 pr-4 py-3 text-xs font-semibold text-[#120D26] placeholder-[#747688] focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/15 shadow-xs"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F0F1F7] p-1 rounded-2xl border border-[#EBEAEE] text-xs">
            {["ALL", "UPCOMING", "ACTIVE", "COMPLETED", "CANCELLED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  statusFilter === st
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings Table */}
        <div className="overflow-hidden rounded-3xl border border-[#EBEAEE] bg-white shadow-[0_10px_30px_rgba(86,105,255,0.04)]">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#747688] font-medium">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#747688] font-medium">
              No bookings matching criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#EBEAEE] bg-[#F0F1F7] text-[#747688] uppercase font-black text-[10px]">
                  <tr>
                    <th className="p-4">Pass ID</th>
                    <th className="p-4">Vehicle Plate</th>
                    <th className="p-4">Duration</th>
                    <th className="p-4">Credits</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Created Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F1F7]">
                  {bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-[#F0F1F7]/50 transition">
                      <td className="p-4">
                        <span className="inline-block px-2.5 py-1 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 font-mono font-black text-xs shadow-2xs">
                          #{b.booking_number}
                        </span>
                      </td>
                      <td className="p-4 font-mono font-black text-[#120D26]">
                        {b.vehicle_number} <span className="text-[#747688] font-normal">({b.vehicle_type})</span>
                      </td>
                      <td className="p-4 text-[#120D26] font-bold">{b.duration_hours} hrs</td>
                      <td className="p-4 font-black text-teal-700">{b.credits} Cr</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getStatusBadgeClass(
                            b.status
                          )}`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right text-[#747688] text-[11px] font-mono font-medium">
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
