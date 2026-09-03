"use client";

import React, { useState, useEffect } from "react";
import { ParkingSlot } from "@/types";
import {
  X,
  Car,
  Bike,
  Zap,
  Layers,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

interface BayPreviewModalProps {
  slot: ParkingSlot | null;
  onClose: () => void;
  onSelectSlot?: (slot: ParkingSlot) => void;
  isManager?: boolean;
  facilityName?: string;
  facilityPrice?: number;
}

export interface ParkingAngleImage {
  id: string;
  title: string;
  subtitle: string;
  url: string;
  badge: string;
}

export default function BayPreviewModal({
  slot,
  onClose,
  onSelectSlot,
  isManager = false,
  facilityName,
  facilityPrice,
}: BayPreviewModalProps) {
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  if (!slot) return null;

  // Multi-angle realistic high-definition parking image gallery per vehicle type
  const getGalleryImages = (type: string, slotNum: string): ParkingAngleImage[] => {
    switch (type) {
      case "EV":
        return [
          {
            id: "ev-1",
            title: `EV Fast Charger Dock - Bay ${slotNum}`,
            subtitle: "High-speed 150kW DC Fast Charger with dual cable dock",
            url: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80",
            badge: "⚡ Dedicated EV Fast Dock",
          },
          {
            id: "ev-2",
            title: "45° Drive-Through Angled Entry",
            subtitle: "One-way entry lane for effortless EV parking",
            url: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=1200&auto=format&fit=crop&q=80",
            badge: "📐 45° Angled Bay",
          },
          {
            id: "ev-3",
            title: "Basement Covered Superbay",
            subtitle: "Overhead LED bay guidance & fire protection system",
            url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80",
            badge: "🏢 Underground Shade",
          },
        ];

      case "Bike":
        return [
          {
            id: "bike-1",
            title: `Two-Wheeler Reserved Bay ${slotNum}`,
            subtitle: "Individual anti-slip kickstand pad with wheel lock ring",
            url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&auto=format&fit=crop&q=80",
            badge: "🏍️ Dedicated Bike Bay",
          },
          {
            id: "bike-2",
            title: "Parallel Scooter Alignment Row",
            subtitle: "Side-by-side organized line with rubber bumper stops",
            url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&auto=format&fit=crop&q=80",
            badge: "🅿️ Parallel Alignment",
          },
        ];

      case "SUV":
        return [
          {
            id: "suv-1",
            title: `Wide SUV 90° Straight Bay ${slotNum}`,
            subtitle: "Extra 3.2m width allowance for full-size SUVs & trucks",
            url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1200&auto=format&fit=crop&q=80",
            badge: "🚙 Wide SUV 90° Bay",
          },
          {
            id: "suv-2",
            title: "Underground Multi-Tier Basement View",
            subtitle: "High ceiling clearance (3.5m) with automatic sprinkler system",
            url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80",
            badge: "🏢 Basement Multi-Tier",
          },
          {
            id: "suv-3",
            title: "Parallel Side Curb Parking Angle",
            subtitle: "Direct curb access with wide turn clearance radius",
            url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1200&auto=format&fit=crop&q=80",
            badge: "🅿️ Parallel Curb Angle",
          },
        ];

      default: // Car
        return [
          {
            id: "car-1",
            title: `Standard Car 90° Perpendicular Bay ${slotNum}`,
            subtitle: "Paved bay with rubber wheel stoppers & LED lane marker",
            url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1200&auto=format&fit=crop&q=80",
            badge: "🚗 90° Straight Parking",
          },
          {
            id: "car-2",
            title: "Side-by-Side Parallel Parking Angle",
            subtitle: "Convenient side lane parking with zero obstacle door clearance",
            url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1200&auto=format&fit=crop&q=80",
            badge: "🅿️ Parallel Side Bay",
          },
          {
            id: "car-3",
            title: "45° Slanted Quick-Pull Bay",
            subtitle: "Angled entry path for seamless forward parking & reverse exit",
            url: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=1200&auto=format&fit=crop&q=80",
            badge: "📐 45° Slanted Bay",
          },
          {
            id: "car-4",
            title: "Covered Structure & Overhead LED Bay Sensors",
            subtitle: "Protected from weather elements with ultrasonic occupant sensor",
            url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80",
            badge: "☂️ Weather Covered",
          },
        ];
    }
  };

  const galleryImages = getGalleryImages(slot.vehicle_type, slot.slot_number);
  const currentImage = galleryImages[activeImageIndex] || galleryImages[0];

  // Clean automatic 2-second auto-scroll slideshow
  useEffect(() => {
    if (galleryImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [galleryImages.length]);

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  const isAvailable = slot.status === "AVAILABLE";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 bg-white overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Visual Hero Gallery Display */}
        <div className="relative h-72 sm:h-80 w-full bg-slate-950 overflow-hidden group/gallery">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={currentImage.url}
            src={currentImage.url}
            alt={currentImage.title}
            className="w-full h-full object-cover opacity-95 transition-all duration-700 animate-in fade-in zoom-in-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/25 to-black/40" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/80 text-white backdrop-blur-md hover:bg-slate-900 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Top Angle Badge */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <span className="px-3.5 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-black backdrop-blur-md shadow-md">
              {currentImage.badge}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-black/60 text-slate-200 text-[11px] font-bold backdrop-blur-md">
              Angle {activeImageIndex + 1} of {galleryImages.length}
            </span>
          </div>

          {/* Animated 2s Progress Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20 overflow-hidden">
            <div key={activeImageIndex} className="h-full bg-indigo-500 animate-[progress_2s_linear_infinite]" />
          </div>

          {/* Prev/Next Navigation Arrows */}
          {galleryImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/80 transition cursor-pointer"
                title="Previous Photo Angle"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md hover:bg-black/80 transition cursor-pointer"
                title="Next Photo Angle"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Bottom Overlay Title & Subtitle */}
          <div className="absolute bottom-4 left-5 right-5 z-10 space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                  slot.status === "AVAILABLE"
                    ? "bg-emerald-500 text-white"
                    : slot.status === "OCCUPIED"
                    ? "bg-rose-500 text-white"
                    : "bg-amber-500 text-white"
                }`}
              >
                ● {slot.status}
              </span>
              <span className="text-xs text-slate-300 font-bold">
                {slot.vehicle_type} Dedicated Space
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {currentImage.title}
            </h2>
            <p className="text-xs text-[#EBEAEE] font-medium line-clamp-1">
              {currentImage.subtitle}
            </p>
          </div>
        </div>

        {/* Image Thumbnail Selector Bar */}
        <div className="bg-slate-900 p-3 flex items-center justify-center gap-2 overflow-x-auto border-b border-slate-800">
          {galleryImages.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveImageIndex(idx)}
              className={`relative h-14 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                activeImageIndex === idx
                  ? "border-indigo-500 ring-2 ring-indigo-400/50 scale-105"
                  : "border-slate-700 opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.title} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/20" />
              <span className="absolute bottom-0.5 left-1 text-[9px] font-black text-white bg-black/60 px-1 rounded">
                #{idx + 1}
              </span>
            </button>
          ))}
        </div>

        {/* Bay Information & Metadata */}
        <div className="p-6 space-y-5">
          
          {/* Quick Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500">Floor Level</span>
              <div className="text-sm font-black text-slate-900 mt-0.5">{slot.floor_level || "Ground / Level 1"}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500">Vehicle Type</span>
              <div className="text-sm font-black text-indigo-600 mt-0.5">{slot.vehicle_type}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500">Active Angle</span>
              <div className="text-xs font-black text-slate-800 mt-0.5">{currentImage.badge}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
              <span className="text-[10px] uppercase font-bold text-slate-500">Auto-Scroll</span>
              <div className="text-xs font-black text-emerald-600 mt-0.5 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> 2 Secs Active
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Bay Features & Layout</h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              {slot.description ||
                `Verified parking bay ${slot.slot_number} configured for ${slot.vehicle_type} vehicles. Featuring rubber wheel stoppers, clear LED directional aisle lighting, and physical bumper guards.`}
            </p>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Close Gallery
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
                <span>Select Bay {slot.slot_number} & Continue</span>
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



