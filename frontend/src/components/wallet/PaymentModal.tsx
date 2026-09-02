"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { CreditPackage } from "@/types";
import { formatINR } from "@/lib/utils";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";
import {
  ShieldCheck,
  Zap,
  Lock,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Building2,
  ArrowRight,
  RefreshCw,
  BellRing,
} from "lucide-react";

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
  const { isAuthenticated } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<string>("UPI");
  const [step, setStep] = useState<"SELECT" | "QR_VERIFICATION" | "SUCCESS">("SELECT");
  const [processing, setProcessing] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(false);
  const [paymentData, setPaymentData] = useState<{
    transaction_id: string;
    qr_token: string;
    amount: number;
    credits: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !packageItem) return null;

  // Step 1: Initiate Payment & Generate QR
  const handleGenerateQR = async () => {
    if (!isAuthenticated) {
      if (typeof window !== "undefined") {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      }
      return;
    }
    setProcessing(true);
    setError(null);
    try {
      const res = await api.post("/wallet/initiate", {
        package_name: packageItem.name,
        amount: Math.round(packageItem.price_inr),
        payment_method: paymentMethod,
      });
      setPaymentData({
        transaction_id: res.data.transaction_id,
        qr_token: res.data.qr_token,
        amount: res.data.amount,
        credits: res.data.credits,
      });
      setStep("QR_VERIFICATION");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to initialize payment gateway.");
    } finally {
      setProcessing(false);
    }
  };

  // Step 2: Manager Verification Simulation & Instant Approval
  const handleManagerApprove = async () => {
    if (!paymentData) return;
    setVerifying(true);
    setError(null);
    try {
      await api.post("/wallet/verify", {
        qr_token: paymentData.qr_token,
        action: "APPROVE",
      });
      setStep("SUCCESS");
      setTimeout(async () => {
        await onConfirmPayment(packageItem.name, paymentMethod);
        handleResetAndClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Manager verification failed.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResetAndClose = () => {
    setStep("SELECT");
    setPaymentData(null);
    setError(null);
    setProcessing(false);
    setVerifying(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative max-w-md w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 border border-indigo-200">
              {!isAuthenticated ? <Lock className="h-5 w-5" /> : step === "QR_VERIFICATION" ? <QrCode className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {!isAuthenticated
                  ? "Sign In Required"
                  : step === "QR_VERIFICATION"
                  ? "Scan & Manager Verification"
                  : "Instant Credit Top-up Gateway"}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Touchless Smart Wallet Deposit</p>
            </div>
          </div>
          <button
            disabled={processing || verifying}
            onClick={handleResetAndClose}
            className="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg font-bold text-sm"
          >
            ✕
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="py-4 space-y-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Lock className="h-4 w-4 text-amber-700" />
                <span>Account Login Required</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Please log in to your ParkEase account before purchasing credits or selecting payment methods.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-slate-900">{packageItem.name} Package</span>
                <p className="text-slate-500 text-[11px]">+{packageItem.credits} Credits</p>
              </div>
              <span className="font-black text-slate-900 text-sm">{formatINR(packageItem.price_inr)}</span>
            </div>

            <div className="space-y-2 pt-2">
              <Link
                href={`/login?redirect=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.pathname + window.location.search : "/wallet"
                )}`}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-black text-white transition shadow-sm"
              >
                <span>Sign In to Continue</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

        {/* STEP 3: SUCCESS STATE */}
        {step === "SUCCESS" && (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 border-2 border-emerald-300 animate-bounce">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h4 className="text-xl font-black text-slate-900">Payment Approved & Confirmed!</h4>
            <p className="text-xs text-slate-600 font-medium max-w-xs">
              +{paymentData?.credits || packageItem.credits} Credits added to your wallet. Admin & User notifications dispatched.
            </p>
            <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-bold bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              <BellRing className="h-3.5 w-3.5" />
              <span>Admin notified via system dispatch</span>
            </div>
          </div>
        )}

        {/* STEP 2: DYNAMIC QR CODE & MANAGER VERIFICATION */}
        {step === "QR_VERIFICATION" && paymentData && (
          <div className="space-y-4">
            
            {/* Payment Summary */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-700">Ref: {paymentData.transaction_id}</span>
                <h4 className="text-sm font-black text-slate-900">{packageItem.name} Package</h4>
                <p className="text-xs text-emerald-700 font-bold">+{paymentData.credits} Wallet Credits</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Amount</span>
                <div className="text-lg font-black text-slate-900">{formatINR(paymentData.amount)}</div>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <QRCodeSVG
                value={`upi://pay?pa=parkease@upi&pn=ParkEaseHub&am=${paymentData.amount}&tr=${paymentData.transaction_id}&token=${paymentData.qr_token}`}
                size={180}
                level="H"
                includeMargin={true}
              />
              <div className="text-center space-y-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-black">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  Awaiting Manager Verification
                </span>
                <p className="text-[10px] font-mono font-bold text-slate-500">
                  TOKEN: {paymentData.qr_token.substring(0, 20)}...
                </p>
              </div>
            </div>

            {/* Manager Verification Simulation CTA */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                <Building2 className="h-4 w-4 text-indigo-600" />
                <span>Facility Manager Verification Gate</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Show this QR code to the Hub Manager, or click below to simulate instant manager approval.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                disabled={verifying}
                onClick={() => setStep("SELECT")}
                className="flex-1 rounded-xl bg-slate-100 py-3 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Back
              </button>
              <button
                type="button"
                disabled={verifying}
                onClick={handleManagerApprove}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-xs font-black text-white transition shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {verifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Approve & Credit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: METHOD SELECTION & PLAN DETAILS */}
        {step === "SELECT" && (
          <div className="space-y-4">
            {/* Package Summary Card */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/80 p-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-black text-indigo-700">Selected Plan</span>
                <h4 className="text-base font-black text-slate-900">{packageItem.name} Package</h4>
                <p className="text-xs text-emerald-700 font-bold mt-0.5">
                  +{packageItem.credits} Wallet Credits
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Total Payable</span>
                <div className="text-2xl font-black text-slate-900">{formatINR(packageItem.price_inr)}</div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
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
                    className={`p-3 rounded-2xl text-xs font-bold text-center border transition cursor-pointer ${
                      paymentMethod === method.id
                        ? "bg-indigo-600 border-2 border-indigo-600 text-white shadow-md"
                        : "bg-slate-50 border border-slate-200 text-slate-800 hover:bg-slate-100 hover:text-slate-900"
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Security Guarantee */}
            <div className="flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>Razorpay-ready architectural interface with 256-bit encrypted simulation.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={processing}
                onClick={handleResetAndClose}
                className="flex-1 rounded-xl bg-slate-100 py-3.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={processing}
                onClick={handleGenerateQR}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3.5 text-xs font-black text-white transition shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {processing ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <QrCode className="h-4 w-4" />
                    Generate Payment QR ({formatINR(packageItem.price_inr)})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}

