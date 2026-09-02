"use client";

import React from "react";
import { Search, MapPin, Building, ArrowUpDown } from "lucide-react";

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
  states: string[];
  cities: string[];
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
  states,
  cities,
}: FilterBarProps) {
  return (
    <div className="space-y-4 rounded-3xl border border-slate-100 bg-white/80 p-5 backdrop-blur-2xl shadow-xl">
      
      {/* Primary Search Input Row */}
      <div className="flex flex-col md:flex-row items-center gap-3">
        
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by parking name, address, state, or landmark..."
            className="w-full rounded-2xl border border-slate-100 bg-slate-950/80 pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
          />
        </div>

        {/* State Filter Dropdown */}
        <div className="relative w-full md:w-52">
          <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-400" />
          <select
            value={selectedState}
            onChange={(e) => onStateChange(e.target.value)}
            aria-label="Select State"
            className="w-full rounded-2xl border border-slate-100 bg-slate-950/80 pl-10 pr-8 py-3 text-sm font-medium text-slate-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none cursor-pointer"
          >
            <option value="ALL">🇮🇳 All States</option>
            {states.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter Dropdown */}
        <div className="relative w-full md:w-48">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-violet-400" />
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            aria-label="Select City"
            className="w-full rounded-2xl border border-slate-100 bg-slate-950/80 pl-10 pr-8 py-3 text-sm font-medium text-slate-200 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 appearance-none cursor-pointer"
          >
            <option value="ALL">
              {selectedState !== "ALL" ? `All Cities in ${selectedState}` : "All Cities"}
            </option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Filter */}
        <div className="relative w-full md:w-44">
          <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-teal-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort Options"
            className="w-full rounded-2xl border border-slate-100 bg-slate-950/80 pl-10 pr-8 py-3 text-sm font-medium text-slate-200 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 appearance-none cursor-pointer"
          >
            <option value="name">Sort by Name</option>
            <option value="slots_desc">Most Slots Available</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Highest Rated ⭐</option>
          </select>
        </div>
      </div>

      {/* Secondary Quick Pill Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100/60">
        
        {/* Vehicle Filter Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Vehicle:</span>
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-100">
            {["ALL", "Car", "Bike", "SUV", "EV"].map((v) => (
              <button
                key={v}
                onClick={() => onVehicleChange(v)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  selectedVehicle === v
                    ? "bg-violet-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Max Price quick selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Max Rate:</span>
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-100">
            {[null, 20, 30, 40, 50].map((p, idx) => (
              <button
                key={idx}
                onClick={() => onMaxPriceChange(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                  maxPrice === p
                    ? "bg-teal-500 text-slate-950 font-bold shadow-sm"
                    : "text-slate-500 hover:text-white"
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
