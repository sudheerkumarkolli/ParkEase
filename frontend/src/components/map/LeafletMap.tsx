"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ParkingLocation } from "@/types";
import {
  MapPin,
  Navigation,
  Sparkles,
  Car,
  Clock,
  Coins,
  ShieldCheck,
  ChevronRight,
  RotateCw,
  SlidersHorizontal,
} from "lucide-react";

interface LeafletMapProps {
  parkings: ParkingLocation[];
  userLocation: { lat: number; lng: number } | null;
  onLocationChange?: (lat: number, lng: number) => void;
  radiusKm?: number;
  onRadiusChange?: (radius: number) => void;
  selectedParkingId?: number | null;
  onSelectParking?: (parking: ParkingLocation) => void;
}

export default function LeafletMap({
  parkings,
  userLocation,
  onLocationChange,
  radiusKm = 10,
  onRadiusChange,
  selectedParkingId,
  onSelectParking,
}: LeafletMapProps) {
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [activePopup, setActivePopup] = useState<ParkingLocation | null>(null);

  useEffect(() => {
    // Dynamically load Leaflet CSS & JS
    if (typeof window !== "undefined") {
      import("leaflet").then((L) => {
        // Fix Leaflet marker icon paths in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
        setMapReady(true);
      });
    }
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        if (onLocationChange) {
          onLocationChange(latitude, longitude);
        }
        setLocating(false);
      },
      (err) => {
        console.error("Location error:", err);
        alert("Could not access your location. Please check your browser location permissions.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Setup Leaflet DOM rendering
  useEffect(() => {
    if (!mapReady || typeof window === "undefined") return;

    const L = require("leaflet");
    const container = document.getElementById("leaflet-map-container");
    if (!container) return;

    // Check if map already initialized on this container
    if ((container as any)._leaflet_id) {
      container.innerHTML = "";
    }

    const defaultLat = userLocation?.lat || 16.5062; // Vijayawada / AP hub default
    const defaultLng = userLocation?.lng || 80.6480;

    const map = L.map("leaflet-map-container", {
      center: [defaultLat, defaultLng],
      zoom: 13,
      zoomControl: false,
    });

    // Dark/modern OpenStreetMap tiles
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    // User Location Pulse Marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: "custom-user-marker",
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute h-8 w-8 rounded-full bg-violet-500/30 animate-ping"></div>
            <div class="h-5 w-5 rounded-full bg-violet-500 border-2 border-white shadow-xl flex items-center justify-center">
              <div class="h-2 w-2 rounded-full bg-white"></div>
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup("<div class='font-bold text-xs p-1 text-slate-900'>📍 Your Current Location</div>");

      // Radius circle
      if (radiusKm) {
        L.circle([userLocation.lat, userLocation.lng], {
          radius: radiusKm * 1000,
          color: "#10b981",
          fillColor: "#10b981",
          fillOpacity: 0.08,
          weight: 1.5,
          dashArray: "4, 6",
        }).addTo(map);
      }
    }

    // Parking Location Markers
    parkings.forEach((p) => {
      const availRatio = p.total_slots > 0 ? p.available_slots / p.total_slots : 0;
      let badgeColor = "#10b981"; // 🟢 Green > 30%
      let statusEmoji = "🟢";
      let statusText = "Available";

      if (p.available_slots === 0) {
        badgeColor = "#f43f5e"; // 🔴 Red
        statusEmoji = "🔴";
        statusText = "Full";
      } else if (availRatio <= 0.3) {
        badgeColor = "#f59e0b"; // 🟡 Amber
        statusEmoji = "🟡";
        statusText = "Limited";
      }

      const parkingIcon = L.divIcon({
        className: "custom-parking-marker",
        html: `
          <div style="background-color: ${badgeColor}; border: 2px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.5);" class="flex items-center gap-1 px-2.5 py-1 rounded-full text-white font-extrabold text-xs cursor-pointer hover:scale-110 transition-transform">
            <span>🅿️</span>
            <span>${p.available_slots}</span>
          </div>
        `,
        iconSize: [60, 28],
        iconAnchor: [30, 14],
      });

      const marker = L.marker([p.latitude, p.longitude], { icon: parkingIcon }).addTo(map);

      marker.on("click", () => {
        setActivePopup(p);
        if (onSelectParking) {
          onSelectParking(p);
        }
      });
    });

    return () => {
      map.remove();
    };
  }, [mapReady, parkings, userLocation, radiusKm]);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-100 bg-slate-950 shadow-2xl">
      {/* Leaflet DOM container */}
      <div id="leaflet-map-container" className="w-full h-full min-h-[500px] z-10" />

      {/* Floating Top Controls */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        
        {/* Find Parking Near Me Button */}
        <button
          onClick={detectLocation}
          disabled={locating}
          className="pointer-events-auto flex items-center gap-2 rounded-xl bg-white/90 border border-violet-500/40 px-4 py-2.5 text-sm font-semibold text-violet-400 backdrop-blur-xl shadow-xl hover:bg-violet-500/20 transition transform active:scale-95"
        >
          <Navigation className={`h-4 w-4 ${locating ? "animate-spin" : ""}`} />
          {locating ? "Locating You..." : "Find Parking Near Me"}
        </button>

        {/* Radius Filter Pills */}
        {onRadiusChange && (
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-xl bg-white/90 border border-slate-100 p-1 backdrop-blur-xl shadow-xl text-xs font-semibold text-slate-600">
            <span className="px-2 text-slate-500 hidden sm:inline">Radius:</span>
            {[5, 10, 20, 50].map((r) => (
              <button
                key={r}
                onClick={() => onRadiusChange(r)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  radiusKm === r ? "bg-violet-500 text-slate-950 font-bold" : "hover:text-white"
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 rounded-xl bg-white/90 border border-slate-100 px-3 py-2 text-xs font-medium text-slate-600 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
          <span>Available (&gt;30%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          <span>Limited (&lt;30%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
          <span>Full</span>
        </div>
      </div>

      {/* Floating Selected Parking Modal Card */}
      {activePopup && (
        <div className="absolute bottom-4 right-4 max-w-sm w-[calc(100%-2rem)] z-30 rounded-2xl border border-slate-100 bg-white/95 p-4 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-violet-400">
                {activePopup.city || "Smart Parking"}
              </span>
              <h3 className="text-base font-bold text-white leading-tight">{activePopup.name}</h3>
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{activePopup.address}</p>
            </div>
            <button
              onClick={() => setActivePopup(null)}
              className="text-slate-500 hover:text-white p-1"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 my-3 rounded-xl bg-slate-950/60 p-2.5 border border-slate-100/80 text-center">
            <div>
              <div className="text-[10px] text-slate-500">Available</div>
              <div className="text-sm font-extrabold text-violet-400">
                {activePopup.available_slots} / {activePopup.total_slots}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Rate/hr</div>
              <div className="text-sm font-extrabold text-white">{activePopup.price_per_hour} Cr</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">Rating</div>
              <div className="text-sm font-extrabold text-amber-400">⭐ {activePopup.rating}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/parking/${activePopup.id}`}
              className="flex-1 text-center py-2 px-3 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-700 hover:text-white transition"
            >
              View Details
            </Link>
            <Link
              href={`/booking?parking_id=${activePopup.id}`}
              className="flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-violet-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 transition shadow-md shadow-violet-500/20"
            >
              Book Now
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
