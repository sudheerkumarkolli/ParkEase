"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Booking } from "@/types";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import QRCodeDisplay from "@/components/booking/QRCodeDisplay";
import ReviewList from "@/components/parking/ReviewList";
import {
  ArrowLeft,
  Navigation,
  Ban,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Car,
  AlertTriangle,
  MessageSquare,
} from "lucide-react";

import { formatDateTime, getStatusBadgeClass, getErrorMessage } from "@/lib/utils";

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const bookingId = parseInt(resolvedParams.id);
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      const res = await api.get<Booking>(`/bookings/${bookingId}`);
      setBooking(res.data);
    } catch (err) {
      console.error("Failed to load booking:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking? 100% of your credits will be refunded back to your wallet immediately.")) {
      return;
    }

    setCancelling(true);
    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`);
      setCancelSuccess(res.data.message);
      await refreshUser();
      await fetchBooking();
    } catch (err: any) {
      alert(getErrorMessage(err, "Failed to cancel booking"));
    } finally {
      setCancelling(false);
    }
  };

  const handleReviewSubmit = async (rating: number, comment: string) => {
    await api.post("/reviews", {
      booking_id: bookingId,
      rating,
      comment,
    });
    alert("Thank you for your feedback! Your review has been published.");
  };

  if (loading || !booking) {
    return (
      <div className="max-w-4xl mx-auto p-8 space-y-6">
        <div className="h-96 rounded-3xl bg-white/60 animate-pulse border border-slate-100" />
      </div>
    );
  }

  const isCancellable = booking.status === "UPCOMING";
  const isCompleted = booking.status === "COMPLETED";

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto space-y-6">
      
      {/* Back Link */}
      <Link
        href="/bookings"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to All Bookings
      </Link>

      {cancelSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" />
          <span>{cancelSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: QR Smart Pass */}
        <div>
          <QRCodeDisplay booking={booking} />
        </div>

        {/* Right Column: Actions & Location Metadata */}
        <div className="space-y-6">
          
          {/* Destination Summary */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <span className="text-[10px] uppercase font-bold text-emerald-700">Parking Facility</span>
            <h2 className="text-xl font-black text-slate-900">{booking.parking?.name || "Smart Hub"}</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{booking.parking?.address}</p>

            {/* Navigation Button */}
            <a
              href={`https://www.openstreetmap.org/?mlat=${booking.parking?.latitude || 16.5}&mlon=${booking.parking?.longitude || 80.6}#map=16/${booking.parking?.latitude || 16.5}/${booking.parking?.longitude || 80.6}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 transition border border-slate-200 shadow-xs"
            >
              <Navigation className="h-4 w-4 text-emerald-600" />
              Get Turn-by-Turn Directions
            </a>
          </div>

          {/* Cancellation Control */}
          {isCancellable && (
            <div className="rounded-3xl border border-rose-200 bg-rose-50/70 p-6 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-800 font-black text-xs">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <span>Cancellation & Refund Policy</span>
                </div>
                {(() => {
                  const created = new Date(booking.created_at).getTime();
                  const now = Date.now();
                  const elapsedMs = now - created;
                  const fiveMinsMs = 5 * 60 * 1000;
                  const remainingSec = Math.max(0, Math.floor((fiveMinsMs - elapsedMs) / 1000));
                  const isWithin5Mins = remainingSec > 0;
                  const mins = Math.floor(remainingSec / 60);
                  const secs = remainingSec % 60;

                  return (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isWithin5Mins
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-amber-100 text-amber-900 border border-amber-300"
                    }`}>
                      {isWithin5Mins ? `Refund Window: ${mins}m ${secs}s` : "Non-Refundable"}
                    </span>
                  );
                })()}
              </div>

              {(() => {
                const created = new Date(booking.created_at).getTime();
                const now = Date.now();
                const isWithin5Mins = (now - created) <= 5 * 60 * 1000;

                return (
                  <>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {isWithin5Mins
                        ? `Cancel within 5 minutes for an immediate 100% credit refund (${booking.credits} credits). The hub manager will receive an automated refund alert.`
                        : `The 5-minute refund window has passed. You can still release your slot for other drivers, but credits will be retained as non-refundable and an alert will be sent to the administrator.`}
                    </p>
                    <button
                      onClick={handleCancel}
                      disabled={cancelling}
                      className={`w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black transition disabled:opacity-50 shadow-sm cursor-pointer ${
                        isWithin5Mins
                          ? "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20"
                          : "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20"
                      }`}
                    >
                      <Ban className="h-4 w-4" />
                      {cancelling
                        ? "Processing..."
                        : isWithin5Mins
                        ? `Cancel & Refund ${booking.credits} Credits`
                        : "Cancel Reservation (No Refund)"}
                    </button>
                  </>
                );
              })()}
            </div>
          )}

          {/* Review Module if Completed */}
          {isCompleted && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-amber-500" />
                Leave Feedback for this Facility
              </h3>
              <ReviewList
                reviews={[]}
                averageRating={5}
                totalReviews={1}
                canReview={true}
                onAddReview={handleReviewSubmit}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
