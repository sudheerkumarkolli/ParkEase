"use client";

import React, { useState } from "react";
import { Review } from "@/types";
import { Star, MessageSquare, CheckCircle, User, Sparkles } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ReviewListProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
  onAddReview?: (rating: number, comment: string) => Promise<void>;
  canReview?: boolean;
}

export default function ReviewList({
  reviews,
  averageRating,
  totalReviews,
  onAddReview,
  canReview = false,
}: ReviewListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRating, setSelectedRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddReview) return;
    setSubmitting(true);
    try {
      await onAddReview(selectedRating, comment);
      setModalOpen(false);
      setComment("");
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Summary Score Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl border border-[#EBEAEE] bg-white p-6 shadow-[0_10px_30px_rgba(86,105,255,0.05)]">
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-[#F0F1F7] border border-[#EBEAEE] p-4 min-w-[90px]">
            <span className="text-3xl font-black text-[#120D26]">
              {averageRating ? averageRating.toFixed(1) : "5.0"}
            </span>
            <div className="flex items-center gap-0.5 mt-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i <= Math.round(averageRating || 5)
                      ? "fill-amber-400 text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] font-bold text-[#747688] mt-1">{totalReviews} Verified</span>
          </div>

          <div>
            <h4 className="text-base font-black text-[#120D26]">Driver Satisfaction Score</h4>
            <p className="text-xs text-[#747688] mt-0.5 font-medium">
              Verified drivers who reserved bays and parked at this smart facility.
            </p>
          </div>
        </div>

        {canReview && onAddReview && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-2xl bg-[#5669FF] px-5 py-3 text-xs font-black text-white hover:bg-[#4657E5] transition shadow-md shadow-[#5669FF]/25 cursor-pointer active:scale-95"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Write a Review</span>
          </button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-[#EBEAEE] bg-white p-8 text-center text-[#747688] text-xs font-medium">
            No driver reviews yet for this facility.
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-3xl border border-[#EBEAEE] bg-white p-5 shadow-[0_4px_20px_rgba(86,105,255,0.04)] transition hover:border-[#5669FF]/40 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#5669FF]/10 text-[#5669FF] font-black text-xs">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-[#120D26]">
                      {r.user_name || "Verified Driver"}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
                      <CheckCircle className="h-3 w-3" />
                      <span>Verified ParkEase Booking</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"
                      }`}
                    />
                  ))}
                  <span className="text-[11px] font-bold text-[#747688] ml-1.5">{formatDate(r.created_at)}</span>
                </div>
              </div>

              {r.comment && (
                <p className="text-xs text-[#120D26] pl-12 leading-relaxed font-medium">{r.comment}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Write Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full rounded-3xl border border-[#EBEAEE] bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#F0F1F7] pb-3">
              <h3 className="text-base font-black text-[#120D26]">Rate Your Parking Experience</h3>
              <button onClick={() => setModalOpen(false)} className="text-[#747688] hover:text-[#120D26] font-bold text-sm cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#120D26] mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      className="p-1 hover:scale-110 transition-transform cursor-pointer"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= selectedRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-[#120D26] mb-2">Your Feedback</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience (e.g. ease of entry, cleanliness, security)..."
                  className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] p-3 text-xs text-[#120D26] placeholder-[#747688] font-medium focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl bg-[#F0F1F7] py-3 text-xs font-bold text-[#747688] hover:bg-[#EBEAEE] hover:text-[#120D26] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-[#5669FF] py-3 text-xs font-black text-white hover:bg-[#4657E5] transition shadow-md shadow-[#5669FF]/20 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Post Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

