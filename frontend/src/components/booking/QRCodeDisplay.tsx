"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Booking } from "@/types";
import { formatDateTime, getStatusBadgeClass } from "@/lib/utils";
import {
  QrCode,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Car,
  Download,
  CheckCircle,
  FileCheck,
} from "lucide-react";

interface QRCodeDisplayProps {
  booking: Booking;
}

export default function QRCodeDisplay({ booking }: QRCodeDisplayProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownloadPass = () => {
    setDownloading(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Set high-res canvas (600 x 860)
      canvas.width = 600;
      canvas.height = 860;

      // 1. Background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, 860);
      bgGrad.addColorStop(0, "#0F172A"); // slate-900
      bgGrad.addColorStop(1, "#020617"); // slate-950
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 600, 860);

      // 2. Rounded border card effect
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, 580, 840);

      // 3. Header Accent Bar
      ctx.fillStyle = "#5669FF";
      ctx.fillRect(20, 20, 560, 80);

      // Brand text
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText("PARKEASE SMART PASS", 40, 68);

      ctx.fillStyle = "#E0E7FF";
      ctx.font = "bold 13px sans-serif";
      ctx.fillText("DIGITAL PERMIT", 430, 68);

      // Pass Reference
      ctx.fillStyle = "#94A3B8";
      ctx.font = "bold 12px sans-serif";
      ctx.fillText("PASS NUMBER", 40, 135);
      ctx.fillStyle = "#F8FAFC";
      ctx.font = "bold 20px monospace";
      ctx.fillText(booking.booking_number, 40, 162);

      // Status Badge
      ctx.fillStyle = booking.status === "CANCELLED" ? "#EF4444" : "#10B981";
      ctx.fillRect(420, 135, 140, 32);
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 14px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(booking.status, 490, 156);
      ctx.textAlign = "left";

      // White Container for QR Code
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(150, 195, 300, 300);

      // Draw QR code from SVG
      const svg = document.getElementById(`booking-qr-svg-${booking.id}`) as SVGElement | null;
      if (svg) {
        const xml = new XMLSerializer().serializeToString(svg);
        const svg64 = btoa(unescape(encodeURIComponent(xml)));
        const image64 = "data:image/svg+xml;base64," + svg64;
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 160, 205, 280, 280);

          // Details Section Box
          ctx.fillStyle = "#1E293B";
          ctx.fillRect(40, 520, 520, 240);

          // Facility Name & Address
          ctx.fillStyle = "#38BDF8";
          ctx.font = "bold 18px sans-serif";
          ctx.fillText(booking.parking?.name || "Smart Parking Facility", 60, 555);

          ctx.fillStyle = "#94A3B8";
          ctx.font = "12px sans-serif";
          ctx.fillText(booking.parking?.address || "City Smart Parking Zone", 60, 580);

          // Vehicle Plate & Slot
          ctx.fillStyle = "#E2E8F0";
          ctx.font = "bold 14px sans-serif";
          ctx.fillText(`Vehicle: ${booking.vehicle_number} (${booking.vehicle_type})`, 60, 625);

          ctx.fillStyle = "#A855F7";
          ctx.font = "bold 14px monospace";
          ctx.fillText(`Slot: ${booking.slot?.slot_number || "Reserved Bay"}`, 340, 625);

          // Timings
          ctx.fillStyle = "#CBD5E1";
          ctx.font = "12px sans-serif";
          ctx.fillText(`Valid From: ${formatDateTime(booking.start_time)}`, 60, 665);
          ctx.fillText(`Valid Till: ${formatDateTime(booking.end_time)}`, 60, 690);

          // Credits Paid
          ctx.fillStyle = "#10B981";
          ctx.font = "bold 13px sans-serif";
          ctx.fillText(`Total Paid: ${booking.credits} Credits (${booking.duration_hours} hrs)`, 60, 730);

          // Footer Security Seal
          ctx.fillStyle = "#64748B";
          ctx.font = "11px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText("Valid only for single entry & exit. Show this QR to the gate scanner.", 300, 800);
          ctx.fillText("ParkEase Automated Infrastructure · 256-Bit Cryptographic Pass", 300, 825);

          // Trigger download
          const a = document.createElement("a");
          a.download = `ParkEase_Pass_${booking.booking_number}.png`;
          a.href = canvas.toDataURL("image/png");
          a.click();
          setDownloading(false);
        };
        img.src = image64;
      } else {
        setDownloading(false);
      }
    } catch (e) {
      console.error("Pass download failed:", e);
      setDownloading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl space-y-6">
      
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-indigo-600">
            Official Smart Pass
          </span>
          <h3 className="text-base font-black text-slate-900">{booking.booking_number}</h3>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border ${getStatusBadgeClass(
            booking.status
          )}`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {booking.status}
        </span>
      </div>

      {/* QR Code Container */}
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
        <QRCodeSVG
          id={`booking-qr-svg-${booking.id}`}
          value={booking.qr_token}
          size={190}
          level="H"
          includeMargin={true}
        />
        <div className="mt-3 text-center">
          <p className="text-[11px] font-mono font-bold text-slate-800 tracking-wider">
            TOKEN: {booking.qr_token.substring(0, 16)}...
          </p>
          <p className="text-[10px] text-slate-500 font-medium mt-0.5">
            Scan at entry gate barrier or show parking attendant
          </p>
        </div>
      </div>

      {/* Download QR Pass Button */}
      <button
        type="button"
        onClick={handleDownloadPass}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-black shadow-md shadow-indigo-600/25 transition disabled:opacity-50 cursor-pointer"
      >
        {downloading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            <span>Generating High-Res Pass...</span>
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            <span>Download Pass to Device (PNG)</span>
          </>
        )}
      </button>

      {/* Booking Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
          <div className="text-slate-600 flex items-center gap-1 mb-1 font-bold">
            <Car className="h-3.5 w-3.5 text-indigo-600" />
            <span>Vehicle & Slot</span>
          </div>
          <div className="font-black text-slate-900">
            {booking.vehicle_number} ({booking.vehicle_type})
          </div>
          <div className="text-indigo-700 font-mono font-bold text-xs mt-0.5">
            Slot: {booking.slot?.slot_number || "Reserved Bay"}
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
          <div className="text-slate-600 flex items-center gap-1 mb-1 font-bold">
            <Clock className="h-3.5 w-3.5 text-teal-600" />
            <span>Duration</span>
          </div>
          <div className="font-black text-slate-900">{booking.duration_hours} Hours</div>
          <div className="text-emerald-700 font-black text-xs mt-0.5">
            {booking.credits} Credits Paid
          </div>
        </div>
      </div>

      {/* Start / End Time */}
      <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs space-y-1">
        <div className="flex justify-between text-slate-600 font-medium">
          <span>Valid From:</span>
          <span className="text-slate-900 font-bold">{formatDateTime(booking.start_time)}</span>
        </div>
        <div className="flex justify-between text-slate-600 font-medium">
          <span>Valid Till:</span>
          <span className="text-slate-900 font-bold">{formatDateTime(booking.end_time)}</span>
        </div>
      </div>

      {/* Security Verification Notice */}
      <div className="flex items-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200 p-3 text-[11px] text-indigo-900 font-medium">
        <ShieldCheck className="h-4 w-4 flex-shrink-0 text-indigo-600" />
        <span>Cryptographically verified QR token. Automatic entry upon scanning.</span>
      </div>
    </div>
  );
}

