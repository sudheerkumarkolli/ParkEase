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
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="manager" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl">
        
        {/* Header */}
        <div className="border-b border-slate-800 pb-4">
          <span className="text-xs font-extrabold uppercase tracking-widest text-teal-400">
            Access Control Verification
          </span>
          <h1 className="text-2xl font-black text-white flex items-center gap-2 mt-1">
            <QrCode className="h-6 w-6 text-teal-400" />
            Gate Entry & Exit QR Scanner
          </h1>
          <p className="text-xs text-slate-400">
            Verify driver booking passes, validate gate permits, and transition slot occupancies in real-time
          </p>
        </div>

        {/* Verification Result Banner */}
        {scanResult && (
          <div
            className={`p-6 rounded-3xl border backdrop-blur-2xl shadow-2xl space-y-4 animate-in fade-in slide-in-from-top-4 ${
              scanResult.action === "ENTRY_APPROVED"
                ? "bg-emerald-950/40 border-emerald-500/50 text-emerald-300"
                : scanResult.action === "EXIT_APPROVED"
                ? "bg-teal-950/40 border-teal-500/50 text-teal-300"
                : "bg-rose-950/40 border-rose-500/50 text-rose-300"
            }`}
          >
            <div className="flex items-center gap-3">
              {scanResult.success ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400">
                  <AlertOctagon className="h-8 w-8" />
                </div>
              )}
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider block">
                  Gate Verification Status
                </span>
                <h3 className="text-xl font-black text-white">{scanResult.action}</h3>
              </div>
            </div>

            <p className="text-sm font-semibold">{scanResult.message}</p>

            {scanResult.booking && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-white/10 text-xs text-white">
                <div className="bg-slate-950/60 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-400 block">Pass No.</span>
                  <span className="font-mono font-bold">{scanResult.booking.booking_number}</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-400 block">Vehicle Plate</span>
                  <span className="font-mono font-bold">{scanResult.booking.vehicle_number}</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-400 block">Duration</span>
                  <span className="font-bold">{scanResult.booking.duration_hours} hrs</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-2xl">
                  <span className="text-[10px] text-slate-400 block">Updated State</span>
                  <span className="font-bold text-emerald-400">{scanResult.booking.status}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Scanner & Manual Input Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Camera Scanner Box */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Camera className="h-4 w-4 text-teal-400" />
              Live Device Camera Scanner
            </h3>
            <p className="text-xs text-slate-400">
              Point your smartphone or web camera at the driver's QR Smart Pass.
            </p>

            {cameraActive ? (
              <div className="space-y-3">
                <div id="qr-reader" className="w-full rounded-2xl overflow-hidden bg-slate-950" />
                <button
                  onClick={stopCameraScanner}
                  className="w-full py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Stop Camera
                </button>
              </div>
            ) : (
              <button
                onClick={startCameraScanner}
                className="w-full py-12 rounded-2xl border-2 border-dashed border-slate-700 bg-slate-950/60 hover:border-teal-500/50 hover:bg-teal-500/5 transition flex flex-col items-center justify-center gap-2 group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 group-hover:scale-110 transition">
                  <Camera className="h-6 w-6" />
                </div>
                <span className="text-xs font-bold text-slate-200">Start Camera Scanner</span>
                <span className="text-[10px] text-slate-500">Requires camera permissions</span>
              </button>
            )}
          </div>

          {/* Manual Token Verification Box */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Search className="h-4 w-4 text-emerald-400" />
                Manual Token Verification
              </h3>
              <p className="text-xs text-slate-400">
                Enter or paste the token string shown on the driver's pass (e.g., QR-XXXXX)
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  QR Token String
                </label>
                <input
                  type="text"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                  placeholder="Paste QR-xxxxxxxx-xxxx..."
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950 p-3 text-xs font-mono text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={processing || !qrInput.trim()}
                  onClick={() => handleScanSubmit(qrInput, "entry")}
                  className="w-full py-3.5 rounded-2xl text-xs font-black text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 transition shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
                >
                  {processing ? "Checking..." : "Approve ENTRY"}
                </button>

                <button
                  type="button"
                  disabled={processing || !qrInput.trim()}
                  onClick={() => handleScanSubmit(qrInput, "exit")}
                  className="w-full py-3.5 rounded-2xl text-xs font-black text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition active:scale-95 disabled:opacity-50"
                >
                  {processing ? "Checking..." : "Approve EXIT"}
                </button>
              </div>
              <span className="text-[10px] text-slate-500 text-center block">
                Automatic slot state transition in database
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
