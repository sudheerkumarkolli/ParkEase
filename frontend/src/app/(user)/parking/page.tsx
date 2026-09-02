"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ParkingLocation } from "@/types";
import { api } from "@/lib/api";
import FilterBar from "@/components/parking/FilterBar";
import ParkingCard from "@/components/parking/ParkingCard";
import RegionSelectorModal from "@/components/parking/RegionSelectorModal";
import { MapPin, Navigation, Sparkles, AlertCircle, Compass, Lock, ArrowRight } from "lucide-react";

function ParkingSearchContent() {
  const { isAuthenticated } = useAuth();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const initialCity = searchParams.get("city") || "";
  const initialType = searchParams.get("type") || "ALL";

  const [parkings, setParkings] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCity, setSelectedCity] = useState(initialCity || "ALL");
  const [selectedVehicle, setSelectedVehicle] = useState(initialType);
  const [sortBy, setSortBy] = useState("name");
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [showRegionModal, setShowRegionModal] = useState<boolean>(false);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !initialCity) {
      const saved = localStorage.getItem("parkease_selected_region");
      if (saved) {
        setSelectedCity(saved);
      }
    }
  }, [initialCity]);

  // Keep search query in sync if URL query changes
  useEffect(() => {
    const q = searchParams.get("query");
    if (q !== null) setSearchQuery(q);
    const c = searchParams.get("city");
    if (c !== null) setSelectedCity(c);
    const t = searchParams.get("type");
    if (t !== null) setSelectedVehicle(t);
  }, [searchParams]);

  const fetchParkings = async () => {
    try {
      setLoading(true);
      let url = `/parking?sort_by=${sortBy}`;
      if (searchQuery) url += `&query=${encodeURIComponent(searchQuery)}`;
      if (selectedCity && selectedCity !== "ALL") url += `&city=${encodeURIComponent(selectedCity)}`;
      if (selectedVehicle && selectedVehicle !== "ALL") url += `&vehicle_type=${encodeURIComponent(selectedVehicle)}`;
      if (maxPrice !== null) url += `&max_price=${maxPrice}`;

      // If user requested GPS nearby
      if (userLocation) {
        url = `/parking/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&radius_km=25`;
        if (selectedVehicle && selectedVehicle !== "ALL") url += `&vehicle_type=${encodeURIComponent(selectedVehicle)}`;
        if (maxPrice !== null) url += `&max_price=${maxPrice}`;
      }

      const res = await api.get<ParkingLocation[]>(url);
      setParkings(res.data);
    } catch (err) {
      console.error("Failed to load parkings:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParkings();
  }, [searchQuery, selectedCity, selectedVehicle, sortBy, maxPrice, userLocation]);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocating(false);
      },
      (err) => {
        console.error("Location error:", err);
        alert("Could not access location. Showing default city directory.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const cities = [
    "Vijayawada",
    "Guntur",
    "Hyderabad",
    "Tirupati",
    "Visakhapatnam",
    "Kurnool",
    "Nellore",
    "Rajahmundry",
    "Kakinada",
    "Kadapa",
    "Anantapur",
    "Warangal",
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
            Real-Time Directory
          </span>
          <h1 className="text-3xl font-black text-slate-800 mt-1">Smart Parking Finder</h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse, filter, and lock your spot across multi-level commercial hubs
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRegionModal(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 transition shadow-sm cursor-pointer"
          >
            <Compass className="h-4 w-4 text-indigo-600" />
            <span>Select Region ({selectedCity})</span>
          </button>

          <button
            onClick={detectLocation}
            disabled={locating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 transition shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            <Navigation className={`h-4 w-4 ${locating ? "animate-spin" : ""}`} />
            {locating ? "Locating..." : userLocation ? "Near Me (Active 🟢)" : "Find Parking Near Me"}
          </button>

          <Link
            href="/map"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-600 bg-white border border-slate-100 hover:bg-slate-50 transition"
          >
            <MapPin className="h-4 w-4 text-emerald-400" />
            Switch to Live Map
          </Link>
        </div>
      </div>

      {/* Guest Mode Callout Banner */}
      {!isAuthenticated && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-3xl bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-200 text-xs shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shrink-0">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <span className="font-black text-sm text-slate-900 block">
                Browsing Directory as Guest
              </span>
              <p className="text-slate-600 text-[11px] font-medium">
                You can explore live slots, hub amenities, and hourly rates freely. To book and lock a bay, sign in to your account.
              </p>
            </div>
          </div>
          <Link
            href={`/login?redirect=${encodeURIComponent('/parking')}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm shrink-0"
          >
            <span>Sign In to Lock Bays</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Filter Component */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCity={selectedCity}
        onCityChange={(c) => {
          setSelectedCity(c);
          setUserLocation(null); // Clear custom GPS if picking manual city
        }}
        selectedVehicle={selectedVehicle}
        onVehicleChange={setSelectedVehicle}
        sortBy={sortBy}
        onSortChange={setSortBy}
        maxPrice={maxPrice}
        onMaxPriceChange={setMaxPrice}
        cities={cities}
      />

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-600 font-medium px-2">
        <span>
          Showing <span className="font-extrabold text-slate-900">{parkings.length}</span> parking locations
          {userLocation ? " sorted by nearest distance (GPS)" : ""}
        </span>
        {userLocation && (
          <button
            onClick={() => setUserLocation(null)}
            className="text-xs text-emerald-600 font-bold hover:underline"
          >
            Reset GPS Filter
          </button>
        )}
      </div>

      {/* Grid of Parking Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : parkings.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border-2 border-dashed border-slate-200 bg-white space-y-3">
          <AlertCircle className="h-10 w-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-black text-slate-900">No parking locations found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing vehicle filters, or broadening your price range.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCity("ALL");
              setSelectedVehicle("ALL");
              setMaxPrice(null);
              setUserLocation(null);
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {parkings.map((p) => (
            <ParkingCard key={p.id} parking={p} />
          ))}
        </div>
      )}

      <RegionSelectorModal
        isOpen={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        onSelectRegion={(reg) => {
          setSelectedCity(reg);
        }}
      />
    </div>
  );
}

export default function ParkingSearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8 max-w-7xl mx-auto space-y-8">
          <div className="h-20 rounded-3xl bg-slate-100 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-96 rounded-3xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        </div>
      }
    >
      <ParkingSearchContent />
    </Suspense>
  );
}

