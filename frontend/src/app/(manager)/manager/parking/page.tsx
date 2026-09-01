"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ParkingLocation } from "@/types";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import { formatDateTime } from "@/lib/utils";
import {
  Building2,
  Plus,
  MapPin,
  Clock,
  Layers,
  Coins,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ManagerParkingListPage() {
  const [parkings, setParkings] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchParkings = async () => {
    try {
      setLoading(true);
      const res = await api.get<ParkingLocation[]>("/parking?status=ALL");
      setParkings(res.data);
    } catch (err) {
      console.error("Failed to load parkings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkings();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this parking hub? Make sure no active bookings exist.")) {
      return;
    }
    try {
      await api.delete(`/parking/${id}`);
      await fetchParkings();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete parking location");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="manager" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-teal-400" />
              Manage Parking Facilities
            </h1>
            <p className="text-xs text-slate-500">
              Configure rates, operating hours, amenities, and slot counts for your facilities
            </p>
          </div>

          <Link
            href="/manager/parking/add"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-950 bg-gradient-to-r from-teal-400 to-emerald-300 hover:from-teal-300 transition shadow-lg shadow-teal-500/20 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add New Facility
          </Link>
        </div>

        {/* Facilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full p-12 text-center text-xs text-slate-500">
              Loading facilities...
            </div>
          ) : parkings.length === 0 ? (
            <div className="col-span-full p-12 text-center rounded-3xl border border-dashed border-slate-100 bg-white/30 space-y-3">
              <Building2 className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No facilities registered</h3>
              <Link
                href="/manager/parking/add"
                className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-teal-400"
              >
                Register Your First Facility
              </Link>
            </div>
          ) : (
            parkings.map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-100 bg-white/60 p-5 backdrop-blur-xl space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">
                      {p.city || "Hub"}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === "ACTIVE"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-amber-500/10 text-amber-400"
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{p.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Total Bays</span>
                      <span className="font-bold text-white">{p.total_slots} Slots</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Hourly Rate</span>
                      <span className="font-bold text-emerald-400">{p.price_per_hour} Cr/hr</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    <span>Operating Hours: {p.opening_time} - {p.closing_time}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/manager/slots?parking_id=${p.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-teal-400 hover:underline"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Manage Bays
                  </Link>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Delete location"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
