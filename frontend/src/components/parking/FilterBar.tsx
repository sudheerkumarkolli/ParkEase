"use client";

import React from "react";
import { Search, MapPin, ArrowUpDown, Building2, Car, Coins, ChevronDown } from "lucide-react";

export const INDIAN_STATES_AND_CITIES: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Vijayawada",
    "Visakhapatnam",
    "Guntur",
    "Tirupati",
    "Kurnool",
    "Nellore",
    "Rajahmundry",
    "Kakinada",
    "Kadapa",
    "Anantapur",
  ],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane"],
};

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedState: string;
  onStateChange: (s: string) => void;
  selectedCity: string;
  onCityChange: (c: string) => void;
  selectedVehicle: string;
  onVehicleChange: (v: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
  maxPrice: number | null;
  onMaxPriceChange: (p: number | null) => void;
  states?: string[];
  cities?: string[];
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  selectedState,
  onStateChange,
  selectedCity,
  onCityChange,
  selectedVehicle,
  onVehicleChange,
  sortBy,
  onSortChange,
  maxPrice,
  onMaxPriceChange,
  states = Object.keys(INDIAN_STATES_AND_CITIES),
  cities,
}: FilterBarProps) {
  // Determine available cities based on selected state
  const availableCities =
    cities ||
    (selectedState && selectedState !== "ALL" && INDIAN_STATES_AND_CITIES[selectedState]
      ? INDIAN_STATES_AND_CITIES[selectedState]
      : Array.from(new Set(Object.values(INDIAN_STATES_AND_CITIES).flat())));

  return (
    <div className="space-y-4 rounded-3xl border border-[#EBEAEE] bg-white p-5 sm:p-6 shadow-[0_10px_35px_rgba(86,105,255,0.06)]">
      
      {/* Primary Search & Location Dropdowns Row */}
      <div className="flex flex-col lg:flex-row items-center gap-3">
        
        {/* Search Bar Input */}
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5669FF] group-focus-within:text-[#5669FF] transition" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by parking name, address, state, or landmark..."
            className="w-full rounded-2xl border border-[#EBEAEE] bg-[#3B4252] pl-12 pr-4 py-3.5 text-xs sm:text-sm font-semibold text-white placeholder-slate-300 focus:border-[#5669FF] focus:bg-[#2E3440] focus:outline-none focus:ring-4 focus:ring-[#5669FF]/20 transition"
          />
        </div>

        {/* State Dropdown Filter */}
        <div className="relative w-full lg:w-56">
          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400 pointer-events-none z-10" />
          <select
            value={selectedState}
            onChange={(e) => {
              const newState = e.target.value;
              onStateChange(newState);
              if (typeof window !== "undefined") {
                localStorage.setItem("parkease_selected_state", newState);
              }
              if (newState !== "ALL" && INDIAN_STATES_AND_CITIES[newState]) {
                if (!INDIAN_STATES_AND_CITIES[newState].includes(selectedCity)) {
                  onCityChange("ALL");
                  if (typeof window !== "undefined") {
                    localStorage.setItem("parkease_selected_city", "ALL");
                  }
                }
              }
              if (typeof window !== "undefined") {
                window.dispatchEvent(new Event("parkease_location_change"));
              }
            }}
            aria-label="Select State"
            className="w-full rounded-2xl border border-slate-700 bg-[#353B48] pl-10 pr-9 py-3.5 text-xs sm:text-sm font-bold text-white focus:border-[#5669FF] focus:outline-none focus:ring-4 focus:ring-[#5669FF]/20 appearance-none cursor-pointer transition shadow-sm"
          >
            <option value="ALL" className="bg-[#2E3440] text-white">All States</option>
            {states.map((st) => (
              <option key={st} value={st} className="bg-[#2E3440] text-white">
                {st}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none z-10" />
        </div>

        {/* City Dropdown Filter */}
        <div className="relative w-full lg:w-56">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400 pointer-events-none z-10" />
          <select
            value={selectedCity}
            onChange={(e) => {
              const newCity = e.target.value;
              onCityChange(newCity);
              if (typeof window !== "undefined") {
                localStorage.setItem("parkease_selected_city", newCity);
                localStorage.setItem("parkease_selected_region", newCity);
                window.dispatchEvent(new Event("parkease_location_change"));
              }
            }}
            aria-label="Select City"
            className="w-full rounded-2xl border border-purple-500/40 bg-[#353B48] pl-10 pr-9 py-3.5 text-xs sm:text-sm font-bold text-white focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 appearance-none cursor-pointer transition shadow-sm"
          >
            <option value="ALL" className="bg-[#2E3440] text-white">All Cities</option>
            {availableCities.map((city) => (
              <option key={city} value={city} className="bg-[#2E3440] text-white">
                {city}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none z-10" />
        </div>

        {/* Sort Filter */}
        <div className="relative w-full lg:w-48">
          <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400 pointer-events-none z-10" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort Options"
            className="w-full rounded-2xl border border-slate-700 bg-[#353B48] pl-10 pr-9 py-3.5 text-xs sm:text-sm font-bold text-white focus:border-[#5669FF] focus:outline-none focus:ring-4 focus:ring-[#5669FF]/20 appearance-none cursor-pointer transition shadow-sm"
          >
            <option value="name" className="bg-[#2E3440] text-white">Sort by Name</option>
            <option value="slots_desc" className="bg-[#2E3440] text-white">Most Available Slots</option>
            <option value="price_asc" className="bg-[#2E3440] text-white">Price: Low to High</option>
            <option value="price_desc" className="bg-[#2E3440] text-white">Price: High to Low</option>
            <option value="rating_desc" className="bg-[#2E3440] text-white">Highest Rated ⭐</option>
          </select>
          <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 pointer-events-none z-10" />
        </div>

      </div>

      {/* Secondary Quick Pill Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0F1F7]">
        
        {/* Vehicle Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#120D26] flex items-center gap-1">
            <Car className="h-3.5 w-3.5 text-[#5669FF]" />
            Vehicle:
          </span>
          <div className="flex items-center gap-1 bg-[#F0F1F7] p-1 rounded-2xl border border-[#EBEAEE]">
            {["ALL", "Car", "Bike", "SUV", "EV"].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onVehicleChange(v)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedVehicle === v
                    ? "bg-[#5669FF] text-white shadow-sm shadow-[#5669FF]/30"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-white"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Max Price quick selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-[#120D26] flex items-center gap-1">
            <Coins className="h-3.5 w-3.5 text-amber-500" />
            Max Rate:
          </span>
          <div className="flex items-center gap-1 bg-[#F0F1F7] p-1 rounded-2xl border border-[#EBEAEE]">
            {[null, 20, 30, 40, 50].map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onMaxPriceChange(p)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  maxPrice === p
                    ? "bg-emerald-500 text-white shadow-sm shadow-emerald-500/30"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-white"
                }`}
              >
                {p === null ? "Any" : `≤ ${p} Cr`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
