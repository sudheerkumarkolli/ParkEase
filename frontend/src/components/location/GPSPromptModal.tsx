"use client";

import React, { useState, useEffect } from "react";
import { Navigation, MapPin, Sparkles, X, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";

interface GPSPromptModalProps {
  onLocationDetected?: (coords: { lat: number; lng: number }) => void;
}

export default function GPSPromptModal({ onLocationDetected }: GPSPromptModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if user has already made a decision in this session
    const hasPrompted = sessionStorage.getItem("parkease_gps_prompted");
    const gpsStatus = localStorage.getItem("parkease_gps_status");

    // If never prompted this session and not already granted, open after brief delay
    if (!hasPrompted && gpsStatus !== "granted") {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleEnableGPS = () => {
    setError(null);
    setLoading(true);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        localStorage.setItem("parkease_gps_coords", JSON.stringify(coords));
        localStorage.setItem("parkease_gps_status", "granted");
        sessionStorage.setItem("parkease_gps_prompted", "true");

        setLoading(false);
        setSuccess(true);
        if (onLocationDetected) {
          onLocationDetected(coords);
        }

        // Close modal after brief success confirmation
        setTimeout(() => {
          setIsOpen(false);
        }, 1300);
      },
      (err) => {
        setLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setError("Location access was denied. You can still select cities manually.");
        } else {
          setError("Unable to retrieve GPS signal. Please try again.");
        }
        localStorage.setItem("parkease_gps_status", "denied");
        sessionStorage.setItem("parkease_gps_prompted", "true");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleDismiss = () => {
    sessionStorage.setItem("parkease_gps_prompted", "true");
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl border-2 border-[#5669FF]/30 bg-white p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F1F7] text-[#747688] hover:bg-[#EBEAEE] hover:text-[#120D26] transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header & Radar Animation */}
        <div className="text-center space-y-3">
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
            {/* Animated radar ripples */}
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#5669FF]/20 opacity-75"></span>
            <span className="relative inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5669FF] text-white shadow-xl shadow-[#5669FF]/30">
              <Navigation className="h-8 w-8 animate-pulse" />
            </span>
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#5669FF]/10 px-3 py-0.5 text-[11px] font-black text-[#5669FF]">
              <Sparkles className="h-3 w-3" />
              <span>Smart Live Navigation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#120D26]">
              Turn On GPS Location
            </h2>
          </div>

          <p className="text-xs text-[#747688] leading-relaxed font-medium">
            Enable your device GPS to automatically find the nearest parking facilities, calculate live walking distances, and get live turn-by-turn directions to available bays.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 font-bold flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>GPS Location Enabled! Loading nearest smart hubs...</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            disabled={loading || success}
            onClick={handleEnableGPS}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#5669FF] hover:bg-[#4657E5] text-white font-black text-xs transition shadow-lg shadow-[#5669FF]/25 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <MapPin className="h-4 w-4" />
            <span>{loading ? "Locating Your Vehicle..." : "Turn On GPS Location"}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            className="w-full py-2.5 rounded-2xl text-xs font-bold text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7] transition cursor-pointer"
          >
            Maybe Later
          </button>
        </div>

        {/* Security / Privacy guarantee */}
        <div className="pt-2 border-t border-[#F0F1F7] flex items-center justify-center gap-1.5 text-[10px] text-[#747688]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Used exclusively for nearest parking hub detection</span>
        </div>
      </div>
    </div>
  );
}
