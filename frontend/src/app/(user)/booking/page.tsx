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
} from "lucide-react";

import { formatDateTime, getErrorMessage } from "@/lib/utils";

function BookingFlow() {
  const { user, refreshUser } = useAuth();
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
  const isBalanceSufficient = currentBalance >= totalCredits;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      router.push("/login");
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
      setError(`Insufficient credits. You need ${totalCredits} credits, but your balance is ${currentBalance}. Please top up.`);
      setShowTopupModal(true);
      return;
    }

    setSubmitting(true);
    try {
      // Build ISO datetime
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
      await refreshUser(); // update wallet balance in context
      router.push(`/bookings/${res.data.id}`);
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to complete reservation. Please try another slot."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto">
        <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
          Precision Reservation
        </span>
        <h1 className="text-3xl font-black text-white">Reserve Your Smart Parking Bay</h1>
        <p className="text-xs text-slate-400">
          Locked directly in our database with guaranteed arrival access and instant QR pass
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-medium flex items-center gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleBookingSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Steps & Selection */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* STEP 1: Select Parking Hub */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                1
              </div>
              <h3 className="text-sm font-bold text-white">Select Parking Hub</h3>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <select
                value={selectedParkingId || ""}
                onChange={(e) => setSelectedParkingId(parseInt(e.target.value))}
                aria-label="Select Parking Location"
                className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                2
              </div>
              <h3 className="text-sm font-bold text-white">Vehicle Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Plate Number</label>
                <div className="relative">
                  <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                    placeholder="AP 16 BQ 7788"
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950 pl-10 pr-4 py-3 text-xs uppercase font-mono font-bold text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Car">Car</option>
                  <option value="SUV">SUV</option>
                  <option value="Bike">Bike / Motorcycle</option>
                  <option value="EV">Electric Vehicle (EV)</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 3: Slot Matrix Selection */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                  3
                </div>
                <h3 className="text-sm font-bold text-white">Choose Your Parking Bay</h3>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400">
                Selected: {slots.find((s) => s.id === selectedSlotId)?.slot_number || "None"}
              </span>
            </div>

            <SlotMatrix
              slots={slots}
              selectedSlotId={selectedSlotId}
              onSelectSlot={(slot) => setSelectedSlotId(slot.id)}
            />
          </div>

          {/* STEP 4: Date, Time & Duration */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                4
              </div>
              <h3 className="text-sm font-bold text-white">Arrival Time & Duration</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Date</label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Arrival Time</label>
                <input
                  type="time"
                  required
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Duration (Hours)</label>
                <select
                  value={durationHours}
                  onChange={(e) => setDurationHours(parseFloat(e.target.value))}
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
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
          <div className="sticky top-24 rounded-3xl border border-slate-800 bg-slate-900/90 p-6 backdrop-blur-2xl shadow-2xl space-y-6">
            <h3 className="text-base font-bold text-white border-b border-slate-800 pb-3">
              Booking Summary
            </h3>

            {/* Parking Location Card */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400">Destination</span>
              <div className="text-sm font-extrabold text-white">{selectedParking?.name}</div>
              <p className="text-xs text-slate-400 line-clamp-1">{selectedParking?.address}</p>
            </div>

            {/* Slot & Time */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-2xl border border-slate-800">
              <div>
                <div className="text-[10px] text-slate-400">Bay No.</div>
                <div className="font-mono font-bold text-emerald-400 text-sm">
                  {slots.find((s) => s.id === selectedSlotId)?.slot_number || "Not Selected"}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Duration</div>
                <div className="font-bold text-white text-sm">{durationHours} Hours</div>
              </div>
            </div>

            {/* Price calculation */}
            <div className="space-y-2 border-t border-slate-800 pt-4 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Hourly Rate</span>
                <span>{ratePerHour} Credits / hr</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Duration</span>
                <span>{durationHours} hrs</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-white border-t border-slate-800 pt-2">
                <span>Total Payable</span>
                <span className="text-emerald-400">{totalCredits} Credits</span>
              </div>
            </div>

            {/* Wallet Balance Check */}
            <div className="rounded-2xl bg-slate-950 p-4 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Your Wallet Balance:</span>
                <span className="font-extrabold text-white">{currentBalance} Credits</span>
              </div>

              {!isBalanceSufficient && (
                <div className="pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] text-rose-400 font-semibold mb-2">
                    ⚠️ Short of {totalCredits - currentBalance} Credits
                  </div>
                  <Link
                    href="/wallet"
                    className="block text-center py-2 px-3 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
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
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 py-4 text-xs font-black text-slate-950 hover:from-emerald-300 transition shadow-xl shadow-emerald-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Reserving Slot..." : `Confirm & Pay ${totalCredits} Credits`}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 text-center">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
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
    <Suspense fallback={<div className="text-center py-20 text-xs text-slate-400">Loading booking engine...</div>}>
      <BookingFlow />
    </Suspense>
  );
}
