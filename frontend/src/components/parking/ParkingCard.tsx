"use client";

import React from "react";
import Link from "next/link";
import { ParkingLocation } from "@/types";
import {
  MapPin,
  Clock,
  Car,
  Coins,
  Star,
  ChevronRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface ParkingCardProps {
  parking: ParkingLocation;
}

export default function ParkingCard({ parking }: ParkingCardProps) {
  const availRatio = parking.total_slots > 0 ? parking.available_slots / parking.total_slots : 0;
  const isFull = parking.available_slots === 0;
  const isLimited = !isFull && availRatio <= 0.3;

  const facilitiesList = parking.facilities ? parking.facilities.split(",").slice(0, 3) : [];

  return (
    <div className="group relative flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10">
      
      {/* Top Media / Header */}
      <div>
        <div className="relative h-44 w-full overflow-hidden rounded-2xl bg-slate-950">
          <img
            src={parking.image_url || "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60"}
            alt={parking.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-extrabold backdrop-blur-md ${
                isFull
                  ? "bg-rose-500/80 text-white"
                  : isLimited
                  ? "bg-amber-500/80 text-slate-950"
                  : "bg-emerald-500/80 text-slate-950"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              {isFull ? "Full" : isLimited ? "Limited Bays" : "Available"}
            </span>
          </div>

          {/* Price Tag */}
          <div className="absolute top-3 right-3 rounded-full bg-slate-900/80 px-3 py-1 text-xs font-extrabold text-emerald-400 border border-slate-700/60 backdrop-blur-md">
            {parking.price_per_hour} Credits/hr
          </div>

          {/* Rating & Distance */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs font-semibold text-slate-200">
            <div className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-700/50">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{parking.rating.toFixed(1)}</span>
              <span className="text-slate-400 text-[10px]">({parking.review_count})</span>
            </div>

            {parking.distance_km !== undefined && (
              <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                <MapPin className="h-3.5 w-3.5" />
                <span>{parking.distance_km} km away</span>
              </div>
            )}
          </div>
        </div>

        {/* Content Info */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider">
            <span>{parking.city || "Urban Smart Hub"}</span>
          </div>

          <h3 className="text-lg font-extrabold text-white group-hover:text-emerald-400 transition-colors">
            {parking.name}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {parking.address}
          </p>

          {/* Operational Hours & Vehicle Support */}
          <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{parking.opening_time} - {parking.closing_time}</span>
            </div>
            <div className="flex items-center gap-1">
              <Car className="h-3.5 w-3.5 text-slate-400" />
              <span>{parking.supported_vehicle_types?.split(",").slice(0, 2).join(", ")}</span>
            </div>
          </div>

          {/* Slot Occupancy Bar */}
          <div className="pt-2">
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-slate-400">Availability</span>
              <span className={isFull ? "text-rose-400" : "text-emerald-400"}>
                {parking.available_slots} / {parking.total_slots} Slots
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-950 border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  isFull ? "bg-rose-500" : isLimited ? "bg-amber-400" : "bg-emerald-400"
                }`}
                style={{ width: `${Math.max(4, availRatio * 100)}%` }}
              />
            </div>
          </div>

          {/* Facilities Tags */}
          {facilitiesList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {facilitiesList.map((fac, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-slate-950/80 border border-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400"
                >
                  {fac.trim()}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-5 flex items-center gap-2 pt-3 border-t border-slate-800/80">
        <Link
          href={`/parking/${parking.id}`}
          className="flex-1 text-center py-2.5 px-3 rounded-xl text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white transition"
        >
          View Details
        </Link>
        <Link
          href={`/booking?parking_id=${parking.id}`}
          className="flex-1 flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition shadow-lg shadow-emerald-500/20 active:scale-95"
        >
          Book Slot
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
