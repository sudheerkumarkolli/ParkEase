"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ParkingLocation } from "@/types";
import { api } from "@/lib/api";
import { MapPin, Navigation, ArrowLeft, RefreshCw } from "lucide-react";
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
  }, [userLocation, radiusKm]);

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-4">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/parking"
            className="p-2 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-white hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-emerald-400" />
              Live Interactive Map
            </h1>
            <p className="text-xs text-slate-500">
              Visualizing {parkings.length} parking hubs with real-time occupancy
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchParkings}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-100 hover:bg-slate-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh Pins
          </button>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="w-full h-[calc(100vh-14rem)] min-h-[550px]">
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
