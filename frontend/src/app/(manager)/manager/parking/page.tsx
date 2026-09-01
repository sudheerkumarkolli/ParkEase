"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ParkingLocation } from "@/types";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import { formatDateTime, getStatusBadgeClass } from "@/lib/utils";
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Building2 className="h-6 w-6 text-teal-600" />
              Manage Parking Facilities
            </h1>
            <p className="text-xs text-slate-500">
              Configure rates, operating hours, amenities, and slot counts for your facilities
            </p>
          </div>

          <Link
            href="/manager/parking/add"
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-md active:scale-95"
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
            <div className="col-span-full p-12 text-center rounded-3xl border border-dashed border-slate-300 bg-white space-y-3 shadow-sm">
              <Building2 className="h-10 w-10 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">No facilities registered</h3>
              <Link
                href="/manager/parking/add"
                className="inline-block px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm"
              >
                Register Your First Facility
              </Link>
            </div>
          ) : (
            parkings.map((p) => (
              <div
                key={p.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200">
                      {p.city || "Hub"}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(
                        p.status
                      )}`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-slate-900">{p.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{p.address}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block">Total Bays</span>
                      <span className="font-bold text-slate-900">{p.total_slots} Slots</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-medium block">Hourly Rate</span>
                      <span className="font-bold text-emerald-700">{p.price_per_hour} Cr/hr</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-teal-600" />
                    <span>Operating Hours: {p.opening_time} - {p.closing_time}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/manager/slots?parking_id=${p.id}`}
                    className="flex items-center gap-1 text-xs font-bold text-teal-700 hover:text-teal-800 hover:underline"
                  >
                    <Layers className="h-3.5 w-3.5" />
                    Manage Bays
                  </Link>

                  <button
                    onClick={() => handleDelete(p.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
