"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ParkingLocation } from "@/types";
import { api } from "@/lib/api";
import { MapPin, Navigation, ArrowLeft, RefreshCw, PlusCircle, CheckCircle } from "lucide-react";
import Link from "next/link";

// Dynamic import for Leaflet (SSR false)
const LeafletMap = dynamic(() => import("@/components/map/LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[600px] flex items-center justify-center bg-slate-950 rounded-2xl border border-slate-100">
      <div className="flex flex-col items-center gap-3">
        <span className="h-8 w-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <span className="text-xs text-slate-500 font-semibold">Initializing OpenStreetMap & Leaflet...</span>
      </div>
    </div>
  ),
});

export default function LiveMapPage() {
  const [parkings, setParkings] = useState<ParkingLocation[]>([]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [radiusKm, setRadiusKm] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(true);
  const [requestStatus, setRequestStatus] = useState<"idle" | "loading" | "success">("idle");
  const [locationState, setLocationState] = useState<"prompting" | "granted" | "denied" | "unsupported">("prompting");

  const requestUserLocation = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocationState("unsupported");
      return;
    }
    setLocationState("prompting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationState("granted");
      },
      (err) => {
        console.warn("Geolocation permission not granted or turned off:", err);
        setLocationState("denied");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  // Automatically ask browser for location on mount
  useEffect(() => {
    requestUserLocation();
  }, []);

  const fetchParkings = async () => {
    try {
      setLoading(true);
      let url = "/parking";
      if (userLocation) {
        url = `/parking/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius_km=${radiusKm}`;
      }
      const res = await api.get<ParkingLocation[]>(url);
      setParkings(res.data);
    } catch (err) {
      console.error("Failed to load map parking pins:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkings();
    setRequestStatus("idle");
  }, [userLocation, radiusKm]);

  const handleRequestParking = async () => {
    if (!userLocation) return;
    try {
      setRequestStatus("loading");
      await api.post("/parking/nearby/request", {
        latitude: userLocation.lat,
        longitude: userLocation.lng,
      });
      setRequestStatus("success");
    } catch (err) {
      console.error("Failed to request parking:", err);
      setRequestStatus("idle");
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/parking"
            className="p-2.5 rounded-2xl bg-white border border-[#EBEAEE] text-[#120D26] hover:bg-[#F0F1F7] transition shadow-xs"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#120D26] flex items-center gap-2">
              <MapPin className="h-6 w-6 text-[#5669FF]" />
              Live Interactive Map
            </h1>
            <p className="text-xs text-[#747688] font-medium">
              Visualizing {parkings.length} parking hubs with real-time occupancy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchParkings}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black text-[#120D26] bg-white border border-[#EBEAEE] hover:bg-[#F0F1F7] transition shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-[#5669FF] ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Pins</span>
          </button>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative w-full h-[calc(100vh-14rem)] min-h-[550px] rounded-3xl overflow-hidden border border-[#EBEAEE] shadow-[0_10px_35px_rgba(86,105,255,0.06)]">
        
        {/* Location Turned Off / Permission Prompt Bar */}
        {!userLocation && locationState !== "granted" && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-lg bg-white/95 backdrop-blur-xl border border-amber-200 p-3.5 rounded-2xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Navigation className="h-4 w-4 animate-pulse" />
              </div>
              <div className="text-left">
                <h4 className="text-xs font-black text-[#120D26]">Turn On Location</h4>
                <p className="text-[11px] text-[#747688]">
                  {locationState === "denied"
                    ? "Location is blocked. Please allow location access in your browser."
                    : "Allow location access to view live parking spots near you."}
                </p>
              </div>
            </div>
            <button
              onClick={requestUserLocation}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black text-white bg-[#5669FF] hover:bg-[#4555e0] transition shadow-md shadow-[#5669FF]/20 cursor-pointer"
            >
              <Navigation className="h-3.5 w-3.5" />
              <span>{locationState === "prompting" ? "Asking..." : "Turn On"}</span>
            </button>
          </div>
        )}

        {/* Empty State / Request Parking Banner */}
        {!loading && parkings.length === 0 && userLocation && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[90%] max-w-md bg-white/95 backdrop-blur-xl border border-rose-100 p-4 rounded-2xl shadow-xl flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4">
            <h3 className="text-sm font-bold text-[#120D26]">No Hubs Found</h3>
            <p className="text-xs text-[#747688] mt-1 mb-3">
              We couldn't find any smart parking hubs within {radiusKm}km of your location.
            </p>
            {requestStatus === "success" ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                <CheckCircle className="h-4 w-4" />
                Request sent to Admins!
              </div>
            ) : (
              <button
                onClick={handleRequestParking}
                disabled={requestStatus === "loading"}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-[#5669FF] hover:opacity-90 transition shadow-md cursor-pointer"
              >
                <PlusCircle className={`h-4 w-4 ${requestStatus === "loading" ? "animate-spin" : ""}`} />
                {requestStatus === "loading" ? "Sending Request..." : "Request a Hub Here"}
              </button>
            )}
          </div>
        )}

        <LeafletMap
          parkings={parkings}
          userLocation={userLocation}
          onLocationChange={(lat, lng) => setUserLocation({ lat, lng })}
          radiusKm={radiusKm}
          onRadiusChange={(r) => setRadiusKm(r)}
        />
      </div>
    </div>
  );
}
