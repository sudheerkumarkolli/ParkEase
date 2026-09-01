"use client";

import React, { useState, useEffect, useRef } from "react";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import { Booking } from "@/types";
import { formatDateTime, getStatusBadgeClass } from "@/lib/utils";
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
} from "lucide-react";

export default function ManagerScannerPage() {
  const [qrInput, setQrInput] = useState("");
  const [processing, setProcessing] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    action: string;
    message: string;
    booking?: Booking;
  } | null>(null);

  const [cameraActive, setCameraActive] = useState(false);
  const scannerRef = useRef<any>(null);

  const handleScanSubmit = async (token: string, actionType: "entry" | "exit") => {
    if (!token.trim()) return;
    setProcessing(true);
    setScanResult(null);

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
            // Default to entry check
            handleScanSubmit(decodedText, "entry");
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

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl">
        
        {/* Header */}
        <div className="border-b border-slate-200 pb-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-600">
            Access Control Verification
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2 mt-1">
            <QrCode className="h-7 w-7 text-teal-600" />
            Gate Entry & Exit QR Scanner
          </h1>
          <p className="text-xs text-slate-500">
            Verify driver booking passes, validate gate permits, and transition slot occupancies in real-time
          </p>
        </div>

        {/* Verification Result Banner */}
        {scanResult && (
          <div
            className={`p-6 rounded-3xl border shadow-lg space-y-4 animate-in fade-in slide-in-from-top-4 ${
              scanResult.action === "ENTRY_APPROVED"
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
                  Gate Verification Result
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
              Live Device Camera Scanner
            </h3>
            <p className="text-xs text-slate-500">
              Point your smartphone or web camera at the driver's QR Smart Pass.
            </p>

            {cameraActive ? (
              <div className="space-y-3">
                <div id="qr-reader" className="w-full rounded-2xl overflow-hidden bg-slate-950" />
                <button
                  onClick={stopCameraScanner}
                  className="w-full py-3 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 shadow-md transition"
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
                <span className="text-[11px] text-teal-600 font-medium">Auto-detects QR Smart Passes</span>
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
                Enter or paste the token string shown on the driver's pass (e.g., QR-XXXXX)
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  QR Token String
                </label>
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Paste QR-xxxxxxxx-xxxx..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:outline-none shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={processing || !qrInput.trim()}
                  onClick={() => handleScanSubmit(qrInput, "entry")}
                  className="flex items-center justify-center gap-1.5 w-full py-3.5 rounded-2xl text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 shadow-md shadow-emerald-600/25 transition disabled:opacity-40 cursor-pointer"
                >
                  <LogIn className="h-4 w-4" />
                  <span>{processing ? "Verifying..." : "Approve ENTRY"}</span>
                </button>

                <button
                  type="button"
                  disabled={processing || !qrInput.trim()}
                  onClick={() => handleScanSubmit(qrInput, "exit")}
                  className="flex items-center justify-center gap-1.5 w-full py-3.5 rounded-2xl text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/25 transition disabled:opacity-40 cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{processing ? "Verifying..." : "Approve EXIT"}</span>
                </button>
              </div>
              <span className="text-[10px] text-slate-400 text-center block font-medium">
                Automatic slot state transition & database update
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
