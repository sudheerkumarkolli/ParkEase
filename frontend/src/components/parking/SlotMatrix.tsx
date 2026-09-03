"use client";

import React, { useState } from "react";
import { ParkingSlot, VehicleType, SlotStatus } from "@/types";
import { Car, Bike, Zap, ShieldAlert, CheckCircle2, Lock, Ban, Eye } from "lucide-react";
import BayPreviewModal from "@/components/parking/BayPreviewModal";

interface SlotMatrixProps {
  slots: ParkingSlot[];
  selectedSlotId?: number | null;
  onSelectSlot?: (slot: ParkingSlot) => void;
  isManager?: boolean;
  onToggleStatus?: (slotId: number, currentStatus: SlotStatus) => void;
  facilityName?: string;
  facilityPrice?: number;
}

export default function SlotMatrix({
  slots,
  selectedSlotId,
  onSelectSlot,
  isManager = false,
  onToggleStatus,
  facilityName,
  facilityPrice,
}: SlotMatrixProps) {
  const [vehicleFilter, setVehicleFilter] = useState<string>("ALL");
  const [previewingSlot, setPreviewingSlot] = useState<ParkingSlot | null>(null);

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
        return (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-purple-500/15 text-purple-700 text-[9px] font-black" title="Two-Wheeler / Bike Bay">
            <Bike className="h-3 w-3" />
            <span>BIKE</span>
          </span>
        );
      case "EV":
        return (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 text-[9px] font-black" title="EV Supercharger Bay">
            <Zap className="h-3 w-3 text-amber-500 fill-amber-400" />
            <span>EV</span>
          </span>
        );
      case "SUV":
        return (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-500/15 text-rose-700 text-[9px] font-black" title="Wide SUV Bay">
            <Car className="h-3 w-3 scale-105" />
            <span>SUV</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-indigo-500/15 text-indigo-700 text-[9px] font-black" title="Standard Car Bay">
            <Car className="h-3 w-3" />
            <span>CAR</span>
          </span>
        );
    }
  };

  const getSlotStyle = (slot: ParkingSlot) => {
    const isSelected = selectedSlotId === slot.id;

    if (isSelected) {
      return "bg-indigo-600 text-white ring-4 ring-indigo-300 font-black scale-105 shadow-lg";
    }

    switch (slot.status) {
      case "AVAILABLE":
        return "bg-emerald-50 text-emerald-800 border-2 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-500 cursor-pointer shadow-xs font-bold";
      case "OCCUPIED":
        return "bg-rose-50 text-rose-800 border border-rose-200 cursor-not-allowed opacity-85 font-medium";
      case "RESERVED":
        return "bg-amber-50 text-amber-900 border border-amber-300 cursor-not-allowed opacity-90 font-medium";
      case "MAINTENANCE":
        return "bg-slate-100 text-slate-700 border border-slate-300 cursor-not-allowed opacity-80 font-medium";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Filter & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm">
        
        {/* Vehicle Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700">Filter Vehicle:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            {["ALL", "Car", "Bike", "SUV", "EV"].map((type) => (
              <button
                key={type}
                onClick={() => setVehicleFilter(type)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  vehicleFilter === type
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <span className="h-3 w-3 rounded bg-emerald-500" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
            <span className="h-3 w-3 rounded bg-rose-500" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
            <span className="h-3 w-3 rounded bg-amber-500" />
            <span>Reserved</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
            <span className="h-3 w-3 rounded bg-slate-400" />
            <span>Maintenance</span>
          </div>
        </div>
      </div>

      {/* Grid of Sections */}
      {Object.keys(groupedSlots).length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-300 rounded-2xl bg-white shadow-sm">
          <Ban className="h-8 w-8 text-slate-400 mx-auto mb-2" />
          <p className="text-slate-600 text-sm font-semibold">No slots match the selected vehicle filter.</p>
        </div>
      ) : (
        Object.entries(groupedSlots).map(([section, sectionSlots]) => (
          <div key={section} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <span className="text-sm font-black text-slate-900 tracking-wider flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100 text-indigo-800 font-black text-xs border border-indigo-200">
                  {section}
                </span>
                Section {section} Bays
              </span>
              <span className="text-xs font-bold text-slate-600">
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
                    className={`group relative flex flex-col items-center justify-between p-3 rounded-2xl transition-all duration-200 ${getSlotStyle(
                      slot
                    )}`}
                  >
                    {/* Header Slot Number & View Image Icon */}
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-mono font-black tracking-tight">
                        {slot.slot_number}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewingSlot(slot);
                          }}
                          title="View Internal Image & Details"
                          className="p-1 rounded-md bg-black/10 hover:bg-black/20 text-slate-800 transition cursor-pointer hover:scale-115"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        {getVehicleIcon(slot.vehicle_type)}
                      </div>
                    </div>

                    {/* Status Text / Icon */}
                    <div className="my-2 flex flex-col items-center">
                      {isSelected ? (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      ) : slot.status === "OCCUPIED" ? (
                        <Lock className="h-4 w-4 text-rose-700" />
                      ) : slot.status === "RESERVED" ? (
                        <span className="text-[10px] uppercase font-black text-amber-900">Reserved</span>
                      ) : slot.status === "MAINTENANCE" ? (
                        <ShieldAlert className="h-4 w-4 text-slate-500" />
                      ) : (
                        <span className="text-[10px] uppercase font-black text-emerald-800">Select</span>
                      )}
                    </div>

                    {/* Vehicle Type Label */}
                    <div className="flex items-center justify-between w-full text-[10px] font-bold opacity-90">
                      <span>{slot.vehicle_type}</span>
                      <span className="text-[9px] font-medium opacity-75">{slot.floor_level || "L1"}</span>
                    </div>

                    {/* Manager Mode Quick Badge */}
                    {isManager && (
                      <span className="mt-1 text-[9px] underline font-bold text-slate-600 hover:text-slate-900">Toggle</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Internal Bay Visual Preview Modal */}
      <BayPreviewModal
        slot={previewingSlot}
        onClose={() => setPreviewingSlot(null)}
        onSelectSlot={onSelectSlot}
        isManager={isManager}
        facilityName={facilityName}
        facilityPrice={facilityPrice}
      />
    </div>
  );
}
