"use client";

import React, { useState } from "react";
import { CreditPackage } from "@/types";
import { formatINR } from "@/lib/utils";
import PaymentModal from "./PaymentModal";
import { Sparkles, CheckCircle2, Zap, Shield, ChevronRight } from "lucide-react";

interface CreditPackagesProps {
  packages: CreditPackage[];
  onPurchaseSuccess: () => Promise<void>;
  onBuyPackage: (packageName: string, paymentMethod: string) => Promise<void>;
}

export default function CreditPackages({
  packages,
  onPurchaseSuccess,
  onBuyPackage,
}: CreditPackagesProps) {
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSelect = (pkg: CreditPackage) => {
    setSelectedPackage(pkg);
    setModalOpen(true);
  };

  const handleConfirm = async (packageName: string, paymentMethod: string) => {
    await onBuyPackage(packageName, paymentMethod);
    await onPurchaseSuccess();
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-white">Top Up Parking Credits</h3>
          <p className="text-xs text-slate-400">1 Credit = ₹1 default utility value with bundle savings</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
          <Zap className="h-3.5 w-3.5" />
          Instant Auto-Credited
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {packages.map((pkg) => {
          return (
            <div
              key={pkg.id}
              className={`relative flex flex-col justify-between rounded-3xl p-6 transition-all duration-300 ${
                pkg.popular
                  ? "border-2 border-emerald-500 bg-gradient-to-b from-emerald-950/40 via-slate-900/90 to-slate-950 shadow-xl shadow-emerald-500/10 scale-105"
                  : "border border-slate-800 bg-slate-900/60 hover:border-slate-700"
              }`}
            >
              {/* Badge */}
              {pkg.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-emerald-500 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950 shadow-md">
                    {pkg.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="text-xs font-bold uppercase text-slate-400 mb-1">{pkg.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white">{pkg.credits}</span>
                  <span className="text-xs font-bold text-emerald-400">Credits</span>
                </div>
                <div className="mt-2 text-xl font-bold text-slate-200">
                  {formatINR(pkg.price_inr)}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ideal for ~{Math.round(pkg.credits / 25)} hours of multi-level smart parking.
                </p>

                <ul className="mt-4 space-y-2 text-xs text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Instant wallet top-up</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    <span>No expiration date</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                    <span>Valid at all locations</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelect(pkg)}
                className={`mt-6 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-xs font-bold transition shadow-md active:scale-95 ${
                  pkg.popular
                    ? "bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 hover:from-emerald-300 hover:to-teal-200 shadow-emerald-500/20"
                    : "bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
                }`}
              >
                <span>Purchase Pack</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        packageItem={selectedPackage}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirmPayment={handleConfirm}
      />
    </div>
  );
}
