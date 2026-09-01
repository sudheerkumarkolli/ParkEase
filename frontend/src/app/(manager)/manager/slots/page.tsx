"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ParkingLocation, ParkingSlot, SlotStatus } from "@/types";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import SlotMatrix from "@/components/parking/SlotMatrix";
import {
  Layers,
  Plus,
  ShieldAlert,
  CheckCircle2,
  Trash2,
  AlertCircle,
  Building,
} from "lucide-react";

function SlotManagementContent() {
  const searchParams = useSearchParams();
  const [parkings, setParkings] = useState<ParkingLocation[]>([]);
  const [selectedParkingId, setSelectedParkingId] = useState<number | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [loading, setLoading] = useState(true);

  // Batch slot create form modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [batchPrefix, setBatchPrefix] = useState("C");
  const [batchCount, setBatchCount] = useState(10);
  const [batchVehicle, setBatchVehicle] = useState("Car");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        setLoading(true);
        const res = await api.get<ParkingLocation[]>("/parking?status=ALL");
        setParkings(res.data);

        const qPid = searchParams.get("parking_id");
        if (qPid) {
          setSelectedParkingId(parseInt(qPid));
        } else if (res.data.length > 0) {
          setSelectedParkingId(res.data[0].id);
        }
      } catch (err) {
        console.error("Failed to load parkings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchParkings();
  }, [searchParams]);

  const loadSlots = async () => {
    if (!selectedParkingId) return;
    try {
      const res = await api.get<ParkingSlot[]>(`/parking/${selectedParkingId}/slots`);
      setSlots(res.data);
    } catch (err) {
      console.error("Failed to load slots:", err);
    }
  };

  useEffect(() => {
    loadSlots();
  }, [selectedParkingId]);

  const handleToggleStatus = async (slotId: number, currentStatus: SlotStatus) => {
    const nextStatus = currentStatus === "AVAILABLE" ? "MAINTENANCE" : "AVAILABLE";
    try {
      await api.put(`/slots/${slotId}`, {
        status: nextStatus,
      });
      await loadSlots();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update slot status");
    }
  };

  const handleBatchCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParkingId) return;
    setAdding(true);
    try {
      await api.post(`/parking/${selectedParkingId}/slots/batch`, {
        prefix: batchPrefix,
        count: batchCount,
        vehicle_type: batchVehicle,
      });
      setShowAddModal(false);
      await loadSlots();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to add slots");
    } finally {
      setAdding(false);
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
              <Layers className="h-6 w-6 text-teal-400" />
              Parking Slot Grid & Bay Control
            </h1>
            <p className="text-xs text-slate-500">
              Click on any bay to toggle between Available and Maintenance state
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-950 bg-teal-400 hover:bg-teal-300 transition shadow-lg shadow-teal-500/20 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Add Bays (Batch)
            </button>
          </div>
        </div>

        {/* Facility Selector Dropdown */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/60 border border-slate-100">
          <Building className="h-4 w-4 text-teal-400" />
          <span className="text-xs font-semibold text-slate-600">Active Facility:</span>
          <select
            value={selectedParkingId || ""}
            onChange={(e) => setSelectedParkingId(parseInt(e.target.value))}
            aria-label="Active Parking Facility"
            className="rounded-xl border border-slate-100 bg-slate-950 px-3 py-2 text-xs text-white focus:border-teal-500 focus:outline-none flex-1 max-w-md"
          >
            {parkings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.city}) - {p.total_slots} Bays Total
              </option>
            ))}
          </select>
        </div>

        {/* Interactive Matrix with Manager Mode */}
        <SlotMatrix
          slots={slots}
          isManager={true}
          onToggleStatus={handleToggleStatus}
        />

        {/* Batch Add Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
            <div className="max-w-md w-full rounded-3xl border border-slate-100 bg-white p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-white">Batch Add Parking Bays</h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-500 hover:text-white">
                  ✕
                </button>
              </div>

              <form onSubmit={handleBatchCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Section Prefix</label>
                    <input
                      type="text"
                      maxLength={2}
                      required
                      value={batchPrefix}
                      onChange={(e) => setBatchPrefix(e.target.value.toUpperCase())}
                      placeholder="C"
                      className="w-full rounded-2xl border border-slate-100 bg-slate-950 p-3 text-xs uppercase font-bold text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Number of Bays</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      required
                      value={batchCount}
                      onChange={(e) => setBatchCount(parseInt(e.target.value))}
                      className="w-full rounded-2xl border border-slate-100 bg-slate-950 p-3 text-xs text-white focus:border-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vehicle Type</label>
                  <select
                    value={batchVehicle}
                    onChange={(e) => setBatchVehicle(e.target.value)}
                    className="w-full rounded-2xl border border-slate-100 bg-slate-950 p-3 text-xs text-white focus:border-teal-500 focus:outline-none"
                  >
                    <option value="Car">Car</option>
                    <option value="SUV">SUV</option>
                    <option value="Bike">Bike</option>
                    <option value="EV">EV</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-50 text-xs font-semibold text-slate-600 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="flex-1 py-2.5 rounded-xl bg-teal-400 text-xs font-bold text-slate-950 hover:bg-teal-300 transition disabled:opacity-50"
                  >
                    {adding ? "Creating..." : "Generate Bays"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function ManagerSlotsPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-slate-500">Loading slot matrix...</div>}>
      <SlotManagementContent />
    </Suspense>
  );
}
