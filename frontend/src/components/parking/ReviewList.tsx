"use client";

import React, { useState } from "react";
import { Review } from "@/types";
import { Star, MessageSquare, CheckCircle, User } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-5">
          <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 min-w-[90px]">
            <span className="text-3xl font-extrabold text-emerald-400">
              {averageRating ? averageRating.toFixed(1) : "5.0"}
            </span>
            <div className="flex items-center gap-0.5 mt-1 text-amber-400">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i <= Math.round(averageRating || 5) ? "fill-amber-400" : "text-slate-700"
                  }`}
                />
              ))}
            </div>
            <span className="text-[10px] text-slate-400 mt-1">{totalReviews} Verified</span>
          </div>

          <div>
            <h4 className="text-base font-bold text-white">Customer Satisfaction</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified drivers who reserved and parked at this location.
            </p>
          </div>
        </div>

        {canReview && onAddReview && (
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
          >
            <MessageSquare className="h-4 w-4" />
            Write a Review
          </button>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-500 text-xs">
            No reviews yet for this parking location.
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 transition hover:border-slate-700"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-xs">
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200">
                      {r.user_name || "Verified Driver"}
                    </span>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle className="h-3 w-3" />
                      <span>Verified ParkEase Booking</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i <= r.rating ? "fill-amber-400 text-amber-400" : "text-slate-800"
                      }`}
                    />
                  ))}
                  <span className="text-[10px] text-slate-500 ml-1.5">{formatDate(r.created_at)}</span>
                </div>
              </div>

              {r.comment && (
                <p className="text-xs text-slate-300 pl-10 leading-relaxed">{r.comment}</p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Write Review Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="max-w-md w-full rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Rate Your Parking Experience</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-7 w-7 ${
                          star <= selectedRating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-700"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">Your Feedback</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Share your experience (e.g. ease of entry, cleanliness, security)..."
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 rounded-xl bg-slate-800 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
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
