"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ParkingLocation, Review } from "@/types";
import { api } from "@/lib/api";
import SlotMatrix from "@/components/parking/SlotMatrix";
import ParkingStylesGallery from "@/components/parking/ParkingStylesGallery";
import ReviewList from "@/components/parking/ReviewList";
import LoginModal from "@/components/auth/LoginModal";
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
  Lock,
} from "lucide-react";

export default function ParkingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const parkingId = parseInt(resolvedParams.id);
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [parking, setParking] = useState<ParkingLocation | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const fetchDetails = async () => {
    if (isNaN(parkingId)) {
      setError("Invalid parking location ID.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [pRes, rRes] = await Promise.allSettled([
        api.get<ParkingLocation>(`/parking/${parkingId}`),
        api.get<Review[]>(`/reviews/parking/${parkingId}`),
      ]);

      if (pRes.status === "fulfilled") {
        setParking(pRes.value.data);
      } else {
        const detail = (pRes.reason as any)?.response?.data?.detail || "Could not retrieve parking location details.";
        setError(detail);
      }

      if (rRes.status === "fulfilled") {
        setReviews(rRes.value.data || []);
      } else {
        setReviews([]);
      }
    } catch (err: any) {
      console.error("Failed to load parking details:", err);
      setError(err?.response?.data?.detail || err?.message || "Failed to load parking facility details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [parkingId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-8 space-y-6">
        <div className="h-64 rounded-3xl bg-white animate-pulse border border-[#EBEAEE]" />
        <div className="h-96 rounded-3xl bg-white animate-pulse border border-[#EBEAEE]" />
      </div>
    );
  }

  if (error || !parking) {
    return (
      <div className="max-w-3xl mx-auto my-16 p-8 bg-white border border-rose-100 rounded-3xl shadow-sm text-center space-y-4">
        <div className="inline-flex p-3 bg-rose-50 text-rose-600 rounded-2xl">
          <ShieldCheck className="h-8 w-8 text-rose-500" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Parking Facility Not Found</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          {error || "We couldn't locate this parking facility. It may have been removed or is temporarily unavailable."}
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/parking"
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition"
          >
            Browse All Locations
          </Link>
          <button
            onClick={() => fetchDetails()}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#5669FF] hover:bg-[#4657E5] transition"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  const facilities = parking.facilities?.split(",") || [];
  const vehicleTypes = parking.supported_vehicle_types?.split(",") || [];

  const handleBookClick = (slotId?: number | null) => {
    const targetUrl = `/booking?parking_id=${parking.id}${slotId ? `&slot_id=${slotId}` : ""}`;
    if (!isAuthenticated) {
      setShowLoginModal(true);
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <>
      <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8 bg-[#F8F9FE]">
        
        {/* Top Breadcrumb & Status */}
        <div className="flex items-center justify-between">
          <Link
            href="/parking"
            className="inline-flex items-center gap-1.5 text-xs font-black text-[#5669FF] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Directory</span>
          </Link>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-1 rounded-full border border-emerald-200 shadow-2xs">
            ● Facility Online & Monitored
          </span>
        </div>

        {/* Main Info Card */}
        <div className="relative rounded-3xl border border-[#EBEAEE] bg-white p-6 sm:p-8 space-y-6 shadow-[0_10px_35px_rgba(86,105,255,0.06)] overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-[#5669FF] bg-[#5669FF]/10 px-3 py-1 rounded-full">
                  {parking.city || "Urban Smart Hub"}
                </span>
                <span className="flex items-center gap-1 text-xs text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  {parking.rating.toFixed(1)} ({parking.review_count} Reviews)
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-[#120D26]">{parking.name}</h1>
              <p className="text-xs sm:text-sm text-[#747688] flex items-center gap-1.5 font-medium">
                <MapPin className="h-4 w-4 text-[#5669FF] flex-shrink-0" />
                {parking.address}
              </p>
            </div>

            {/* Quick Book CTA Box */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto bg-[#F8F9FE] p-4 rounded-3xl border border-[#EBEAEE]">
              <div className="text-center sm:text-right px-4">
                <span className="text-[10px] text-[#747688] uppercase font-bold">Standard Rate</span>
                <div className="text-2xl font-black text-[#5669FF]">
                  {parking.price_per_hour} <span className="text-xs text-[#747688] font-normal">Credits/hr</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleBookClick(selectedSlotId)}
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black text-white bg-[#5669FF] hover:bg-[#4657E5] transition shadow-md shadow-[#5669FF]/25 active:scale-95 cursor-pointer"
              >
                <span>Buy Bay Now</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 4 Stats Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#F0F1F7]">
            <div className="rounded-2xl bg-[#F8F9FE] p-3.5 border border-[#EBEAEE] text-center">
              <div className="text-[11px] text-[#747688] font-medium">Available Bays</div>
              <div className="text-lg font-black text-emerald-600 mt-0.5">
                {parking.available_slots} / {parking.total_slots}
              </div>
            </div>

            <div className="rounded-2xl bg-[#F8F9FE] p-3.5 border border-[#EBEAEE] text-center">
              <div className="text-[11px] text-[#747688] font-medium">Hours of Operation</div>
              <div className="text-sm font-black text-[#120D26] mt-1">
                {parking.opening_time} - {parking.closing_time}
              </div>
            </div>

            <div className="rounded-2xl bg-[#F8F9FE] p-3.5 border border-[#EBEAEE] text-center">
              <div className="text-[11px] text-[#747688] font-medium">Coordinates</div>
              <div className="text-xs font-mono font-bold text-[#120D26] mt-1">
                {parking.latitude.toFixed(4)}, {parking.longitude.toFixed(4)}
              </div>
            </div>

            <div className="rounded-2xl bg-[#F8F9FE] p-3.5 border border-[#EBEAEE] text-center">
              <div className="text-[11px] text-[#747688] font-medium">Verification</div>
              <div className="text-xs font-black text-[#5669FF] mt-1 flex items-center justify-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                QR Touchless
              </div>
            </div>
          </div>
        </div>

        {/* Facilities & Vehicle Support */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Facilities Box */}
          <div className="rounded-3xl border border-[#EBEAEE] bg-white p-6 space-y-3 shadow-[0_10px_30px_rgba(86,105,255,0.04)]">
            <h3 className="text-sm font-black text-[#120D26] flex items-center gap-2">
              <Building className="h-4 w-4 text-[#5669FF]" />
              Amenities & Security Features
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#120D26] font-bold">
              {facilities.map((f, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#F8F9FE] p-2.5 rounded-2xl border border-[#EBEAEE]">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span>{f.trim()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Types Box */}
          <div className="rounded-3xl border border-[#EBEAEE] bg-white p-6 space-y-3 shadow-[0_10px_30px_rgba(86,105,255,0.04)]">
            <h3 className="text-sm font-black text-[#120D26] flex items-center gap-2">
              <Car className="h-4 w-4 text-[#5669FF]" />
              Supported Vehicle Bays
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs text-[#120D26] font-bold">
              {vehicleTypes.map((v, i) => (
                <div key={i} className="flex items-center gap-2 bg-[#F8F9FE] p-2.5 rounded-2xl border border-[#EBEAEE]">
                  <span className="h-2 w-2 rounded-full bg-[#5669FF]" />
                  <span>{v.trim()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Multi-Angle Parking Styles Showcase */}
        <ParkingStylesGallery />

        {/* Visual Slot Layout */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-[#120D26]">Interactive Slot Matrix</h2>
              <p className="text-xs text-[#747688] font-medium">Click on any AVAILABLE slot to preselect for booking</p>
            </div>
            {selectedSlotId && (
              <button
                type="button"
                onClick={() => handleBookClick(selectedSlotId)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black text-white bg-[#5669FF] hover:bg-[#4657E5] transition shadow-md shadow-[#5669FF]/20 cursor-pointer"
              >
                <span>Continue to Buy Selected Bay →</span>
              </button>
            )}
          </div>

          <SlotMatrix
            slots={parking.slots || []}
            selectedSlotId={selectedSlotId}
            facilityName={parking.name}
            facilityPrice={parking.price_per_hour}
            onSelectSlot={(slot) => {
              setSelectedSlotId(slot.id);
            }}
          />
        </div>

        {/* Reviews Section */}
        <div className="space-y-4 pt-6 border-t border-[#EBEAEE]">
          <h2 className="text-xl font-black text-[#120D26]">Driver Reviews & Ratings</h2>
          <ReviewList
            reviews={reviews}
            averageRating={parking.rating}
            totalReviews={parking.review_count}
          />
        </div>
      </div>

      {/* Login Modal for Guest User */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        redirectTo={`/booking?parking_id=${parking.id}${selectedSlotId ? `&slot_id=${selectedSlotId}` : ""}`}
        facilityName={parking.name}
      />
    </>
  );
}
