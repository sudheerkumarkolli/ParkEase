"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ParkingLocation } from "@/types";
import {
  MapPin,
  Star,
  Bookmark,
  ArrowRight,
  Sparkles,
  Users,
  Car,
  Clock,
  Zap,
} from "lucide-react";

interface ParkingCardProps {
  parking: ParkingLocation;
}

export default function ParkingCard({ parking }: ParkingCardProps) {
  const { isAuthenticated } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);

  const availRatio = parking.total_slots > 0 ? parking.available_slots / parking.total_slots : 0;
  const isFull = parking.available_slots === 0;
  const isLimited = !isFull && availRatio <= 0.3;

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-[#EBEAEE] bg-white p-3.5 shadow-[0_10px_30px_rgba(86,105,255,0.05)] transition-all duration-300 hover:border-[#5669FF]/50 hover:shadow-[0_15px_40px_rgba(86,105,255,0.12)] hover:-translate-y-1">
      
      {/* Top Image Container with EventHub Date Stamp & Bookmark */}
      <div>
        <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-[#F0F1F7]">
          <img
            src={parking.image_url || "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60"}
            alt={parking.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

          {/* EventHub Floating Date/Slot Stamp (Top-Left) */}
          <div className="absolute top-3 left-3 flex flex-col items-center justify-center rounded-2xl bg-white/95 px-2.5 py-1.5 shadow-md backdrop-blur-md">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#F0635A]">
              {isFull ? "FULL" : "FREE"}
            </span>
            <span className="text-sm font-black leading-none text-[#120D26]">
              {parking.available_slots}
            </span>
            <span className="text-[9px] font-bold text-[#747688]">BAYS</span>
          </div>

          {/* EventHub Bookmark Squircle Button (Top-Right) */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setBookmarked(!bookmarked);
            }}
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-2xl bg-white/90 shadow-md backdrop-blur-md transition-transform active:scale-90 hover:bg-white"
            title="Save Hub"
          >
            <Bookmark
              className={`h-4 w-4 transition-colors ${
                bookmarked ? "fill-[#F0635A] text-[#F0635A]" : "text-[#747688] hover:text-[#F0635A]"
              }`}
            />
          </button>

          {/* Rating Tag (Bottom-Right) */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-xl bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-md">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="font-bold text-[11px]">{parking.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Overlapping Attendee Avatar Stack (EventHub Signature) */}
        <div className="mt-3 flex items-center justify-between px-1">
          <div className="flex items-center">
            <div className="flex -space-x-2 overflow-hidden">
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                alt="User"
              />
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                alt="User"
              />
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                alt="User"
              />
            </div>
            <span className="ml-2 text-[11px] font-extrabold text-[#5669FF]">
              +{parking.review_count + 15} Parked Today
            </span>
          </div>

          {parking.distance_km !== undefined && (
            <span className="text-[11px] font-bold text-[#747688]">
              {parking.distance_km} km away
            </span>
          )}
        </div>

        {/* Hub Details */}
        <div className="mt-2.5 space-y-1 px-1">
          <h3 className="text-base font-black text-[#120D26] line-clamp-1 group-hover:text-[#5669FF] transition-colors">
            {parking.name}
          </h3>

          <div className="flex items-center gap-1 text-xs text-[#747688]">
            <MapPin className="h-3.5 w-3.5 text-[#5669FF] shrink-0" />
            <span className="truncate">
              {parking.address}
              {parking.city || parking.state ? ` • ${[parking.city, parking.state].filter(Boolean).join(", ")}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Row with Price and EventHub Book Now Button */}
      <div className="mt-4 flex items-center justify-between border-t border-[#EBEAEE] pt-3 px-1">
        <div>
          <div className="text-[10px] uppercase font-bold text-[#747688]">Hourly Rate</div>
          <div className="text-base font-black text-[#120D26]">
            {parking.price_per_hour} <span className="text-xs font-bold text-[#5669FF]">Credits</span>
          </div>
        </div>

        <Link
          href={
            isAuthenticated
              ? `/booking?parking_id=${parking.id}`
              : `/login?redirect=/booking?parking_id=${parking.id}`
          }
          className="flex items-center gap-1.5 rounded-2xl bg-[#5669FF] px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-[#5669FF]/30 transition-all hover:bg-[#4657E5] hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span>Book Bay</span>
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>
      </div>
    </div>
  );
}
