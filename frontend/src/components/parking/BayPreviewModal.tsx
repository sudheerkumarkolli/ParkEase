"use client";

import React from "react";
import { ParkingSlot } from "@/types";
import {
  X,
  Eye,
  Car,
  Bike,
  Zap,
  CheckCircle2,
  ShieldAlert,
  Layers,
  Sparkles,
  Lock,
  ArrowRight,
} from "lucide-react";

interface BayPreviewModalProps {
  slot: ParkingSlot | null;
  onClose: () => void;
  onSelectSlot?: (slot: ParkingSlot) => void;
  isManager?: boolean;
  facilityName?: string;
  facilityPrice?: number;
}

export default function BayPreviewModal({
  slot,
  onClose,
  onSelectSlot,
  isManager = false,
  facilityName,
  facilityPrice,
}: BayPreviewModalProps) {
  if (!slot) return null;

  // Fallback realistic high-definition internal bay visual if specific image not set
  const defaultBayImages: Record<string, string> = {
    Car: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1000&auto=format&fit=crop&q=80",
    SUV: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1000&auto=format&fit=crop&q=80",
    EV: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=1000&auto=format&fit=crop&q=80",
    Bike: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1000&auto=format&fit=crop&q=80",
  };

  const previewImage =
    slot.image_url ||
    defaultBayImages[slot.vehicle_type] ||
    "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=1000&auto=format&fit=crop&q=80";

  const isAvailable = slot.status === "AVAILABLE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Visual Hero Image Container */}
        <div className="relative h-64 sm:h-72 w-full bg-slate-900 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewImage}
            alt={`Internal view of Parking Bay ${slot.slot_number}`}
            className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/70 text-white backdrop-blur-md hover:bg-slate-900 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Bay Title & Badge Overlay */}
          <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-black shadow-md">
                  <Layers className="h-3.5 w-3.5" />
                  Bay {slot.slot_number}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full border shadow-sm ${
                    slot.status === "AVAILABLE"
                      ? "bg-emerald-500 text-white border-emerald-400"
                      : slot.status === "OCCUPIED"
                      ? "bg-rose-500 text-white border-rose-400"
                      : "bg-amber-500 text-white border-amber-400"
                  }`}
                >
                  ● {slot.status}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {facilityName ? `${facilityName} — ` : ""}Bay {slot.slot_number}
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                {slot.floor_level || "Level 1"} • {slot.vehicle_type} Dedicated Space
              </p>
            </div>

            <div className="hidden sm:block text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Internal Visual</span>
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-end">
                <Eye className="h-3.5 w-3.5" /> High Resolution
              </div>
            </div>
          </div>
        </div>

        {/* Bay Information & Metadata */}
        <div className="p-6 sm:p-7 space-y-6">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500">Floor Level</span>
              <div className="text-sm font-black text-slate-900 mt-0.5">{slot.floor_level || "Ground / Level 1"}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500">Vehicle Type</span>
              <div className="text-sm font-black text-indigo-600 mt-0.5">{slot.vehicle_type}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500">CCTV & Gate</span>
              <div className="text-sm font-black text-emerald-600 mt-0.5">Automated</div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Bay Features & Description</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {slot.description ||
                `Spacious covered bay ${slot.slot_number} optimized for ${slot.vehicle_type} parking with automated boom barrier sensor, high-resolution surveillance, and clear LED lane numbering.`}
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Close Visual
            </button>

            {!isManager && onSelectSlot && isAvailable && (
              <button
                type="button"
                onClick={() => {
                  onSelectSlot(slot);
                  onClose();
                }}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/25 active:scale-95 cursor-pointer"
              >
                <span>Select Bay {slot.slot_number} & Proceed</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}

            {isManager && (
              <span className="text-xs text-slate-500 font-medium italic">
                Bay configuration active in facility registry
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
