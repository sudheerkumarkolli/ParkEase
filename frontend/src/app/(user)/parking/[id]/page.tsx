"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ParkingLocation, Review } from "@/types";
import { api } from "@/lib/api";
import SlotMatrix from "@/components/parking/SlotMatrix";
import ReviewList from "@/components/parking/ReviewList";
import {
  MapPin,
  Clock,
  Car,
  Coins,
  Star,
  ChevronRight,
  ShieldCheck,
  Zap,
  ArrowLeft,
  Navigation,
  CheckCircle,
  Building,
} from "lucide-react";

export default function ParkingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const parkingId = parseInt(resolvedParams.id);
  const router = useRouter();

  const [parking, setParking] = useState<ParkingLocation | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [pRes, rRes] = await Promise.all([
        api.get<ParkingLocation>(`/parking/${parkingId}`),
        api.get<Review[]>(`/reviews/parking/${parkingId}`),
      ]);
      setParking(pRes.data);
      setReviews(rRes.data);
    } catch (err) {
      console.error("Failed to load parking details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [parkingId]);

  if (loading || !parking) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="h-64 rounded-3xl bg-white/60 animate-pulse border border-slate-100" />
        <div className="h-96 rounded-3xl bg-white/60 animate-pulse border border-slate-100" />
      </div>
    );
  }

  const facilities = parking.facilities ? parking.facilities.split(",") : [];
  const vehicleTypes = parking.supported_vehicle_types ? parking.supported_vehicle_types.split(",") : [];

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
      
      {/* Back Button */}
      <Link
        href="/parking"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Parking Directory
      </Link>

      {/* Hero Showcase Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
                {parking.city || "Urban Smart Hub"}
              </span>
              <span className="flex items-center gap-1 text-xs text-amber-900 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {parking.rating.toFixed(1)} ({parking.review_count} Reviews)
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900">{parking.name}</h1>
            <p className="text-xs sm:text-sm text-slate-600 flex items-center gap-1.5 font-medium">
              <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              {parking.address}
            </p>
          </div>

          {/* Quick Book CTA Box */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="text-center sm:text-right px-4">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Standard Rate</span>
              <div className="text-2xl font-black text-emerald-700">
                {parking.price_per_hour} <span className="text-xs text-slate-500 font-normal">Credits/hr</span>
              </div>
            </div>

            <Link
              href={`/booking?parking_id=${parking.id}${selectedSlotId ? `&slot_id=${selectedSlotId}` : ""}`}
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-md active:scale-95 cursor-pointer"
            >
              Book Spot Now
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* 4 Stats Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 text-center">
            <div className="text-[11px] text-slate-500 font-medium">Available Bays</div>
            <div className="text-lg font-black text-emerald-700 mt-0.5">
              {parking.available_slots} / {parking.total_slots}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 text-center">
            <div className="text-[11px] text-slate-500 font-medium">Hours of Operation</div>
            <div className="text-sm font-black text-slate-900 mt-1">
              {parking.opening_time} - {parking.closing_time}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 text-center">
            <div className="text-[11px] text-slate-500 font-medium">Coordinates</div>
            <div className="text-xs font-mono font-bold text-slate-700 mt-1">
              {parking.latitude.toFixed(4)}, {parking.longitude.toFixed(4)}
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200 text-center">
            <div className="text-[11px] text-slate-500 font-medium">Verification</div>
            <div className="text-xs font-bold text-emerald-700 mt-1 flex items-center justify-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              QR Touchless
            </div>
          </div>
        </div>
      </div>

      {/* Facilities & Vehicle Support */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Facilities Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Building className="h-4 w-4 text-emerald-600" />
            Amenities & Security Features
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-800 font-medium">
            {facilities.map((f, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <CheckCircle className="h-3.5 w-3.5 text-emerald-600 flex-shrink-0" />
                <span>{f.trim()}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vehicle Types Box */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Car className="h-4 w-4 text-teal-600" />
            Supported Vehicle Bays
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-800 font-medium">
            {vehicleTypes.map((v, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="h-2 w-2 rounded-full bg-teal-500" />
                <span className="font-bold">{v.trim()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Slot Layout */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-slate-900">Interactive Slot Matrix</h2>
            <p className="text-xs text-slate-500">Click on any AVAILABLE slot to preselect for booking</p>
          </div>
          {selectedSlotId && (
            <Link
              href={`/booking?parking_id=${parking.id}&slot_id=${selectedSlotId}`}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-sm"
            >
              Continue to Book Selected Bay →
            </Link>
          )}
        </div>

        <SlotMatrix
          slots={parking.slots || []}
          selectedSlotId={selectedSlotId}
          onSelectSlot={(slot) => {
            setSelectedSlotId(slot.id);
          }}
        />
      </div>

      {/* Reviews Section */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <h2 className="text-xl font-black text-slate-900">Driver Reviews & Ratings</h2>
        <ReviewList
          reviews={reviews}
          averageRating={parking.rating}
          totalReviews={parking.review_count}
        />
      </div>
    </div>
  );
}
