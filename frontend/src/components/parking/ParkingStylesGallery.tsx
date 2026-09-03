"use client";

import React, { useState, useEffect } from "react";
import { Car, Bike, Zap, Layers, CheckCircle2, ChevronRight, Eye, Info } from "lucide-react";

export interface ParkingStyleItem {
  id: string;
  name: string;
  vehicleType: string;
  badge: string;
  description: string;
  images: {
    url: string;
    caption: string;
  }[];
}

const PARKING_STYLES: ParkingStyleItem[] = [
  {
    id: "perpendicular-90",
    name: "90° Perpendicular Bay",
    vehicleType: "Car",
    badge: "🚗 Standard Straight Bay",
    description: "Traditional straight-in parking bay with rubber bumper stops, wide door opening space, and high-visibility painted guidelines.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1200&auto=format&fit=crop&q=80",
        caption: "90° Perpendicular Bay - Frontal Entry View",
      },
      {
        url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1200&auto=format&fit=crop&q=80",
        caption: "Side Lineup & Clearance View",
      },
      {
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80",
        caption: "Basement Multi-Level Covered Alignment",
      },
    ],
  },
  {
    id: "parallel-curb",
    name: "Parallel Side Curb Parking",
    vehicleType: "Car",
    badge: "🅿️ Side-Curb Alignment",
    description: "Convenient parallel parking alongside facility driveways for instant pull-in and swift exit without backing up.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1200&auto=format&fit=crop&q=80",
        caption: "Parallel Curb Bay - Side Perspective",
      },
      {
        url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1200&auto=format&fit=crop&q=80",
        caption: "Street-level Parallel View",
      },
    ],
  },
  {
    id: "angled-45",
    name: "45° Slanted Drive-Thru",
    vehicleType: "SUV",
    badge: "📐 Angled Easy-Park",
    description: "Slanted one-way aisle bays allowing drivers to pull in forward easily with minimal steering turn angle.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=1200&auto=format&fit=crop&q=80",
        caption: "45° Angled Bay - Driver Perspective",
      },
      {
        url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=1200&auto=format&fit=crop&q=80",
        caption: "Aisle Entrance & Flow View",
      },
    ],
  },
  {
    id: "ev-charging",
    name: "EV Fast Charger Dock",
    vehicleType: "EV",
    badge: "⚡ 150kW Supercharging",
    description: "Dedicated electric vehicle bay featuring 150kW DC dual-connector fast chargers with overhead LED status indicators.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80",
        caption: "EV Supercharging Cable & Terminal Dock",
      },
      {
        url: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=1200&auto=format&fit=crop&q=80",
        caption: "EV Bay Angled Charging Spot",
      },
    ],
  },
  {
    id: "covered-basement",
    name: "Underground Basement Shade",
    vehicleType: "Car",
    badge: "🏢 All-Weather Covered",
    description: "100% weather-protected basement bays featuring automated sprinklers and LED guidance indicators.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&auto=format&fit=crop&q=80",
        caption: "Underground Basement Tier Bay",
      },
      {
        url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1200&auto=format&fit=crop&q=80",
        caption: "Subterranean Parking Structure View",
      },
    ],
  },
  {
    id: "two-wheeler",
    name: "Two-Wheeler Bike Bay",
    vehicleType: "Bike",
    badge: "🏍️ Bike Lock Zone",
    description: "Dedicated motorcycle & scooter bays with anti-slip floor pads and wheel lock anchor rings.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1200&auto=format&fit=crop&q=80",
        caption: "Two-Wheeler Dedicated Stand",
      },
      {
        url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=1200&auto=format&fit=crop&q=80",
        caption: "Organized Scooter Parallel Alignment",
      },
    ],
  },
];

interface ParkingStylesGalleryProps {
  onSelectVehicleFilter?: (type: string) => void;
}

export default function ParkingStylesGallery({ onSelectVehicleFilter }: ParkingStylesGalleryProps) {
  const [selectedStyleId, setSelectedStyleId] = useState<string>("perpendicular-90");
  const [activeImageIdx, setActiveImageIdx] = useState<number>(0);

  const currentStyle = PARKING_STYLES.find((s) => s.id === selectedStyleId) || PARKING_STYLES[0];
  const activeImage = currentStyle.images[activeImageIdx] || currentStyle.images[0];

  // Clean automatic 2-second auto-scroll slideshow
  useEffect(() => {
    if (currentStyle.images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIdx((prev) => (prev + 1) % currentStyle.images.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [currentStyle.images.length, selectedStyleId]);

  return (
    <div className="rounded-3xl border border-[#EBEAEE] bg-white p-6 shadow-[0_10px_30px_rgba(86,105,255,0.04)] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F0F1F7] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#5669FF]/10 text-[#5669FF] font-black text-xs">
              🖼️
            </span>
            <h3 className="text-sm sm:text-base font-black text-[#120D26]">
              Visual Parking Styles & Layout Preview
            </h3>
          </div>
          <p className="text-xs text-[#747688] font-medium mt-0.5">
            Explore different ways to park (Parallel, 90° Perpendicular, 45° Slanted, EV Charger Docks)
          </p>
        </div>
        <span className="text-[11px] font-bold text-[#5669FF] bg-[#5669FF]/10 px-3 py-1 rounded-full w-fit">
          2s Auto-Scroll Active
        </span>
      </div>

      {/* Tabs of Parking Ways */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {PARKING_STYLES.map((style) => {
          const isSelected = style.id === selectedStyleId;
          return (
            <button
              key={style.id}
              type="button"
              onClick={() => {
                setSelectedStyleId(style.id);
                setActiveImageIdx(0);
                if (onSelectVehicleFilter) {
                  onSelectVehicleFilter(style.vehicleType);
                }
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#5669FF] text-white shadow-md shadow-[#5669FF]/25 scale-105"
                  : "bg-[#F8F9FE] text-[#747688] hover:text-[#120D26] hover:bg-[#EBEAEE] border border-[#EBEAEE]"
              }`}
            >
              <span>{style.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Image Showcase Display */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left 2 Cols: High-Res Image View with 2s Auto-Scroll */}
        <div className="lg:col-span-2 space-y-3">
          <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={activeImage.url}
              src={activeImage.url}
              alt={activeImage.caption}
              className="h-full w-full object-cover opacity-95 transition-all duration-700 group-hover:scale-105 animate-in fade-in zoom-in-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

            {/* Badge Overlay */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#5669FF] text-white text-xs font-black shadow-md">
                {currentStyle.badge}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-black/60 text-slate-200 text-[10px] font-bold backdrop-blur-md">
                Photo {activeImageIdx + 1} of {currentStyle.images.length}
              </span>
            </div>

            {/* Progress Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-20 overflow-hidden">
              <div key={activeImageIdx} className="h-full bg-[#5669FF] animate-[progress_2s_linear_infinite]" />
            </div>

            {/* Caption */}
            <div className="absolute bottom-3 left-4 right-4 text-white space-y-0.5">
              <div className="text-xs font-black flex items-center gap-1.5">
                {activeImage.caption}
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1 font-medium">
                {currentStyle.description}
              </p>
            </div>
          </div>

          {/* Thumbnails */}
          {currentStyle.images.length > 1 && (
            <div className="flex items-center gap-2">
              {currentStyle.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIdx(idx)}
                  className={`relative h-14 w-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activeImageIdx === idx
                      ? "border-[#5669FF] ring-2 ring-[#5669FF]/40 scale-105"
                      : "border-slate-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.caption} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Info Box & Filter Trigger */}
        <div className="rounded-2xl bg-[#F8F9FE] p-5 border border-[#EBEAEE] flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#5669FF] bg-[#5669FF]/10 px-2.5 py-0.5 rounded-md">
              Parking Specifications
            </span>
            <h4 className="text-base font-black text-[#120D26]">{currentStyle.name}</h4>
            <p className="text-xs text-[#747688] leading-relaxed font-medium">
              {currentStyle.description}
            </p>

            <div className="space-y-2 pt-2 border-t border-[#EBEAEE] text-xs font-bold text-[#120D26]">
              <div className="flex items-center justify-between">
                <span className="text-[#747688] font-medium">Target Vehicle:</span>
                <span className="text-[#5669FF]">{currentStyle.vehicleType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#747688] font-medium">Primary Angle:</span>
                <span>{currentStyle.badge.split(" ")[1] || "Standard"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#747688] font-medium">Auto-Scroll:</span>
                <span className="text-emerald-600">2s Interval</span>
              </div>
            </div>
          </div>

          {onSelectVehicleFilter && (
            <button
              type="button"
              onClick={() => onSelectVehicleFilter(currentStyle.vehicleType)}
              className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-[#5669FF] hover:bg-[#4657E5] text-white text-xs font-black transition shadow-md shadow-[#5669FF]/20 cursor-pointer"
            >
              <span>Filter {currentStyle.vehicleType} Bays in Grid</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
