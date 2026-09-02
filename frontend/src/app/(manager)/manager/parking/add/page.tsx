"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import {
  Building2,
  ArrowLeft,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Car,
  Shield,
  Navigation,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import GPSPromptModal from "@/components/location/GPSPromptModal";

export default function AddParkingLocationPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Vijayawada");
  const [latitude, setLatitude] = useState(16.5062);
  const [longitude, setLongitude] = useState(80.6480);
  const [gpsSynced, setGpsSynced] = useState(false);
  const [gpsFetching, setGpsFetching] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const [totalSlots, setTotalSlots] = useState(20);
  const [pricePerHour, setPricePerHour] = useState(20);
  const [openingTime, setOpeningTime] = useState("06:00");
  const [closingTime, setClosingTime] = useState("23:00");
  const [facilities, setFacilities] = useState("CCTV,Covered Parking,Security Guard,EV Charging");
  const [supportedVehicles, setSupportedVehicles] = useState("Car,Bike,SUV,EV");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync GPS Coordinates from the enabled location service (saved on login or device GPS)
  const syncLocationService = (forcePrompt = false) => {
    setGpsFetching(true);
    setGpsError(null);

    // 1. First check if coordinates are already stored from the enabled location service on login
    const savedCoords = localStorage.getItem("parkease_gps_coords");
    if (savedCoords && !forcePrompt) {
      try {
        const parsed = JSON.parse(savedCoords);
        if (parsed?.lat && parsed?.lng) {
          setLatitude(Number(parsed.lat.toFixed(6)));
          setLongitude(Number(parsed.lng.toFixed(6)));
          setGpsSynced(true);
          setGpsFetching(false);
          return;
        }
      } catch (e) {
        // Fall through to browser geolocation
      }
    }

    // 2. Request live GPS coordinates from the browser location service
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = {
            lat: Number(pos.coords.latitude.toFixed(6)),
            lng: Number(pos.coords.longitude.toFixed(6)),
          };
          setLatitude(coords.lat);
          setLongitude(coords.lng);
          localStorage.setItem("parkease_gps_coords", JSON.stringify(coords));
          localStorage.setItem("parkease_gps_status", "granted");
          setGpsSynced(true);
          setGpsFetching(false);
        },
        (err) => {
          setGpsFetching(false);
          if (err.code === err.PERMISSION_DENIED) {
            setGpsError("Location permission denied. Please allow location access or input manually.");
          } else {
            setGpsError("Could not retrieve GPS location service. Using current values.");
          }
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setGpsFetching(false);
      setGpsError("Geolocation is not supported by your browser");
    }
  };

  useEffect(() => {
    syncLocationService();
  }, []);

  // Facility Name change handler enforcing alphabet letters and spaces
  const handleNameChange = (val: string) => {
    setName(val);
    if (!val.trim()) {
      setNameError("Facility name is required.");
    } else if (!/^[a-zA-Z\s]+$/.test(val)) {
      setNameError("Facility name must only contain alphabet letters (A-Z, a-z) and spaces. Numbers and special characters are not allowed.");
    } else {
      setNameError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate facility name is alphabet only
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please provide a facility name.");
      return;
    }
    if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      setError("Facility name must only contain alphabet letters (A-Z, a-z) and spaces.");
      return;
    }

    setLoading(true);

    try {
      await api.post("/parking", {
        name: trimmedName,
        address: address.trim(),
        city: city.trim(),
        latitude: parseFloat(latitude.toString()),
        longitude: parseFloat(longitude.toString()),
        total_slots: parseInt(totalSlots.toString()),
        price_per_hour: parseInt(pricePerHour.toString()),
        opening_time: openingTime,
        closing_time: closingTime,
        facilities,
        supported_vehicle_types: supportedVehicles,
        description,
        image_url: imageUrl,
      });
      router.push("/manager/parking");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to create parking location");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar type="manager" />

      {/* GPS Prompt Modal */}
      <GPSPromptModal
        onLocationDetected={(coords) => {
          setLatitude(Number(coords.lat.toFixed(6)));
          setLongitude(Number(coords.lng.toFixed(6)));
          setGpsSynced(true);
        }}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl">
        
        {/* Back Link */}
        <Link
          href="/manager/parking"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Facilities List
        </Link>

        <div className="border-b border-slate-200 pb-4">
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-teal-600" />
            Register New Parking Facility
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Provide facility metadata, validated alphabet name, and GPS coordinates automatically synced from your enabled location service.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5 shadow-sm">
          
          {/* FACILITY NAME (ALPHABET ONLY VALIDATION) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-black text-slate-800">
                Facility Name <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] font-bold text-teal-700">
                Alphabet characters only (A-Z)
              </span>
            </div>
            
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Benz Circle Multi Level Hub"
              className={`w-full rounded-2xl border p-3.5 text-xs text-slate-900 placeholder-slate-400 font-semibold focus:outline-none transition ${
                nameError
                  ? "border-rose-400 bg-rose-50/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                  : "border-slate-200 bg-slate-50 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-100"
              }`}
            />

            {nameError ? (
              <p className="text-[11px] font-bold text-rose-600 flex items-center gap-1 mt-1 animate-in fade-in">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{nameError}</span>
              </p>
            ) : (
              <p className="text-[10px] text-slate-400 font-medium">
                Must only contain letters (a-z, A-Z) and spaces.
              </p>
            )}
          </div>

          {/* GPS LOCATION SERVICE CO-ORDINATES BANNER */}
          <div className="rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50/80 via-emerald-50/50 to-teal-50/80 p-4 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-600 text-white shadow-sm">
                  <Navigation className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-teal-950 flex items-center gap-1.5">
                    <span>GPS Location Service</span>
                    {gpsSynced && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black text-white">
                        <CheckCircle2 className="h-2.5 w-2.5" /> Synced from Login Location 🟢
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-teal-800 font-medium">
                    Latitude & Longitude auto-retrieved from your enabled device GPS service.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => syncLocationService(true)}
                disabled={gpsFetching}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-[11px] font-bold transition shadow-sm cursor-pointer disabled:opacity-50 self-start sm:self-auto"
              >
                <RefreshCw className={`h-3 w-3 ${gpsFetching ? "animate-spin" : ""}`} />
                <span>{gpsFetching ? "Detecting GPS..." : "Re-sync GPS Fix"}</span>
              </button>
            </div>

            {gpsError && (
              <div className="p-2 rounded-xl bg-amber-100/70 border border-amber-300 text-[11px] text-amber-900 font-bold flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-700" />
                <span>{gpsError}</span>
              </div>
            )}
          </div>

          {/* LATITUDE & LONGITUDE INPUTS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center justify-between">
                <span>Latitude</span>
                <span className="text-[10px] text-teal-700 font-bold">Auto-populated from GPS</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-teal-600" />
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5 flex items-center justify-between">
                <span>Longitude</span>
                <span className="text-[10px] text-teal-700 font-bold">Auto-populated from GPS</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-teal-600" />
                <input
                  type="number"
                  step="0.000001"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-xs font-mono font-bold text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">City</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Vijayawada"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">Total Slots (Initial Capacity)</label>
              <input
                type="number"
                required
                min={1}
                max={500}
                value={totalSlots}
                onChange={(e) => setTotalSlots(parseInt(e.target.value) || 1)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">Street Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Full landmark, road name, area..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">Hourly Rate (Credits)</label>
              <input
                type="number"
                required
                min={5}
                max={200}
                value={pricePerHour}
                onChange={(e) => setPricePerHour(parseInt(e.target.value) || 5)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-bold text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">Opening Time</label>
              <input
                type="time"
                value={openingTime}
                onChange={(e) => setOpeningTime(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-800 mb-1.5">Closing Time</label>
              <input
                type="time"
                value={closingTime}
                onChange={(e) => setClosingTime(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-900 focus:border-teal-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">Amenities (Comma separated)</label>
            <input
              type="text"
              value={facilities}
              onChange={(e) => setFacilities(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-black text-slate-800 mb-1.5">Cover Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-900 placeholder-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !!nameError}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-700 py-4 text-xs font-black text-white transition shadow-lg shadow-teal-600/25 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Registering Facility..." : "Create Facility & Initialize Slots"}
          </button>
        </form>
      </main>
    </div>
  );
}

