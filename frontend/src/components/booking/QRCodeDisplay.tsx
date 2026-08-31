"use client";

import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Booking } from "@/types";
import { formatDateTime, getStatusBadgeClass } from "@/lib/utils";
import { QrCode, ShieldCheck, MapPin, Calendar, Clock, Car, CheckCircle } from "lucide-react";

interface QRCodeDisplayProps {
  booking: Booking;
}

export default function QRCodeDisplay({ booking }: QRCodeDisplayProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 backdrop-blur-2xl shadow-2xl space-y-6">
      
      {/* Glow highlight */}
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />

      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-400">
            Official Smart Pass
          </span>
          <h3 className="text-base font-black text-white">{booking.booking_number}</h3>
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
      <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white shadow-inner">
        <QRCodeSVG
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

      {/* Booking Details Grid */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800/80">
          <div className="text-slate-400 flex items-center gap-1 mb-1">
            <Car className="h-3.5 w-3.5 text-emerald-400" />
            <span>Vehicle & Slot</span>
          </div>
          <div className="font-bold text-white">
            {booking.vehicle_number} ({booking.vehicle_type})
          </div>
          <div className="text-emerald-400 font-mono font-bold text-xs mt-0.5">
            Slot: {booking.slot?.slot_number || "Reserved Bay"}
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800/80">
          <div className="text-slate-400 flex items-center gap-1 mb-1">
            <Clock className="h-3.5 w-3.5 text-teal-400" />
            <span>Duration</span>
          </div>
          <div className="font-bold text-white">{booking.duration_hours} Hours</div>
          <div className="text-slate-300 font-semibold text-xs mt-0.5">
            {booking.credits} Credits Paid
          </div>
        </div>
      </div>

      {/* Start / End Time */}
      <div className="rounded-xl bg-slate-900/40 p-3 border border-slate-800 text-xs space-y-1">
        <div className="flex justify-between text-slate-400">
          <span>Valid From:</span>
          <span className="text-slate-200 font-semibold">{formatDateTime(booking.start_time)}</span>
        </div>
        <div className="flex justify-between text-slate-400">
          <span>Valid Till:</span>
          <span className="text-slate-200 font-semibold">{formatDateTime(booking.end_time)}</span>
        </div>
      </div>

      {/* Security Verification Notice */}
      <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-2.5 text-[11px] text-emerald-300">
        <ShieldCheck className="h-4 w-4 flex-shrink-0 text-emerald-400" />
        <span>Cryptographically verified QR token. Automatic entry upon scanning.</span>
      </div>
    </div>
  );
}
