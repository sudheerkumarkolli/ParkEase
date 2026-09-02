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

  // Single slot create modal
  const [showSingleModal, setShowSingleModal] = useState(false);
  const [singleSlotNumber, setSingleSlotNumber] = useState("");
  const [singleVehicle, setSingleVehicle] = useState("Car");
  const [singleFloor, setSingleFloor] = useState("Level 1");
  const [singleDescription, setSingleDescription] = useState("");
  const [singleImageUrl, setSingleImageUrl] = useState("https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1000&auto=format&fit=crop&q=80");

  // Batch slot create form modal
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchPrefix, setBatchPrefix] = useState("C");
  const [batchCount, setBatchCount] = useState(10);
  const [batchVehicle, setBatchVehicle] = useState("Car");
  const [batchFloor, setBatchFloor] = useState("Level 1");
  const [batchImageUrl, setBatchImageUrl] = useState("https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1000&auto=format&fit=crop&q=80");
  
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

  const handleSingleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParkingId || !singleSlotNumber.trim()) return;
    setAdding(true);
    try {
      await api.post(`/parking/${selectedParkingId}/slots`, {
        slot_number: singleSlotNumber.trim().toUpperCase(),
        vehicle_type: singleVehicle,
        floor_level: singleFloor,
        description: singleDescription,
        image_url: singleImageUrl,
        status: "AVAILABLE",
      });
      setShowSingleModal(false);
      setSingleSlotNumber("");
      setSingleDescription("");
      await loadSlots();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to add parking bay");
    } finally {
      setAdding(false);
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
        floor_level: batchFloor,
        image_url: batchImageUrl,
      });
      setShowBatchModal(false);
      await loadSlots();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to add slots");
    } finally {
      setAdding(false);
    }
  };

  const activeParking = parkings.find((p) => p.id === selectedParkingId);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="manager" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Layers className="h-6 w-6 text-teal-600" />
              Parking Bay Inventory & Internal Visuals
            </h1>
            <p className="text-xs text-slate-500">
              Add individual or batch bays with internal visual photos, floor levels, and real-time status toggles
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSingleModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 transition shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add Single Bay
            </button>

            <button
              onClick={() => setShowBatchModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 transition shadow-md active:scale-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Batch Add Bays
            </button>
          </div>
        </div>

        {/* Facility Selector Dropdown */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
          <Building className="h-4 w-4 text-teal-600" />
          <span className="text-xs font-bold text-slate-700">Active Facility:</span>
          <select
            value={selectedParkingId || ""}
            onChange={(e) => setSelectedParkingId(parseInt(e.target.value))}
            aria-label="Active Parking Facility"
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none flex-1 max-w-md"
          >
            {parkings.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.city}) - {p.total_slots} Bays Total
              </option>
            ))}
          </select>
        </div>

        {/* Interactive Matrix with Manager Mode & Eye Visual Buttons */}
        <SlotMatrix
          slots={slots}
          isManager={true}
          onToggleStatus={handleToggleStatus}
          facilityName={activeParking?.name}
          facilityPrice={activeParking?.price_per_hour}
        />

        {/* Add Single Bay Modal with Internal Visual Image Upload/URL */}
        {showSingleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="max-w-lg w-full rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-slate-900">Add New Parking Bay with Internal Visual</h3>
                  <p className="text-[11px] text-slate-500">Attach internal photos and bay configuration</p>
                </div>
                <button onClick={() => setShowSingleModal(false)} className="text-slate-400 hover:text-slate-800 font-bold p-1">
                  ✕
                </button>
              </div>

              <form onSubmit={handleSingleCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Bay / Slot Number</label>
                    <input
                      type="text"
                      required
                      value={singleSlotNumber}
                      onChange={(e) => setSingleSlotNumber(e.target.value.toUpperCase())}
                      placeholder="e.g. A01 or VIP-1"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs uppercase font-mono font-bold text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Vehicle Type</label>
                    <select
                      value={singleVehicle}
                      onChange={(e) => setSingleVehicle(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                    >
                      <option value="Car">Car</option>
                      <option value="SUV">SUV</option>
                      <option value="Bike">Bike</option>
                      <option value="EV">EV (Electric Vehicle)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Floor / Deck Level</label>
                    <input
                      type="text"
                      value={singleFloor}
                      onChange={(e) => setSingleFloor(e.target.value)}
                      placeholder="e.g. Level 1, Basement 1, Rooftop"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Visual Preset</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) setSingleImageUrl(e.target.value);
                      }}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 focus:border-teal-500 focus:bg-white focus:outline-none"
                    >
                      <option value="https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1000&auto=format&fit=crop&q=80">Standard Multi-tier Covered</option>
                      <option value="https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1000&auto=format&fit=crop&q=80">Commercial Paved Bay</option>
                      <option value="https://images.unsplash.com/photo-1563720223185-11003d516935?w=1000&auto=format&fit=crop&q=80">EV Supercharger Bay</option>
                      <option value="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1000&auto=format&fit=crop&q=80">Dedicated Two-Wheeler Bay</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Internal Bay Image URL</label>
                  <input
                    type="url"
                    required
                    value={singleImageUrl}
                    onChange={(e) => setSingleImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Bay Features / Remarks</label>
                  <textarea
                    rows={2}
                    value={singleDescription}
                    onChange={(e) => setSingleDescription(e.target.value)}
                    placeholder="e.g. Near main elevator, extra wide space, rapid EV charging point..."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSingleModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 text-xs font-black text-white hover:bg-teal-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    {adding ? "Adding Bay..." : "Add Parking Bay"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Batch Add Modal */}
        {showBatchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in">
            <div className="max-w-md w-full rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900">Batch Add Parking Bays</h3>
                <button onClick={() => setShowBatchModal(false)} className="text-slate-400 hover:text-slate-800 font-bold p-1">
                  ✕
                </button>
              </div>

              <form onSubmit={handleBatchCreate} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Section Prefix</label>
                    <input
                      type="text"
                      maxLength={2}
                      required
                      value={batchPrefix}
                      onChange={(e) => setBatchPrefix(e.target.value.toUpperCase())}
                      placeholder="C"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs uppercase font-bold text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Number of Bays</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      required
                      value={batchCount}
                      onChange={(e) => setBatchCount(parseInt(e.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Vehicle Type</label>
                    <select
                      value={batchVehicle}
                      onChange={(e) => setBatchVehicle(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                    >
                      <option value="Car">Car</option>
                      <option value="SUV">SUV</option>
                      <option value="Bike">Bike</option>
                      <option value="EV">EV</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Floor Level</label>
                    <input
                      type="text"
                      value={batchFloor}
                      onChange={(e) => setBatchFloor(e.target.value)}
                      placeholder="Level 1"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Internal Bay Image URL</label>
                  <input
                    type="url"
                    value={batchImageUrl}
                    onChange={(e) => setBatchImageUrl(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBatchModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={adding}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 text-xs font-black text-white hover:bg-teal-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
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
