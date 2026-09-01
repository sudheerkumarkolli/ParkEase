"use client";

import React, { useState } from "react";
import { CreditPackage } from "@/types";
import { formatINR } from "@/lib/utils";
import { ShieldCheck, Zap, Lock, CreditCard, Sparkles, CheckCircle2 } from "lucide-react";

interface PaymentModalProps {
  packageItem: CreditPackage | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (packageName: string, paymentMethod: string) => Promise<void>;
}

export default function PaymentModal({
  packageItem,
  isOpen,
  onClose,
  onConfirmPayment,
}: PaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");
  const [processing, setProcessing] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);

  if (!isOpen || !packageItem) return null;

  const handlePay = async () => {
    setProcessing(true);
    try {
      await onConfirmPayment(packageItem.name, paymentMethod);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setProcessing(false);
        onClose();
      }, 1800);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Payment simulation failed");
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in">
      <div className="relative max-w-md w-full rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-500/20 text-violet-400">
              <CreditCard className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Simulated Payment Checkout</h3>
              <p className="text-[11px] text-slate-500">Instant Credit Top-up Gateway</p>
            </div>
          </div>
          <button
            disabled={processing}
            onClick={onClose}
            className="text-slate-500 hover:text-white p-1"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-500/20 text-violet-400 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h4 className="text-lg font-extrabold text-white">Payment Successful!</h4>
            <p className="text-xs text-slate-500">
              {packageItem.credits} Credits have been credited to your wallet balance.
            </p>
          </div>
        ) : (
          <>
            {/* Package Summary Card */}
            <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-violet-400">Selected Plan</span>
                <h4 className="text-base font-extrabold text-white">{packageItem.name} Package</h4>
                <p className="text-xs text-emerald-300 font-semibold mt-0.5">
                  +{packageItem.credits} Wallet Credits
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500">Total Payable</span>
                <div className="text-xl font-black text-white">{formatINR(packageItem.price_inr)}</div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600">
                Choose Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "UPI", label: "Instant UPI / GPay" },
                  { id: "CARD", label: "Credit / Debit Card" },
                  { id: "NETBANKING", label: "Net Banking" },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3 rounded-2xl text-xs font-semibold text-center border transition ${
                      paymentMethod === method.id
                        ? "bg-slate-50 border-violet-500 text-white shadow-md"
                        : "bg-slate-950/60 border-slate-100 text-slate-500 hover:text-white"
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-950 p-2.5 rounded-xl border border-slate-100/80">
              <ShieldCheck className="h-4 w-4 text-violet-400 flex-shrink-0" />
              <span>Razorpay-ready architectural interface with 256-bit encrypted simulation.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={processing}
                onClick={onClose}
                className="flex-1 rounded-xl bg-slate-50 py-3 text-xs font-semibold text-slate-600 hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handlePay}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-400 to-teal-300 py-3 text-xs font-extrabold text-slate-950 hover:from-emerald-300 hover:to-teal-200 transition shadow-lg shadow-violet-500/20 active:scale-95 disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    Pay {formatINR(packageItem.price_inr)}
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
