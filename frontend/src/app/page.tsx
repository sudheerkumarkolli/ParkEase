"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ParkingLocation } from "@/types";
import { api } from "@/lib/api";
import { formatINR } from "@/lib/utils";
import ParkingCard from "@/components/parking/ParkingCard";
import RegionSelectorModal from "@/components/parking/RegionSelectorModal";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Sparkles,
  Car,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Zap,
  BatteryCharging,
  Layers,
  Award,
  Flame,
  Wallet,
  CheckCircle2,
  Users,
  X,
  Compass,
  Building2,
  ExternalLink,
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [allLocations, setAllLocations] = useState<ParkingLocation[]>([]);
  const [featuredParkings, setFeaturedParkings] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  
  // Search & Area filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArea, setSelectedArea] = useState<string>("ALL");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch initial parking locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        const res = await api.get<ParkingLocation[]>("/parking?sort_by=rating_desc");
        setAllLocations(res.data);
        setFeaturedParkings(res.data.slice(0, 8));
      } catch (err) {
        console.error("Failed to load featured parking:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  // Load saved region from localStorage if any
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("parkease_selected_region");
      if (saved) {
        setSelectedCity(saved);
      }
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ParkEase Category Filter Pills
  const categories = [
    { id: "All", label: "All Smart Hubs", icon: Car, bg: "bg-[#5669FF]" },
    { id: "EV", label: "EV Fast Chargers", icon: BatteryCharging, bg: "bg-[#29D697]" },
    { id: "SUV", label: "SUV & Heavy Bays", icon: Layers, bg: "bg-[#F0635A]" },
    { id: "Bike", label: "Two-Wheeler / Bike", icon: Zap, bg: "bg-[#9353B1]" },
    { id: "Valet", label: "VIP Covered Valet", icon: Award, bg: "bg-[#F59E0B]" },
    { id: "Secure", label: "24/7 CCTV Guarded", icon: ShieldCheck, bg: "bg-[#00F8FF]" },
  ];

  // Curated prominent areas with live stats mapping
  const popularAreas = [
    { name: "MG Road", city: "Vijayawada", label: "MG Road, Vijayawada" },
    { name: "Benz Circle", city: "Vijayawada", label: "Benz Circle, Vijayawada" },
    { name: "HITEC City", city: "Hyderabad", label: "HITEC City, Hyd" },
    { name: "Gachibowli", city: "Hyderabad", label: "Gachibowli, Hyd" },
    { name: "Banjara Hills", city: "Hyderabad", label: "Banjara Hills, Hyd" },
    { name: "Railway Station", city: "Vijayawada", label: "Station Hub, VJA" },
    { name: "Lakshmipuram", city: "Guntur", label: "Lakshmipuram, Guntur" },
    { name: "Beach Road", city: "Visakhapatnam", label: "Beach Road, Vizag" },
    { name: "Alipiri", city: "Tirupati", label: "Alipiri, Tirupati" },
  ];

  // Helper to calculate total available slots for an area
  const getAreaAvailability = (areaName: string) => {
    const matches = allLocations.filter(
      (l) =>
        l.name.toLowerCase().includes(areaName.toLowerCase()) ||
        l.address.toLowerCase().includes(areaName.toLowerCase())
    );
    const totalAvail = matches.reduce((sum, item) => sum + (item.available_slots || 0), 0);
    return { count: totalAvail, hubCount: matches.length };
  };

  // Filtered locations based on search query and area
  const filteredParkings = allLocations.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.address.toLowerCase().includes(q) ||
      (p.city && p.city.toLowerCase().includes(q)) ||
      (p.facilities && p.facilities.toLowerCase().includes(q));

    const matchesArea =
      selectedArea === "ALL" ||
      p.name.toLowerCase().includes(selectedArea.toLowerCase()) ||
      p.address.toLowerCase().includes(selectedArea.toLowerCase()) ||
      (p.city && p.city.toLowerCase().includes(selectedArea.toLowerCase()));

    const matchesCity =
      selectedCity === "ALL" || !selectedCity || (p.city && p.city.toLowerCase() === selectedCity.toLowerCase());

    const matchesCat =
      activeCategory === "All" ||
      (activeCategory === "EV" && p.facilities?.includes("EV")) ||
      (activeCategory === "SUV" && p.supported_vehicle_types?.includes("SUV")) ||
      (activeCategory === "Bike" && p.supported_vehicle_types?.includes("Bike")) ||
      (activeCategory === "Valet" && (p.facilities?.includes("Valet") || p.facilities?.includes("VIP"))) ||
      (activeCategory === "Secure" && (p.facilities?.includes("CCTV") || p.facilities?.includes("Security")));

    return matchesQuery && matchesArea && matchesCat;
  });

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsDropdownOpen(false);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.append("query", searchQuery.trim());
    if (selectedArea !== "ALL") params.append("query", selectedArea);
    if (selectedCity && selectedCity !== "ALL") params.append("city", selectedCity);
    
    router.push(`/parking?${params.toString()}`);
  };

  const handleSelectArea = (area: string) => {
    if (selectedArea === area) {
      setSelectedArea("ALL");
      setSearchQuery("");
    } else {
      setSelectedArea(area);
      setSearchQuery(area);
    }
  };

  return (
    <div className="space-y-10 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. PARKEASE HERO BANNER WITH SEARCH & AREA AVAILABILITY */}
      <section className="relative overflow-visible rounded-3xl bg-[#5669FF] p-6 sm:p-12 text-white shadow-2xl shadow-[#5669FF]/25">
        <div className="relative z-20 max-w-3xl space-y-6">
          
          {/* Ecosystem Feature Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/20">
              <Sparkles className="h-3.5 w-3.5 text-emerald-300" />
              <span>Next-Gen Smart Parking Ecosystem 🟢</span>
            </div>

            <div className="inline-flex items-center gap-1 rounded-full bg-[#F0635A] px-3 py-1 text-[11px] font-black text-white shadow-md">
              <Zap className="h-3 w-3" />
              <span>100 Welcome Credits</span>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/30 px-3 py-1 text-[11px] font-bold text-emerald-200 border border-emerald-400/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>
                {allLocations.reduce((acc, curr) => acc + (curr.available_slots || 0), 0)} Live Slots Available
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Reserve Your Smart <br />
            Parking Bay In Seconds.
          </h1>

          <p className="text-xs sm:text-sm text-white/85 max-w-xl font-medium leading-relaxed">
            Real-time live multi-level parking availability, touchless QR gate passes, and guaranteed slot bookings across specific city areas.
          </p>

          {/* Interactive Search Bar & Live Area Dropdown */}
          <div className="relative pt-2" ref={searchContainerRef}>
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-2xl max-w-2xl ring-2 ring-white/40 focus-within:ring-[#5669FF] transition-all"
            >
              <div className="flex flex-1 items-center gap-3 pl-3">
                <Search className="h-5 w-5 text-[#5669FF] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (selectedArea !== "ALL") setSelectedArea("ALL");
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Search specific areas (e.g. MG Road, Benz Circle, HITEC City, Gachibowli)..."
                  className="w-full bg-transparent text-xs sm:text-sm text-[#120D26] placeholder-[#747688] font-semibold focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedArea("ALL");
                    }}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 h-11 rounded-xl bg-[#5669FF] text-white font-bold text-xs shadow-md hover:bg-[#4657E5] transition shrink-0 cursor-pointer"
              >
                <span>Find Bays</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => setShowRegionModal(true)}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-[#5669FF] hover:bg-slate-200 transition shrink-0 cursor-pointer"
                title="Filter by City / Region"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </form>

            {/* LIVE AUTOCOMPLETE & SPECIFIC AREA AVAILABILITY DROPDOWN */}
            {isDropdownOpen && (
              <div className="absolute left-0 right-0 top-full mt-2 max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#EBEAEE] overflow-hidden z-50 text-[#120D26] animate-in fade-in slide-in-from-top-2 duration-200">
                
                {/* 1. Quick Area Availability Pills Header */}
                <div className="p-4 bg-[#F8F9FE] border-b border-[#EBEAEE]">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#5669FF] flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      Popular Areas with Live Availability
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Click to inspect area
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {popularAreas.map((area) => {
                      const avail = getAreaAvailability(area.name);
                      const isSelected = selectedArea.toLowerCase() === area.name.toLowerCase() || searchQuery.toLowerCase().includes(area.name.toLowerCase());
                      return (
                        <button
                          key={area.name}
                          type="button"
                          onClick={() => {
                            handleSelectArea(area.name);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-[#5669FF] text-white shadow-sm"
                              : "bg-white border border-[#EBEAEE] text-slate-700 hover:border-[#5669FF] hover:text-[#5669FF]"
                          }`}
                        >
                          <span>{area.label}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                              avail.count > 0
                                ? isSelected
                                  ? "bg-white/20 text-white"
                                  : "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "bg-rose-50 text-rose-500"
                            }`}
                          >
                            {avail.count > 0 ? `${avail.count} slots` : "Full"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Live Parking Facilities Matching Query / Area */}
                <div className="max-h-80 overflow-y-auto p-3 space-y-2">
                  <div className="px-2 py-1 flex items-center justify-between text-[11px] font-bold text-[#747688]">
                    <span>
                      {filteredParkings.length} Parking {filteredParkings.length === 1 ? "Hub" : "Hubs"} in Area
                    </span>
                    <span>Live Availability</span>
                  </div>

                  {filteredParkings.length === 0 ? (
                    <div className="text-center py-8 space-y-2">
                      <MapPin className="h-8 w-8 text-slate-300 mx-auto" />
                      <p className="text-xs font-bold text-slate-600">No parking facilities match &quot;{searchQuery}&quot;</p>
                      <p className="text-[11px] text-slate-400">Try searching MG Road, Benz Circle, HITEC City, or Gachibowli</p>
                    </div>
                  ) : (
                    filteredParkings.slice(0, 6).map((p) => {
                      const isFull = p.available_slots === 0;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            setIsDropdownOpen(false);
                            router.push(`/parking/${p.id}`);
                          }}
                          className="group flex items-center justify-between p-3 rounded-2xl hover:bg-[#F0F1F7] transition cursor-pointer border border-transparent hover:border-[#EBEAEE]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                              <img
                                src={p.image_url || "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200&auto=format&fit=crop&q=60"}
                                alt={p.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs sm:text-sm font-black text-[#120D26] group-hover:text-[#5669FF] transition">
                                  {p.name}
                                </h4>
                                <span className="text-[10px] font-bold text-[#5669FF] bg-[#5669FF]/10 px-2 py-0.5 rounded-md">
                                  {p.city}
                                </span>
                              </div>
                              <p className="text-[11px] text-[#747688] flex items-center gap-1 truncate max-w-xs sm:max-w-md">
                                <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="truncate">{p.address}</span>
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                                <span>{formatINR(p.price_per_hour)}/hr</span>
                                <span>•</span>
                                <span className="text-amber-500 font-bold">★ {p.rating.toFixed(1)}</span>
                                {p.facilities && (
                                  <>
                                    <span>•</span>
                                    <span className="truncate">{p.facilities.split(",").slice(0, 2).join(", ")}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-1.5 shrink-0 pl-3">
                            <div
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-black shadow-sm ${
                                isFull
                                  ? "bg-rose-100 text-rose-700"
                                  : p.available_slots <= 5
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isFull ? "bg-rose-500" : p.available_slots <= 5 ? "bg-amber-500" : "bg-emerald-500"
                                }`}
                              />
                              <span>{isFull ? "FULL" : `${p.available_slots} Free`}</span>
                            </div>
                            <span className="text-[10px] font-bold text-[#5669FF] group-hover:underline flex items-center gap-0.5">
                              Reserve <ChevronRight className="h-3 w-3" />
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* 3. Footer Action */}
                <div className="p-3 bg-[#F8F9FE] border-t border-[#EBEAEE] flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-500">
                    Press <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-mono">Enter</kbd> to view full directory
                  </span>
                  <button
                    type="button"
                    onClick={handleSearchSubmit}
                    className="text-xs font-bold text-[#5669FF] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Search Results</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ParkEase Key Highlights Under Search */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-white/90">
            <span className="font-bold flex items-center gap-1 text-white">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              Smart Perks:
            </span>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              <Zap className="h-3 w-3 text-amber-300" />
              <span>Instant QR Pass</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              <ShieldCheck className="h-3 w-3 text-emerald-300" />
              <span>100% Reserved Bay Lock</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              <Car className="h-3 w-3 text-blue-200" />
              <span>EV Fast Charging Hubs</span>
            </div>
            <div className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
              <Wallet className="h-3 w-3 text-emerald-300" />
              <span>Contactless Wallet Pay</span>
            </div>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -top-20 h-64 w-64 rounded-full bg-[#F0635A]/20 blur-3xl pointer-events-none" />
      </section>

      {/* 2. ABOUT PARKEASE PLATFORM VALUE PROPOSITION STRIP */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#EBEAEE] shadow-[0_8px_25px_rgba(86,105,255,0.03)] space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5669FF]/10 text-[#5669FF]">
            <Zap className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-black text-[#120D26]">Zero-Wait Smart Gates</h3>
          <p className="text-xs text-[#747688] font-medium leading-relaxed">
            Automatic QR pass recognition for frictionless entry and exit at all automated hub barriers.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#EBEAEE] shadow-[0_8px_25px_rgba(86,105,255,0.03)] space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-black text-[#120D26]">Guaranteed Reserved Bay</h3>
          <p className="text-xs text-[#747688] font-medium leading-relaxed">
            Eliminate circling busy blocks. Your selected bay is held and locked exclusively for your vehicle.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#EBEAEE] shadow-[0_8px_25px_rgba(86,105,255,0.03)] space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Car className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-black text-[#120D26]">EV Fast Chargers & Valet</h3>
          <p className="text-xs text-[#747688] font-medium leading-relaxed">
            Integrated high-speed electric vehicle charging stations and premium VIP covered valet services.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#EBEAEE] shadow-[0_8px_25px_rgba(86,105,255,0.03)] space-y-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
            <Wallet className="h-5 w-5" />
          </div>
          <h3 className="text-sm font-black text-[#120D26]">Smart Wallet & Credits</h3>
          <p className="text-xs text-[#747688] font-medium leading-relaxed">
            Recharge digital credits for 1-click contactless booking payments and automatic billing discounts.
          </p>
        </div>
      </section>

      {/* 3. EVENTHUB HORIZONTAL CATEGORY PILLS */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-[#120D26]">Explore by Bay Category</h2>
          <Link
            href={isAuthenticated ? "/parking" : "/login?redirect=/parking"}
            className="text-xs font-bold text-[#5669FF] hover:underline flex items-center gap-1"
          >
            See All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((c) => {
            const Icon = c.icon;
            const isSelected = activeCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black shrink-0 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-[#5669FF] text-white shadow-lg shadow-[#5669FF]/30 scale-105"
                    : "bg-white text-[#747688] border border-[#EBEAEE] hover:border-[#5669FF]/40 hover:text-[#120D26]"
                }`}
              >
                <div className={`flex h-7 w-7 items-center justify-center rounded-xl ${isSelected ? "bg-white/20 text-white" : "bg-[#F0F1F7] text-[#5669FF]"}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. UPCOMING & POPULAR SMART FACILITIES (Dynamic Grid) */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#F0635A]" />
            <h2 className="text-xl sm:text-2xl font-black text-[#120D26]">
              {searchQuery || selectedArea !== "ALL" || activeCategory !== "All"
                ? `Filtered Smart Hubs (${filteredParkings.length})`
                : "Featured Smart Parking Hubs"}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {(searchQuery || selectedArea !== "ALL" || activeCategory !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedArea("ALL");
                  setActiveCategory("All");
                }}
                className="text-xs font-bold text-[#F0635A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            )}

            <Link
              href={isAuthenticated ? "/parking" : "/login?redirect=/parking"}
              className="text-xs font-bold text-[#5669FF] hover:underline flex items-center gap-1"
            >
              View Full Directory <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-white border border-[#EBEAEE] shadow-sm animate-pulse" />
            ))}
          </div>
        ) : filteredParkings.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-[#EBEAEE] bg-white space-y-3">
            <MapPin className="h-10 w-10 text-[#5669FF]/40 mx-auto" />
            <h3 className="text-base font-bold text-[#120D26]">No parking hubs found for current filter</h3>
            <p className="text-xs text-[#747688] max-w-sm mx-auto">
              Try searching a different area name, or reset your filters to see all available hubs.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedArea("ALL");
                setActiveCategory("All");
              }}
              className="px-5 py-2.5 rounded-2xl text-xs font-bold text-white bg-[#5669FF] hover:bg-[#4657E5] shadow-md transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredParkings.slice(0, 8).map((p) => (
              <ParkingCard key={p.id} parking={p} />
            ))}
          </div>
        )}
      </section>

      {/* 4. EVENTHUB PROMO / VIP PASS CARD */}
      <section className="relative overflow-hidden rounded-3xl border border-[#EBEAEE] bg-gradient-to-r from-[#5669FF]/10 via-[#F8F9FE] to-[#F0635A]/10 p-6 sm:p-10 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-[#5669FF] px-3.5 py-1 text-[11px] font-extrabold text-white">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Smart Driver Pass</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#120D26]">
              Claim 100 Free Credits on Signup
            </h3>
            <p className="text-xs sm:text-sm text-[#747688] font-medium">
              Start reserving prime multi-level parking slots instantly. No card required for initial test reservations.
            </p>
          </div>

          <Link
            href={isAuthenticated ? "/dashboard" : "/register"}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black text-white bg-[#5669FF] hover:bg-[#4657E5] shadow-lg shadow-[#5669FF]/30 active:scale-95 transition-all shrink-0"
          >
            <span>{isAuthenticated ? "My Dashboard" : "Register Now"}</span>
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
              <ArrowRight className="h-3 w-3" />
            </div>
          </Link>
        </div>
      </section>

      {/* 5. HOW EVENTHUB PARKING WORKS */}
      <section className="rounded-3xl border border-[#EBEAEE] bg-white p-6 sm:p-10 shadow-sm space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#5669FF] bg-[#5669FF]/10 px-3.5 py-1 rounded-full">
            Touchless Smart Flow
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#120D26]">How ParkEase Works</h2>
          <p className="text-xs text-[#747688]">
            Four effortless steps from finding a bay to QR pass smart gate entry
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              step: "01",
              title: "Discover Nearby Area",
              desc: "Search by MG Road, Benz Circle, Cyber Towers, or scan the live GPS map.",
              icon: MapPin,
              color: "text-[#5669FF]",
              bg: "bg-[#5669FF]/10",
            },
            {
              step: "02",
              title: "Select Slot & Vehicle",
              desc: "Choose Car, SUV, EV, or Bike bays and set your arrival duration.",
              icon: Car,
              color: "text-[#F0635A]",
              bg: "bg-[#F0635A]/10",
            },
            {
              step: "03",
              title: "Instant Wallet Lock",
              desc: "Confirm using your credits wallet. The database locks your bay immediately.",
              icon: Zap,
              color: "text-[#29D697]",
              bg: "bg-[#29D697]/10",
            },
            {
              step: "04",
              title: "Scan Digital QR Pass",
              desc: "Show your digital pass to the facility manager at entry and exit gates.",
              icon: ShieldCheck,
              color: "text-[#9353B1]",
              bg: "bg-[#9353B1]/10",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.step} className="p-5 rounded-2xl bg-[#F8F9FE] border border-[#EBEAEE] space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono font-black text-xl text-[#EBEAEE]">{item.step}</span>
                </div>
                <h4 className="text-sm font-extrabold text-[#120D26]">{item.title}</h4>
                <p className="text-xs text-[#747688] leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. CALL TO ACTION FOOTER */}
      <section className="relative overflow-hidden rounded-3xl bg-[#120D26] p-8 sm:p-12 text-white shadow-2xl text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#5669FF]/20 border border-[#5669FF]/30 text-xs font-bold text-[#5669FF]">
          <ShieldCheck className="h-4 w-4" />
          <span>Real-time Smart Hub Network</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white max-w-2xl mx-auto">
          Ready for Seamless Parking Bookings?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto font-medium">
          Join thousands of drivers, facility managers, and parking operations across the city.
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-3">
          <Link
            href={isAuthenticated ? "/dashboard" : "/register"}
            className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-xs font-extrabold text-white bg-[#5669FF] hover:bg-[#4657E5] shadow-lg shadow-[#5669FF]/30 active:scale-95 transition-all"
          >
            <span>{isAuthenticated ? "Open My Dashboard" : "Claim 100 Free Credits"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href={isAuthenticated ? "/map" : "/login?redirect=/map"}
            className="px-8 py-3.5 rounded-2xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition"
          >
            View Live GPS Map
          </Link>
        </div>
      </section>

      {/* Region Selector Modal */}
      <RegionSelectorModal
        isOpen={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        onSelectRegion={(reg) => {
          setSelectedCity(reg);
          if (typeof window !== "undefined") {
            localStorage.setItem("parkease_selected_region", reg);
          }
        }}
      />
    </div>
  );
}

