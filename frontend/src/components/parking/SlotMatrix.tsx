"use client";

import React, { useState } from "react";
import { ParkingSlot, VehicleType, SlotStatus } from "@/types";
import { Car, Bike, Zap, ShieldAlert, CheckCircle2, Lock, Ban } from "lucide-react";

interface SlotMatrixProps {
  slots: ParkingSlot[];
  selectedSlotId?: number | null;
  onSelectSlot?: (slot: ParkingSlot) => void;
  isManager?: boolean;
  onToggleStatus?: (slotId: number, currentStatus: SlotStatus) => void;
}

export default function SlotMatrix({
  slots,
  selectedSlotId,
  onSelectSlot,
  isManager = false,
  onToggleStatus,
}: SlotMatrixProps) {
  const [vehicleFilter, setVehicleFilter] = useState<string>("ALL");

  const filteredSlots = slots.filter((s) => {
    if (vehicleFilter === "ALL") return true;
    return s.vehicle_type === vehicleFilter;
  });

  // Group slots by section prefix (e.g., "A", "B", "C")
  const groupedSlots = filteredSlots.reduce((acc, slot) => {
    const prefix = slot.slot_number.charAt(0).toUpperCase() || "General";
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(slot);
    return acc;
  }, {} as Record<string, ParkingSlot[]>);

  const getVehicleIcon = (type: VehicleType) => {
    switch (type) {
      case "Bike":
        return <Bike className="h-4 w-4" />;
      case "EV":
        return <Zap className="h-4 w-4 text-amber-400" />;
      case "SUV":
        return <Car className="h-4 w-4 scale-110" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  const getSlotStyle = (slot: ParkingSlot) => {
    const isSelected = selectedSlotId === slot.id;

    if (isSelected) {
      return "bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/40 font-extrabold scale-105 shadow-xl shadow-emerald-500/30";
    }

    switch (slot.status) {
      case "AVAILABLE":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/60 cursor-pointer shadow-sm";
      case "OCCUPIED":
        return "bg-rose-500/10 text-rose-400/80 border border-rose-500/20 cursor-not-allowed opacity-75";
      case "RESERVED":
        return "bg-amber-500/10 text-amber-400/80 border border-amber-500/20 cursor-not-allowed opacity-80";
      case "MAINTENANCE":
        return "bg-zinc-800/80 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-60";
      default:
        return "bg-slate-800 text-slate-400 border border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80">
        
        {/* Vehicle Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">Filter Vehicle:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            {["ALL", "Car", "Bike", "SUV", "EV"].map((type) => (
              <button
                key={type}
                onClick={() => setVehicleFilter(type)}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                  vehicleFilter === type
                    ? "bg-emerald-500 text-slate-950 font-bold shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-3 w-3 rounded bg-emerald-500/30 border border-emerald-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-400">
            <span className="h-3 w-3 rounded bg-rose-500/30 border border-rose-500" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-400">
            <span className="h-3 w-3 rounded bg-amber-500/30 border border-amber-500" />
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-400">
            <span className="h-3 w-3 rounded bg-zinc-700 border border-zinc-600" />
            <span>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Grid of Sections */}
      {Object.keys(groupedSlots).length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-2xl">
          <Ban className="h-8 w-8 text-slate-600 mx-auto mb-2" />
          <p className="text-slate-400 text-sm">No slots match the selected vehicle filter.</p>
        </div>
      ) : (
        Object.entries(groupedSlots).map(([section, sectionSlots]) => (
          <div key={section} className="rounded-2xl border border-slate-800 bg-slate-950/40 p-5">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-2">
              <span className="text-sm font-extrabold text-slate-200 tracking-wider flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs">
                  {section}
                </span>
                Section {section} Bays
              </span>
              <span className="text-xs text-slate-400">
                {sectionSlots.filter((s) => s.status === "AVAILABLE").length} Available / {sectionSlots.length} Total
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {sectionSlots.map((slot) => {
                const isAvailable = slot.status === "AVAILABLE";
                const isSelected = selectedSlotId === slot.id;

                return (
                  <div
                    key={slot.id}
                    onClick={() => {
                      if (isManager && onToggleStatus) {
                        onToggleStatus(slot.id, slot.status);
                      } else if (isAvailable && onSelectSlot) {
                        onSelectSlot(slot);
                      }
                    }}
                    className={`relative flex flex-col items-center justify-between p-3 rounded-2xl transition-all duration-200 ${getSlotStyle(
                      slot
                    )}`}
                  >
                    {/* Header Slot Number */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-mono font-bold tracking-tight">
                        {slot.slot_number}
                      </span>
                      {getVehicleIcon(slot.vehicle_type)}
                    </div>

                    {/* Status Text / Icon */}
                    <div className="my-2 flex flex-col items-center">
                      {isSelected ? (
                        <CheckCircle2 className="h-5 w-5 text-slate-950" />
                      ) : slot.status === "OCCUPIED" ? (
                        <Lock className="h-4 w-4 text-rose-400/80" />
                      ) : slot.status === "RESERVED" ? (
                        <span className="text-[10px] uppercase font-bold text-amber-400">Reserved</span>
                      ) : slot.status === "MAINTENANCE" ? (
                        <ShieldAlert className="h-4 w-4 text-zinc-500" />
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-emerald-400">Select</span>
                      )}
                    </div>

                    {/* Vehicle Type Label */}
                    <span className="text-[10px] opacity-75 font-medium">
                      {slot.vehicle_type}
                    </span>

                    {/* Manager Mode Quick Badge */}
                    {isManager && (
                      <span className="mt-1 text-[9px] underline text-slate-300">Toggle</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
