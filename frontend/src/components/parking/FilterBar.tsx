"use client";

import React from "react";
import { Search, MapPin, ArrowUpDown, SlidersHorizontal, Car, Coins } from "lucide-react";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCity: string;
  onCityChange: (c: string) => void;
  selectedVehicle: string;
  onVehicleChange: (v: string) => void;
  sortBy: string;
  onSortChange: (s: string) => void;
  maxPrice: number | null;
  onMaxPriceChange: (p: number | null) => void;
  cities: string[];
}

export default function FilterBar({
  searchQuery,
  onSearchChange,
  selectedCity,
  onCityChange,
  selectedVehicle,
  onVehicleChange,
  sortBy,
  onSortChange,
  maxPrice,
  onMaxPriceChange,
  cities,
}: FilterBarProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-[#EBEAEE] bg-white p-5 sm:p-6 shadow-[0_10px_35px_rgba(86,105,255,0.06)]">
      
      {/* Primary Search Input Row */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#5669FF] group-focus-within:text-[#5669FF] transition" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by parking name, address, or landmark..."
            className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] pl-12 pr-4 py-3.5 text-xs sm:text-sm font-semibold text-[#120D26] placeholder-[#747688] focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15 transition"
          />
        </div>

        {/* City Filter */}
        <div className="relative w-full md:w-52">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5669FF] pointer-events-none" />
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            aria-label="Select City"
            className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] pl-10 pr-8 py-3.5 text-xs sm:text-sm font-bold text-[#120D26] focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15 appearance-none cursor-pointer transition"
          >
            <option value="ALL">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="relative w-full md:w-52">
          <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#29D697] pointer-events-none" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort Options"
            className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] pl-10 pr-8 py-3.5 text-xs sm:text-sm font-bold text-[#120D26] focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15 appearance-none cursor-pointer transition"
          >
            <option value="name">Sort by Name</option>
            <option value="slots_desc">Most Available Slots</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Rated ⭐</option>
          </select>
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
            {[null, 20, 30, 40].map((p, idx) => (
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
                {p === null ? "Any" : `≤ ₹${p}/hr`}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

