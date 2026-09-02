"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import { Booking, Payment } from "@/types";
import { formatDateTime, formatINR, getStatusBadgeClass } from "@/lib/utils";
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertOctagon,
  Search,
  Car,
  Clock,
  Coins,
  ShieldCheck,
  RotateCw,
  ArrowRight,
  LogOut,
  LogIn,
  CreditCard,
  Building2,
  RefreshCw,
  BellRing,
} from "lucide-react";

export default function ManagerScannerPage() {
  const [scanMode, setScanMode] = useState<"GATE" | "PAYMENT">("GATE");
  const [qrInput, setQrInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);
  
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    action: string;
    message: string;
    booking?: Booking;
    credits_added?: number;
    transaction_id?: string;
    user_name?: string;
  } | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<any>(null);

  const fetchPendingPayments = async () => {
    try {
      setLoadingPayments(true);
      const res = await api.get<Payment[]>("/manager/pending-payments");
      setPendingPayments(res.data);
    } catch (err) {
      console.error("Failed to load pending payments:", err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const handleScanSubmit = async (token: string, actionType: "entry" | "exit" | "payment") => {
    if (!token.trim()) return;
    setProcessing(true);
    setScanResult(null);

    // Auto-detect payment tokens (UPITX- or PAY-)
    const isPaymentToken = actionType === "payment" || token.includes("UPITX-") || token.includes("token=UPITX-") || token.startsWith("PAY-");

    if (isPaymentToken) {
      let cleanToken = token.trim();
      if (cleanToken.includes("token=")) {
        cleanToken = cleanToken.split("token=")[1].split("&")[0];
      }
      try {
        const res = await api.post("/manager/verify-payment", {
          qr_token: cleanToken,
          action: "APPROVE",
        });
        setScanResult({
          success: res.data.success,
          action: "PAYMENT_APPROVED",
          message: res.data.message,
          credits_added: res.data.credits_added,
          transaction_id: res.data.transaction_id,
          user_name: res.data.user_name,
        });
        setQrInput("");
        fetchPendingPayments();
      } catch (err: any) {
        setScanResult({
          success: false,
          action: "PAYMENT_REJECTED",
          message: err.response?.data?.detail || "Payment token verification failed.",
        });
      } finally {
        setProcessing(false);
      }
      return;
    }

    const endpoint = actionType === "entry" ? "/manager/scan-entry" : "/manager/scan-exit";
    try {
      const res = await api.post(endpoint, {
        qr_token: token.trim(),
      });
      setScanResult(res.data);
      setQrInput("");
    } catch (err: any) {
      setScanResult({
        success: false,
        action: "INVALID",
        message: err.response?.data?.detail || "Invalid booking token or verification failed.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const startCameraScanner = async () => {
    try {
      const { Html5QrcodeScanner } = await import("html5-qrcode");
      setCameraActive(true);

      setTimeout(() => {
        const scanner = new Html5QrcodeScanner(
          "qr-reader",
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          false
        );

        scanner.render(
          (decodedText) => {
            setQrInput(decodedText);
            scanner.clear();
            setCameraActive(false);
            if (scanMode === "PAYMENT" || decodedText.includes("UPITX-") || decodedText.startsWith("PAY-")) {
              handleScanSubmit(decodedText, "payment");
            } else {
              handleScanSubmit(decodedText, "entry");
            }
          },
          (error) => {
            // Ignore frame scan errors
          }
        );
        scannerRef.current = scanner;
      }, 300);
    } catch (err) {
      console.error("Camera scanner error:", err);
      alert("Could not initialize camera scanner. Please use manual token entry.");
    }
  };

  const stopCameraScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear();
    }
    setCameraActive(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar type="manager" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-teal-600">
              Facility Verification Terminal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2 mt-1">
              <QrCode className="h-7 w-7 text-teal-600" />
              Gate Access & Payment QR Verification
            </h1>
            <p className="text-xs text-slate-500">
              Verify driver passes, validate parking permits, and approve UPI payment QR deposits
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
            <button
              onClick={() => setScanMode("GATE")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                scanMode === "GATE"
                  ? "bg-teal-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Gate Access Passes
            </button>
            <button
              onClick={() => setScanMode("PAYMENT")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                scanMode === "PAYMENT"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <CreditCard className="h-3.5 w-3.5" />
              Payment QR Deposits ({pendingPayments.length})
            </button>
          </div>
        </div>

        {/* Verification Result Banner */}
        {scanResult && (
          <div
            className={`p-6 rounded-3xl border shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4 ${
              scanResult.action === "ENTRY_APPROVED" || scanResult.action === "PAYMENT_APPROVED"
                ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                : scanResult.action === "EXIT_APPROVED"
                ? "bg-teal-50 border-teal-300 text-teal-950"
                : "bg-rose-50 border-rose-300 text-rose-950"
            }`}
          >
            <div className="flex items-center gap-3">
              {scanResult.success ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md">
                  <AlertOctagon className="h-7 w-7" />
                </div>
              )}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider block text-slate-500">
                  Verification Terminal Result
                </span>
                <h3 className="text-xl font-black text-slate-900">{scanResult.action}</h3>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-800">{scanResult.message}</p>

            {scanResult.booking && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200 text-xs">
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-semibold block">Pass No.</span>
                  <span className="font-mono font-bold text-slate-900">{scanResult.booking.booking_number}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-semibold block">Vehicle Plate</span>
                  <span className="font-mono font-bold text-slate-900">{scanResult.booking.vehicle_number}</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-semibold block">Duration</span>
                  <span className="font-bold text-slate-900">{scanResult.booking.duration_hours} hrs</span>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-400 font-semibold block">Status</span>
                  <span className="font-extrabold text-emerald-600">{scanResult.booking.status}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scanner & Manual Input Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Camera Scanner Box */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Camera className="h-4 w-4 text-teal-600" />
              Live Camera Scanner
            </h3>
            <p className="text-xs text-slate-500">
              Point your smartphone or web camera at the driver's QR Smart Pass or Payment QR.
            </p>

            {cameraActive ? (
              <div className="space-y-3">
                <div id="qr-reader" className="w-full rounded-2xl overflow-hidden bg-slate-950" />
                <button
                  onClick={stopCameraScanner}
                  className="w-full py-3 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 shadow-md transition cursor-pointer"
                >
                  Stop Camera Scanner
                </button>
              </div>
            ) : (
              <button
                onClick={startCameraScanner}
                className="w-full py-12 rounded-2xl border-2 border-dashed border-teal-300 bg-teal-50/50 hover:border-teal-500 hover:bg-teal-50 transition flex flex-col items-center justify-center gap-2 group shadow-sm cursor-pointer"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-600 text-white group-hover:scale-105 shadow-md shadow-teal-600/20 transition">
                  <Camera className="h-7 w-7" />
                </div>
                <span className="text-xs font-extrabold text-teal-900">Launch Camera Scanner</span>
                <span className="text-[11px] text-teal-600 font-medium">Auto-detects Pass and Payment QRs</span>
              </button>
            )}
          </div>

          {/* Manual Token Verification Box */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Search className="h-4 w-4 text-emerald-600" />
                Manual Token Verification
              </h3>
              <p className="text-xs text-slate-500">
                Enter QR token (e.g., QR-XXXX or UPITX-XXXX or PAY-XXXX)
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  QR Token String
                </label>
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Paste QR-xxx or UPITX-xxx..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2 pt-4">
              {scanMode === "PAYMENT" || qrInput.includes("UPITX-") || qrInput.startsWith("PAY-") ? (
                <button
                  type="button"
                  disabled={processing || !qrInput.trim()}
                  onClick={() => handleScanSubmit(qrInput, "payment")}
                  className="flex items-center justify-center gap-1.5 w-full py-3.5 rounded-2xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md transition disabled:opacity-40 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{processing ? "Verifying Payment..." : "Verify & Approve Payment"}</span>
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    disabled={processing || !qrInput.trim()}
                    onClick={() => handleScanSubmit(qrInput, "entry")}
                    className="flex items-center justify-center gap-1.5 w-full py-3.5 rounded-2xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md transition disabled:opacity-40 cursor-pointer"
                  >
                    <LogIn className="h-4 w-4" />
                    <span>{processing ? "Verifying..." : "Approve ENTRY"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={processing || !qrInput.trim()}
                    onClick={() => handleScanSubmit(qrInput, "exit")}
                    className="flex items-center justify-center gap-1.5 w-full py-3.5 rounded-2xl text-xs font-black text-white bg-teal-600 hover:bg-teal-700 active:scale-95 shadow-md transition disabled:opacity-40 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{processing ? "Verifying..." : "Approve EXIT"}</span>
                  </button>
                </div>
              )}
              <span className="text-[10px] text-slate-400 text-center block font-medium">
                Automatic slot state transition & database update
              </span>
            </div>
          </div>
        </div>

        {/* Pending Payment Approvals Queue */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-black text-slate-900">Pending Driver Payment Approvals</h3>
            </div>
            <button
              onClick={fetchPendingPayments}
              className="flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingPayments ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {pendingPayments.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 font-medium">
              No pending driver payments awaiting verification.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {pendingPayments.map((p) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        {p.transaction_id}
                      </span>
                      <span className="text-xs font-black text-slate-900">{p.package_name}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Requested {formatDateTime(p.created_at)} · via {p.payment_method}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900">{formatINR(p.amount)}</span>
                      <span className="block text-[10px] font-bold text-emerald-700">+{p.credits} Credits</span>
                    </div>

                    <button
                      onClick={() => handleScanSubmit(p.qr_token || p.transaction_id, "payment")}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-sm transition active:scale-95 cursor-pointer"
                    >
                      Approve & Credit
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
