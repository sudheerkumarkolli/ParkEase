"use client";

import React, { useState } from "react";
import { CreditPackage } from "@/types";
import { formatINR } from "@/lib/utils";
import PaymentModal from "./PaymentModal";
import { Sparkles, CheckCircle2, Zap, Shield, ChevronRight, ArrowRight } from "lucide-react";

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
          <h3 className="text-lg font-black text-[#120D26]">Top Up Parking Credits</h3>
          <p className="text-xs text-[#747688] font-medium">1 Credit = ₹1 utility value · Instant touchless checkout</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#5669FF] font-black bg-[#5669FF]/10 px-3 py-1.5 rounded-full border border-[#5669FF]/20">
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
                  ? "border-2 border-[#5669FF] bg-white shadow-[0_15px_40px_rgba(86,105,255,0.15)] scale-[1.02]"
                  : "border border-[#EBEAEE] bg-white hover:border-[#5669FF]/50 hover:shadow-md"
              }`}
            >
              {/* Badge */}
              {pkg.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-[#F0635A] px-3.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-md">
                    {pkg.badge}
                  </span>
                </div>
              )}

              <div>
                <div className="text-xs font-black uppercase text-[#747688] mb-1">{pkg.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[#120D26]">{pkg.credits}</span>
                  <span className="text-xs font-bold text-[#5669FF]">Credits</span>
                </div>
                <div className="mt-2 text-xl font-black text-[#120D26]">
                  {formatINR(pkg.price_inr)}
                </div>
                <p className="text-[11px] text-[#747688] mt-1 font-medium">
                  Ideal for ~{Math.round(pkg.credits / 25)} hours of multi-level smart parking.
                </p>

                <ul className="mt-4 space-y-2 text-xs text-[#747688] font-medium">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#5669FF] flex-shrink-0" />
                    <span>Instant wallet top-up</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#5669FF] flex-shrink-0" />
                    <span>No expiration date</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#5669FF] flex-shrink-0" />
                    <span>Valid at all smart hubs</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={() => handleSelect(pkg)}
                className={`mt-6 flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black transition shadow-md active:scale-95 cursor-pointer ${
                  pkg.popular
                    ? "bg-[#5669FF] text-white hover:bg-[#4657E5] shadow-[#5669FF]/30"
                    : "bg-[#F0F1F7] text-[#120D26] hover:bg-[#5669FF] hover:text-white"
                }`}
              >
                <span>Purchase Package</span>
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight className="h-3 w-3" />
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Payment Modal */}
      {selectedPackage && (
        <PaymentModal
          isOpen={modalOpen}
          packageItem={selectedPackage}
          onClose={() => setModalOpen(false)}
          onConfirmPayment={handleConfirm}
        />
      )}
    </div>
  );
}
