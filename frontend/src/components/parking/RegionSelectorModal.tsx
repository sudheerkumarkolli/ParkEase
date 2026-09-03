"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ParkingLocation } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  MapPin,
  Building2,
  Car,
  Compass,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  X,
  Search,
  Lock,
} from "lucide-react";

interface RegionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRegion?: (region: string) => void;
}

const REGIONS = [
  { id: "Vijayawada", name: "Vijayawada", state: "Andhra Pradesh", badge: "Smart City Zone", icon: "🏙️" },
  { id: "Hyderabad", name: "Hyderabad", state: "Telangana", badge: "IT Tech Hub", icon: "🏢" },
  { id: "Visakhapatnam", name: "Visakhapatnam", state: "Andhra Pradesh", badge: "Coastal Hub", icon: "🌊" },
  { id: "Guntur", name: "Guntur", state: "Andhra Pradesh", badge: "Commercial Core", icon: "🏛️" },
  { id: "Tirupati", name: "Tirupati", state: "Andhra Pradesh", badge: "Heritage Zone", icon: "⛩️" },
  { id: "Kurnool", name: "Kurnool", state: "Andhra Pradesh", badge: "Rayalaseema Gate", icon: "🏰" },
  { id: "Nellore", name: "Nellore", state: "Andhra Pradesh", badge: "Coastal Trade", icon: "🌴" },
  { id: "Rajahmundry", name: "Rajahmundry", state: "Andhra Pradesh", badge: "Cultural Capital", icon: "🛕" },
  { id: "Kakinada", name: "Kakinada", state: "Andhra Pradesh", badge: "Port & Smart City", icon: "⚓" },
  { id: "Kadapa", name: "Kadapa", state: "Andhra Pradesh", badge: "Central Hub", icon: "⛰️" },
  { id: "Anantapur", name: "Anantapur", state: "Andhra Pradesh", badge: "Granite City", icon: "🕰️" },
  { id: "Warangal", name: "Warangal", state: "Telangana", badge: "Heritage Center", icon: "🏛️" },
];

export default function RegionSelectorModal({
  isOpen,
  onClose,
  onSelectRegion,
}: RegionSelectorModalProps) {
  const { isAuthenticated } = useAuth();
  const [selectedCity, setSelectedCity] = useState<string>("Vijayawada");
  const [facilities, setFacilities] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("parkease_selected_region");
      if (saved) {
        setSelectedCity(saved);
      }
    }
  }, [isOpen]);

  // Load facilities when selectedCity changes
  useEffect(() => {
    if (!isOpen || !selectedCity) return;

    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const res = await api.get<ParkingLocation[]>(`/parking?city=${encodeURIComponent(selectedCity)}`);
        setFacilities(res.data);
      } catch (err) {
        console.error("Failed to load region facilities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, [selectedCity, isOpen]);

  const handleCityPick = (city: string) => {
    setSelectedCity(city);
    if (typeof window !== "undefined") {
      localStorage.setItem("parkease_selected_region", city);
      localStorage.setItem("parkease_selected_city", city);
      window.dispatchEvent(new Event("parkease_location_change"));
    }
    if (onSelectRegion) {
      onSelectRegion(city);
    }
  };

  const handleConfirmAndClose = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("parkease_selected_region", selectedCity);
      localStorage.setItem("parkease_selected_city", selectedCity);
      window.dispatchEvent(new Event("parkease_location_change"));
    }
    if (onSelectRegion) {
      onSelectRegion(selectedCity);
    }
    onClose();
  };

  if (!isOpen) return null;

  const filteredFacilities = facilities.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative max-w-2xl w-full rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-black uppercase">
              <Compass className="h-3 w-3" />
              <span>Location & Region Preference</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">Select Your Parking Region</h2>
            <p className="text-xs text-slate-500 font-medium">
              Choose your city to discover live smart parking facilities and available bays
            </p>
          </div>

          <button
            onClick={handleConfirmAndClose}
            className="text-slate-400 hover:text-slate-800 p-1.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Region Pills Grid */}
        <div className="space-y-2.5">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700">
            Available Smart Parking Cities
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {REGIONS.map((reg) => {
              const isSelected = selectedCity.toLowerCase() === reg.id.toLowerCase();
              return (
                <button
                  key={reg.id}
                  type="button"
                  onClick={() => handleCityPick(reg.id)}
                  className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 border-2 border-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]"
                      : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-lg">{reg.icon}</span>
                    {isSelected ? (
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400">{reg.state}</span>
                    )}
                  </div>
                  <span className={`text-xs font-black ${isSelected ? "text-white" : "text-slate-900"}`}>
                    {reg.name}
                  </span>
                  <span className={`text-[10px] font-medium mt-0.5 ${isSelected ? "text-indigo-100" : "text-slate-500"}`}>
                    {reg.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Facilities List in Selected Region */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Parking Facilities in {selectedCity} ({facilities.length})
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Real-time availability and bay reservation</p>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search facility name..."
                className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-full sm:w-48"
              />
            </div>
          </div>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-2 text-center text-xs text-slate-500">
              <span className="h-6 w-6 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" />
              <span>Loading facilities in {selectedCity}...</span>
            </div>
          ) : filteredFacilities.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <Building2 className="h-6 w-6 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No facilities matching your search.</p>
              <p className="text-[11px] text-slate-500">Try selecting another city or clearing your search.</p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {filteredFacilities.map((facility) => (
                <div
                  key={facility.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-indigo-300 hover:shadow-sm transition"
                >
                  <div className="space-y-0.5 max-w-[65%]">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-black text-slate-900 truncate">{facility.name}</h4>
                      <span className="inline-flex items-center px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {facility.available_slots} Slots Free
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                      {facility.address}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900">{formatINR(facility.price_per_hour)}/hr</span>
                      <span className="block text-[10px] font-bold text-slate-400">{facility.total_slots} Total</span>
                    </div>
                    <Link
                      href={
                        isAuthenticated
                          ? `/booking?parking_id=${facility.id}`
                          : `/login?redirect=${encodeURIComponent(`/booking?parking_id=${facility.id}`)}`
                      }
                      onClick={handleConfirmAndClose}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-sm transition active:scale-95 flex items-center gap-1"
                    >
                      {!isAuthenticated && <Lock className="h-3 w-3 opacity-80" />}
                      <span>{isAuthenticated ? "Book" : "Login"}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Action */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-[11px] text-slate-500 font-medium">
            Active Region: <strong className="text-slate-900 font-bold">{selectedCity}</strong>
          </span>
          <button
            type="button"
            onClick={handleConfirmAndClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-indigo-600 text-white text-xs font-black shadow-md transition active:scale-95 cursor-pointer"
          >
            Confirm & Explore {selectedCity}
          </button>
        </div>
      </div>
    </div>
  );
}
