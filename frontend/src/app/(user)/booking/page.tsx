"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ParkingLocation, ParkingSlot } from "@/types";
import { api } from "@/lib/api";
import SlotMatrix from "@/components/parking/SlotMatrix";
import PaymentModal from "@/components/wallet/PaymentModal";
import {
  Calendar,
  Clock,
  Car,
  Coins,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  MapPin,
  Sparkles,
  Lock,
  ArrowLeft,
  UserCheck,
} from "lucide-react";

import { formatDateTime, getErrorMessage } from "@/lib/utils";

function BookingFlow() {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [parkings, setParkings] = useState<ParkingLocation[]>([]);
  const [selectedParkingId, setSelectedParkingId] = useState<number | null>(null);
  const [selectedParking, setSelectedParking] = useState<ParkingLocation | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  // Form states
  const [vehicleNumber, setVehicleNumber] = useState<string>("");
  const [vehicleType, setVehicleType] = useState<string>("Car");
  const [bookingDate, setBookingDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [durationHours, setDurationHours] = useState<number>(2);

  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showTopupModal, setShowTopupModal] = useState<boolean>(false);

  // Initialize date & defaults
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setBookingDate(today);

    const now = new Date();
    now.setMinutes(now.getMinutes() + 15);
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    setStartTime(timeStr);

    if (user) {
      if (user.vehicle_number) setVehicleNumber(user.vehicle_number);
      if (user.vehicle_type) setVehicleType(user.vehicle_type);
    }
  }, [user]);

  // Load all active parkings
  useEffect(() => {
    const fetchParkings = async () => {
      try {
        setLoading(true);
        const res = await api.get<ParkingLocation[]>("/parking");
        setParkings(res.data);

        // Preselect from URL if provided
        const qParkingId = searchParams.get("parking_id");
        if (qParkingId) {
          const pid = parseInt(qParkingId);
          setSelectedParkingId(pid);
          const found = res.data.find((p) => p.id === pid);
          if (found) setSelectedParking(found);
        } else if (res.data.length > 0) {
          setSelectedParkingId(res.data[0].id);
          setSelectedParking(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to load parkings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchParkings();
  }, [searchParams]);

  // Load slots when selected parking changes
  useEffect(() => {
    if (!selectedParkingId) return;

    const fetchSlots = async () => {
      try {
        const res = await api.get<ParkingSlot[]>(`/parking/${selectedParkingId}/slots`);
        setSlots(res.data);

        const qSlotId = searchParams.get("slot_id");
        if (qSlotId) {
          setSelectedSlotId(parseInt(qSlotId));
        } else {
          // Preselect first available slot matching vehicle
          const avail = res.data.find((s) => s.status === "AVAILABLE");
          if (avail) setSelectedSlotId(avail.id);
        }
      } catch (err) {
        console.error("Failed to load slots:", err);
      }
    };

    fetchSlots();
    const p = parkings.find((item) => item.id === selectedParkingId);
    if (p) setSelectedParking(p);
  }, [selectedParkingId, parkings, searchParams]);

  // Calculations
  const ratePerHour = selectedParking?.price_per_hour || 20;
  const totalCredits = Math.ceil(ratePerHour * durationHours);
  const currentBalance = user?.wallet_balance || 0;
  const isBalanceSufficient = isAuthenticated && currentBalance >= totalCredits;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user || !isAuthenticated) {
      const redirect = typeof window !== "undefined" ? encodeURIComponent(window.location.pathname + window.location.search) : "/booking";
      router.push(`/login?redirect=${redirect}`);
      return;
    }

    if (!selectedParkingId || !selectedSlotId) {
      setError("Please select a parking location and an available slot.");
      return;
    }

    if (!vehicleNumber.trim()) {
      setError("Please enter your vehicle license plate number.");
      return;
    }

    if (!isBalanceSufficient) {
      setShowTopupModal(true);
      return;
    }

    setSubmitting(true);
    try {
      const startDateTime = new Date(`${bookingDate}T${startTime}:00Z`);

      const payload = {
        parking_id: selectedParkingId,
        slot_id: selectedSlotId,
        vehicle_number: vehicleNumber.toUpperCase(),
        vehicle_type: vehicleType,
        start_time: startDateTime.toISOString(),
        duration_hours: durationHours,
      };

      const res = await api.post("/bookings", payload);
      await refreshUser();
      router.push(`/bookings/${res.data.id}`);
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to complete reservation. Please try another slot."));
    } finally {
      setSubmitting(false);
    }
  };

  // If NOT authenticated, show a dedicated, high-priority Sign In Requirement Gate
  if (!isAuthenticated) {
    const redirectUrl = typeof window !== "undefined" ? encodeURIComponent(window.location.pathname + window.location.search) : "/booking";

    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#F8F9FE] px-4 py-12 flex items-center justify-center">
        <div className="max-w-lg w-full rounded-3xl border border-[#EBEAEE] bg-white p-8 sm:p-10 shadow-[0_20px_60px_rgba(86,105,255,0.08)] text-center space-y-6 animate-in fade-in zoom-in-95">
          
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-[#5669FF]/10 text-[#5669FF] shadow-inner">
            <Lock className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <span>Authentication Required</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#120D26]">
              Sign In to Book Parking Bay
            </h1>
            <p className="text-xs sm:text-sm text-[#747688] leading-relaxed font-medium">
              Guest users can browse availability and rates freely. To confirm your reservation, lock a real-time bay, and receive your digital QR entry pass, please sign in.
            </p>
          </div>

          {selectedParking && (
            <div className="rounded-2xl bg-[#F8F9FE] p-4 border border-[#EBEAEE] text-left text-xs space-y-1">
              <span className="text-[10px] font-bold uppercase text-[#747688]">Selected Facility</span>
              <div className="font-black text-sm text-[#120D26]">{selectedParking.name}</div>
              <div className="text-[#747688] truncate font-medium">{selectedParking.address}</div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            <Link
              href={`/login?redirect=${redirectUrl}`}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-[#5669FF] hover:bg-[#4657E5] text-white font-black text-xs transition shadow-lg shadow-[#5669FF]/25 active:scale-95 cursor-pointer"
            >
              <UserCheck className="h-4 w-4" />
              <span>Sign In with Account</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href={`/register?redirect=${redirectUrl}`}
              className="w-full block py-3.5 rounded-2xl bg-[#F0F1F7] hover:bg-[#EBEAEE] text-[#120D26] font-bold text-xs transition cursor-pointer"
            >
              Create Free Account (+100 Credits)
            </Link>

            <Link
              href="/parking"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#747688] hover:text-[#120D26] pt-2"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Parking Directory</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto space-y-8 bg-[#F8F9FE]">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#5669FF] bg-[#5669FF]/10 px-3.5 py-1 rounded-full border border-[#5669FF]/20">
          Precision Reservation
        </span>
        <h1 className="text-3xl font-black text-[#120D26]">Reserve Your Smart Parking Bay</h1>
        <p className="text-xs text-[#747688] font-medium">
          Locked directly in our database with guaranteed arrival access and instant QR pass
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-center gap-3 shadow-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Steps & Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: Select Parking Hub */}
          <div className="rounded-3xl border border-[#EBEAEE] bg-white p-6 shadow-[0_10px_30px_rgba(86,105,255,0.04)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F0F1F7] pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#5669FF]/10 text-[#5669FF] font-black text-xs">
                1
              </div>
              <h3 className="text-sm font-black text-[#120D26]">Select Parking Hub</h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <select
                value={selectedParkingId || ""}
                onChange={(e) => setSelectedParkingId(parseInt(e.target.value))}
                aria-label="Select Parking Location"
                className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] p-3.5 text-xs font-bold text-[#120D26] focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15"
              >
                {parkings.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.city}) - {p.available_slots} Slots Available ({p.price_per_hour} Cr/hr)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* STEP 2: Vehicle Information */}
          <div className="rounded-3xl border border-[#EBEAEE] bg-white p-6 shadow-[0_10px_30px_rgba(86,105,255,0.04)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F0F1F7] pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#5669FF]/10 text-[#5669FF] font-black text-xs">
                2
              </div>
              <h3 className="text-sm font-black text-[#120D26]">Vehicle Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-[#120D26] mb-1.5">Plate Number</label>
                <div className="relative">
                  <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#747688]" />
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="AP 16 BQ 7788"
                    className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] pl-10 pr-4 py-3.5 text-xs uppercase font-mono font-black text-[#120D26] placeholder-[#747688] focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#120D26] mb-1.5">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] px-4 py-3.5 text-xs font-bold text-[#120D26] focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15"
                >
                  <option value="Car">Car</option>
                  <option value="SUV">SUV</option>
                  <option value="Bike">Bike</option>
                  <option value="EV">EV</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 3: Slot Matrix Selection */}
          <div className="rounded-3xl border border-[#EBEAEE] bg-white p-6 shadow-[0_10px_30px_rgba(86,105,255,0.04)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0F1F7] pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#5669FF]/10 text-[#5669FF] font-black text-xs">
                  3
                </div>
                <h3 className="text-sm font-black text-[#120D26]">Select Specific Bay</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                {slots.filter((s) => s.status === "AVAILABLE").length} Bays Free
              </span>
            </div>

            <SlotMatrix
              slots={slots}
              selectedSlotId={selectedSlotId}
              onSelectSlot={(slot) => setSelectedSlotId(slot.id)}
            />
          </div>

          {/* STEP 4: Date, Time & Duration */}
          <div className="rounded-3xl border border-[#EBEAEE] bg-white p-6 shadow-[0_10px_30px_rgba(86,105,255,0.04)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[#F0F1F7] pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#5669FF]/10 text-[#5669FF] font-black text-xs">
                4
              </div>
              <h3 className="text-sm font-black text-[#120D26]">Timing & Duration</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-black text-[#120D26] mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] p-3.5 text-xs font-bold text-[#120D26] focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#120D26] mb-1.5">Start Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] p-3.5 text-xs font-bold text-[#120D26] focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#120D26] mb-1.5">Duration (Hours)</label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseFloat(e.target.value))}
                  className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] p-3.5 text-xs font-bold text-[#120D26] focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 12, 24].map((h) => (
                    <option key={h} value={h}>
                      {h} {h === 1 ? "Hour" : "Hours"}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Checkout & Summary Pass */}
        <div className="space-y-6">
          <div className="sticky top-24 rounded-3xl border border-[#EBEAEE] bg-white p-6 shadow-xl shadow-[#5669FF]/5 space-y-6">
            <h3 className="text-base font-black text-[#120D26] border-b border-[#F0F1F7] pb-3">
              Booking Summary
            </h3>

            {/* Parking Location Card */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-[#747688]">Destination</span>
              <div className="text-sm font-black text-[#120D26]">{selectedParking?.name}</div>
              <p className="text-xs text-[#747688] line-clamp-1">{selectedParking?.address}</p>
            </div>

            {/* Slot & Time */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-[#F8F9FE] p-3.5 rounded-2xl border border-[#EBEAEE]">
              <div>
                <div className="text-[10px] text-[#747688] font-medium">Bay No.</div>
                <div className="font-mono font-black text-[#5669FF] text-sm">
                  {slots.find((s) => s.id === selectedSlotId)?.slot_number || "Not Selected"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-[#747688] font-medium">Duration</div>
                <div className="font-black text-[#120D26] text-sm">{durationHours} Hours</div>
              </div>
            </div>

            {/* Price calculation */}
            <div className="space-y-2 border-t border-[#F0F1F7] pt-4 text-xs font-medium text-[#747688]">
              <div className="flex justify-between">
                <span>Hourly Rate</span>
                <span className="font-bold text-[#120D26]">{ratePerHour} Credits / hr</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-bold text-[#120D26]">{durationHours} hrs</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#120D26] border-t border-[#F0F1F7] pt-2">
                <span>Total Payable</span>
                <span className="text-[#5669FF]">{totalCredits} Credits</span>
              </div>
            </div>

            {/* Wallet Balance Check */}
            <div className="rounded-2xl bg-[#F8F9FE] p-4 border border-[#EBEAEE] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#747688] font-semibold">Your Wallet Balance:</span>
                <span className="font-black text-[#120D26]">{currentBalance} Credits</span>
              </div>

              {!isBalanceSufficient && (
                <div className="pt-2 border-t border-[#EBEAEE]">
                  <div className="text-[11px] text-rose-600 font-bold mb-2">
                    ⚠️ Short of {totalCredits - currentBalance} Credits
                  </div>
                  <Link
                    href="/wallet"
                    className="block text-center py-2 px-3 rounded-xl text-xs font-black text-[#5669FF] bg-[#5669FF]/10 border border-[#5669FF]/20 hover:bg-[#5669FF]/20 transition"
                  >
                    Top Up Credits Now →
                  </Link>
                </div>
              )}
            </div>

            {/* Submit CTA */}
            <button
              type="submit"
              disabled={submitting || !selectedSlotId || !isBalanceSufficient}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#5669FF] hover:bg-[#4657E5] py-4 text-xs font-black text-white transition shadow-lg shadow-[#5669FF]/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {submitting ? "Reserving Slot..." : `Confirm & Pay ${totalCredits} Credits`}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#747688] text-center font-medium">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              <span>Full credit refund available prior to start time</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs text-[#747688]">Loading booking engine...</div>}>
      <BookingFlow />
    </Suspense>
  );
}
