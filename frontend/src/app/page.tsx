"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ParkingLocation } from "@/types";
import { api } from "@/lib/api";
import ParkingCard from "@/components/parking/ParkingCard";
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
  Calendar,
  Flame,
  CheckCircle2,
  Users,
} from "lucide-react";

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const [featuredParkings, setFeaturedParkings] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get<ParkingLocation[]>("/parking?sort_by=rating_desc");
        setFeaturedParkings(res.data.slice(0, 8));
      } catch (err) {
        console.error("Failed to load featured parking:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
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

  return (
    <div className="space-y-10 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. PARKEASE HERO BANNER WITH SEARCH & FILTER */}

      <section className="relative overflow-hidden rounded-3xl bg-[#5669FF] p-6 sm:p-12 text-white shadow-2xl shadow-[#5669FF]/25">
        <div className="relative z-10 max-w-3xl space-y-6">
          
          {/* Location & Badge */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold text-white backdrop-blur-md border border-white/20">
              <MapPin className="h-3.5 w-3.5 text-white" />
              <span>Vijayawada, MG Road & Hyderabad Hubs</span>
            </div>
            <div className="inline-flex items-center gap-1 rounded-full bg-[#F0635A] px-3 py-1 text-[11px] font-black text-white shadow-md">
              <Sparkles className="h-3 w-3" />
              <span>100 Welcome Credits</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight">
            Reserve Your Smart <br />
            Parking Bay In Seconds.
          </h1>

          <p className="text-xs sm:text-sm text-white/80 max-w-xl font-medium leading-relaxed">
            Real-time live multi-level parking availability, touchless QR gate passes, and guaranteed slot bookings across the city.
          </p>

          {/* EventHub Integrated Search Bar + Squircle Filter */}
          <div className="pt-2">
            <div className="flex items-center gap-2 rounded-2xl bg-white p-2 shadow-xl max-w-xl">
              <div className="flex flex-1 items-center gap-3 pl-3">
                <Search className="h-5 w-5 text-[#5669FF]" />
                <input
                  type="text"
                  placeholder="Search parking facilities, malls, metro stations..."
                  className="w-full bg-transparent text-xs sm:text-sm text-[#120D26] placeholder-[#747688] font-semibold focus:outline-none"
                  readOnly
                  onClick={() => {
                    window.location.href = isAuthenticated ? "/parking" : "/login?redirect=/parking";
                  }}
                />
              </div>

              <Link
                href={isAuthenticated ? "/parking" : "/login?redirect=/parking"}
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5669FF] text-white shadow-md hover:bg-[#4657E5] transition shrink-0"
                title="Filters"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute -right-16 -bottom-16 h-80 w-80 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/4 -top-20 h-64 w-64 rounded-full bg-[#F0635A]/20 blur-3xl pointer-events-none" />
      </section>

      {/* 2. EVENTHUB HORIZONTAL CATEGORY PILLS */}
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
              <Link
                key={c.id}
                href={isAuthenticated ? `/parking?type=${c.id}` : `/login?redirect=/parking?type=${c.id}`}
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
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. UPCOMING & POPULAR SMART FACILITIES (EventHub Grid) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#F0635A]" />
            <h2 className="text-xl sm:text-2xl font-black text-[#120D26]">Featured Smart Parking Hubs</h2>
          </div>
          <Link
            href={isAuthenticated ? "/parking" : "/login?redirect=/parking"}
            className="text-xs font-bold text-[#5669FF] hover:underline flex items-center gap-1"
          >
            View All <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-white border border-[#EBEAEE] shadow-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredParkings.map((p) => (
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
              title: "Discover Nearby",
              desc: "Locate live parking facilities with real-time bay counters on the map.",
              icon: MapPin,
              color: "text-[#5669FF]",
              bg: "bg-[#5669FF]/10",
            },
            {
              step: "02",
              title: "Select Slot & Time",
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
    </div>
  );
}
