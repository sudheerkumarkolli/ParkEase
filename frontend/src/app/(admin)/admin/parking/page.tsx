"use client";

import React, { useState, useEffect } from "react";
import { ParkingLocation } from "@/types";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import {
  Building2,
  CheckCircle2,
  XCircle,
  Trash2,
  Power,
  Search,
  Filter,
} from "lucide-react";

export default function AdminParkingManagementPage() {
  const [parkings, setParkings] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchParkings = async () => {
    try {
      setLoading(true);
      let url = "/admin/parking";
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchQuery.trim()) params.append("query", searchQuery.trim());
      if (params.toString()) url += `?${params.toString()}`;

      const res = await api.get<ParkingLocation[]>(url);
      setParkings(res.data);
    } catch (err) {
      console.error("Failed to load parkings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkings();
  }, [statusFilter, searchQuery]);

  const handleStatusChange = async (parkingId: number, newStatus: string) => {
    try {
      await api.put(`/admin/parking/${parkingId}/status?status=${newStatus}`);
      await fetchParkings();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update status");
    }
  };

  const handleDelete = async (parkingId: number) => {
    if (!confirm("Are you sure you want to permanently delete this parking location?")) return;
    try {
      await api.delete(`/admin/parking/${parkingId}`);
      await fetchParkings();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete parking location");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Building2 className="h-6 w-6 text-purple-400" />
            Global Parking Facility Approvals & Directory
          </h1>
          <p className="text-xs text-slate-400">
            Review manager submissions, approve new parking hubs, and control directory visibility
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
              placeholder="Search by facility name, city, address..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
            {["ALL", "ACTIVE", "PENDING", "INACTIVE"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  statusFilter === st
                    ? "bg-purple-500 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading facilities...</div>
          ) : parkings.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No parking facilities found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-4">Facility Name & City</th>
                    <th className="p-4">Address</th>
                    <th className="p-4">Capacity</th>
                    <th className="p-4">Rate</th>
                    <th className="p-4">Listing Status</th>
                    <th className="p-4 text-right">Moderation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {parkings.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <div className="font-bold text-white">{p.name}</div>
                        <span className="text-[10px] text-purple-400 font-bold uppercase">
                          {p.city || "Urban Hub"}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 max-w-xs truncate">{p.address}</td>
                      <td className="p-4 font-bold text-slate-200">
                        {p.available_slots} / {p.total_slots} Bays
                      </td>
                      <td className="p-4 font-bold text-emerald-400">{p.price_per_hour} Cr/hr</td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : p.status === "PENDING"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {p.status === "PENDING" && (
                            <button
                              onClick={() => handleStatusChange(p.id, "ACTIVE")}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Approve
                            </button>
                          )}

                          {p.status === "ACTIVE" ? (
                            <button
                              onClick={() => handleStatusChange(p.id, "INACTIVE")}
                              className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                            >
                              Deactivate
                            </button>
                          ) : p.status === "INACTIVE" ? (
                            <button
                              onClick={() => handleStatusChange(p.id, "ACTIVE")}
                              className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            >
                              Activate
                            </button>
                          ) : null}

                          <button
                            onClick={() => handleDelete(p.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10"
                            title="Delete facility"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
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
