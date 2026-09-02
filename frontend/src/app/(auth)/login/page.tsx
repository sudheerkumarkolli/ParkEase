"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { ParkingLocation } from "@/types";
import { formatINR } from "@/lib/utils";
import {
  Lock,
  Mail,
  Car,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Star,
  MapPin,
  CheckCircle2,
  Building2,
  Zap,
  BatteryCharging,
  Layers,
  ChevronRight,
  Compass,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Places & stats state for the 60% information side
  const [selectedCityFilter, setSelectedCityFilter] = useState("ALL");
  const [locations, setLocations] = useState<ParkingLocation[]>([]);

  useEffect(() => {
    // Proactively prefetch all possible redirect target routes so navigation is instantaneous
    try {
      router.prefetch("/dashboard");
      router.prefetch("/manager/dashboard");
      router.prefetch("/admin/dashboard");
      router.prefetch("/parking");
      router.prefetch("/booking");
    } catch (e) {}

    const loadLocations = async () => {
      try {
        const res = await api.get<ParkingLocation[]>("/parking?sort_by=rating_desc");
        setLocations(res.data);
      } catch (err) {
        // Fallback default list if api isn't ready
      }
    };
    loadLocations();
  }, [router]);

  const fallbackHubs = [
    {
      id: 1,
      name: "MG Road Central Smart Parking",
      city: "Vijayawada",
      address: "MG Road, Opposite PVP Square Mall",
      price_per_hour: 25,
      rating: 4.8,
      available_slots: 24,
      image_url: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=400&auto=format&fit=crop&q=60",
    },
    {
      id: 2,
      name: "HITEC City Cyber Towers Smart Bay",
      city: "Hyderabad",
      address: "Cyber Towers Quad, HITEC City, Madhapur",
      price_per_hour: 35,
      rating: 4.9,
      available_slots: 24,
      image_url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&auto=format&fit=crop&q=60",
    },
    {
      id: 3,
      name: "Benz Circle Express Park",
      city: "Vijayawada",
      address: "Near Benz Circle Flyover, Ring Road Junction",
      price_per_hour: 20,
      rating: 4.7,
      available_slots: 24,
      image_url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&auto=format&fit=crop&q=60",
    },
    {
      id: 4,
      name: "Gachibowli Financial District Hub",
      city: "Hyderabad",
      address: "ISB Road, Near WaveRock, Financial District",
      price_per_hour: 30,
      rating: 4.8,
      available_slots: 24,
      image_url: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&auto=format&fit=crop&q=60",
    },
    {
      id: 5,
      name: "Beach Road Coastal Parking",
      city: "Visakhapatnam",
      address: "RK Beach Promenade, Pandurangapuram",
      price_per_hour: 20,
      rating: 4.9,
      available_slots: 24,
      image_url: "https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?w=400&auto=format&fit=crop&q=60",
    },
    {
      id: 6,
      name: "Alipiri Transit & Pilgrim Parking",
      city: "Tirupati",
      address: "Alipiri Foothills, Bypass Road",
      price_per_hour: 15,
      rating: 4.8,
      available_slots: 24,
      image_url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&auto=format&fit=crop&q=60",
    },
  ];

  const displayHubs = locations.length > 0 ? locations : fallbackHubs;
  const filteredHubs =
    selectedCityFilter === "ALL"
      ? displayHubs
      : displayHubs.filter((h) => h.city?.toLowerCase() === selectedCityFilter.toLowerCase());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(getErrorMessage(err, "Invalid email or password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
        
        {/* ======================================================== */}
        {/* 60% LEFT COLUMN: PARKEASE INFORMATION & PLACES SHOWCASE */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#5669FF] via-[#4657E5] to-[#2B38B0] p-6 sm:p-10 text-white shadow-2xl shadow-[#5669FF]/20 relative overflow-hidden space-y-8">
          
          {/* Header & Badges */}
          <div className="space-y-4 relative z-10">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md px-3.5 py-1 text-xs font-bold text-white border border-white/20">
                <Car className="h-3.5 w-3.5 text-white" />
                <span>ParkEase Smart Ecosystem</span>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-400 px-3 py-1 text-[11px] font-black text-slate-950 shadow-sm">
                <Sparkles className="h-3 w-3" />
                <span>Live Hub Network 🟢</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Real-Time Smart Parking. <br />
              <span className="text-emerald-300">Guaranteed Bay Arrival.</span>
            </h1>

            <p className="text-xs sm:text-sm text-white/90 max-w-xl font-medium leading-relaxed">
              ParkEase connects premier multi-level commercial hubs, metro junctions, IT corridors, and pilgrim centers into a unified digital booking and instant QR pass network.
            </p>
          </div>

          {/* OVERALL RATING & PLATFORM TRUST METRICS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3.5 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-300">
                <Star className="h-4 w-4 fill-amber-300" />
                <span className="text-lg font-black text-white">4.9</span>
                <span className="text-xs text-white/70">/5</span>
              </div>
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block mt-0.5">
                Overall Rating
              </span>
              <span className="text-[9px] text-emerald-200 font-medium">2,800+ Reviews</span>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3.5 text-center">
              <div className="text-lg font-black text-white">150+</div>
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block mt-0.5">
                Live Bays
              </span>
              <span className="text-[9px] text-emerald-200 font-medium">Instant Lock</span>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3.5 text-center">
              <div className="text-lg font-black text-white">5 Cities</div>
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block mt-0.5">
                Prime Network
              </span>
              <span className="text-[9px] text-emerald-200 font-medium">AP & Telangana</span>
            </div>

            <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3.5 text-center">
              <div className="text-lg font-black text-white">100%</div>
              <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider block mt-0.5">
                Touchless QR
              </span>
              <span className="text-[9px] text-emerald-200 font-medium">Zero Gate Queue</span>
            </div>
          </div>

          {/* PLACES ON THE WEBSITE (AVAILABLE HUBS DIRECTORY) */}
          <div className="space-y-3 relative z-10 bg-white/10 backdrop-blur-md rounded-3xl p-5 border border-white/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/15 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-300" />
                <h3 className="text-sm font-black text-white">Places & Facilities On Website</h3>
              </div>

              {/* City Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
                {["ALL", "Vijayawada", "Hyderabad", "Guntur", "Visakhapatnam", "Tirupati"].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setSelectedCityFilter(city)}
                    className={`px-2.5 py-1 rounded-xl text-[10px] font-black transition cursor-pointer shrink-0 ${
                      selectedCityFilter === city
                        ? "bg-white text-[#5669FF] shadow-sm"
                        : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                  >
                    {city === "ALL" ? "All Places" : city}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Places */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-60 overflow-y-auto pr-1">
              {filteredHubs.slice(0, 6).map((hub) => (
                <div
                  key={hub.id}
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition border border-white/10"
                >
                  <img
                    src={hub.image_url || "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=200&auto=format&fit=crop&q=60"}
                    alt={hub.name}
                    className="h-11 w-11 rounded-xl object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-black text-white truncate">{hub.name}</h4>
                      <span className="text-[10px] text-amber-300 font-bold shrink-0">★ {hub.rating?.toFixed(1) || "4.8"}</span>
                    </div>
                    <p className="text-[10px] text-white/75 truncate flex items-center gap-0.5">
                      <span className="font-bold text-emerald-200">{hub.city}</span> • {hub.address}
                    </p>
                    <div className="flex items-center justify-between text-[9px] text-white/90 font-semibold mt-0.5">
                      <span>{formatINR(hub.price_per_hour)}/hr</span>
                      <span className="text-emerald-300 font-bold">🟢 {hub.available_slots} Slots Free</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social Proof & Explore All Footer */}
          <div className="space-y-3 pt-2 border-t border-white/15 text-xs relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                  <img
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white/50"
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                    alt="User"
                  />
                  <img
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white/50"
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                    alt="User"
                  />
                  <img
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white/50"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
                    alt="User"
                  />
                </div>
                <span className="text-[11px] font-bold text-white/90">
                  15,000+ drivers skip parking queues with ParkEase
                </span>
              </div>

              <Link
                href="/parking"
                className="text-[11px] font-black text-emerald-300 hover:underline flex items-center gap-0.5 shrink-0"
              >
                <span>Explore All</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>

            {/* --- QUICK DEMO ACCOUNTS BAR (Placed below Explore All for quick fill & easy deletion) --- */}
            <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[10px] font-bold text-white/80 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-300" />
                Quick Demo Fill:
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleDemoFill("user@gmail.com", "12345678")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/15 hover:bg-white text-white hover:text-[#5669FF] transition cursor-pointer border border-white/20 shadow-sm"
                  title="Click to auto-fill Driver credentials (user@gmail.com / 12345678)"
                >
                  <Car className="h-3 w-3" />
                  <span>Driver</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill("manager1@gmail.com", "12345678")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/15 hover:bg-white text-white hover:text-amber-600 transition cursor-pointer border border-white/20 shadow-sm"
                  title="Click to auto-fill Manager credentials (manager1@gmail.com / 12345678)"
                >
                  <Building2 className="h-3 w-3" />
                  <span>Manager</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoFill("admin@gmail.com", "12345678")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-white/15 hover:bg-white text-white hover:text-slate-900 transition cursor-pointer border border-white/20 shadow-sm"
                  title="Click to auto-fill Admin credentials (admin@gmail.com / 12345678)"
                >
                  <ShieldCheck className="h-3 w-3" />
                  <span>Admin</span>
                </button>
              </div>
            </div>
          </div>

          {/* Decorative glow elements */}
          <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -top-20 h-64 w-64 rounded-full bg-[#F0635A]/20 blur-3xl pointer-events-none" />
        </div>

        {/* ======================================================== */}
        {/* 40% RIGHT COLUMN: SECURE LOGIN CREDENTIALS FORM */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 flex flex-col justify-center">
          <div className="rounded-3xl border-2 border-[#D1D5DB] bg-white p-6 sm:p-8 shadow-[0_20px_50px_rgba(86,105,255,0.12)] ring-4 ring-[#5669FF]/10 space-y-6">
            
            {/* Form Header */}
            <div className="space-y-1.5 border-b-2 border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#5669FF] text-white shadow-lg shadow-[#5669FF]/25">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#120D26]">Welcome Back</h2>
                  <p className="text-xs text-[#747688] font-medium">Sign in to access your bookings & wallet</p>
                </div>
              </div>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-xs text-rose-700 font-bold">
                <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-[#120D26] mb-1.5">
                  Email Address
                </label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-xl bg-[#F0F1F7] text-[#5669FF] group-focus-within:bg-[#5669FF] group-focus-within:text-white transition">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="driver@gmail.com or admin@gmail.com"
                    className="w-full rounded-2xl border-2 border-[#D1D5DB] bg-[#F8F9FE] pl-12 pr-4 py-3.5 text-xs text-[#120D26] placeholder-[#747688] font-semibold focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/20 transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black text-[#120D26]">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[11px] font-bold text-[#5669FF] hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-xl bg-[#F0F1F7] text-[#5669FF] group-focus-within:bg-[#5669FF] group-focus-within:text-white transition">
                    <Lock className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-2xl border-2 border-[#D1D5DB] bg-[#F8F9FE] pl-12 pr-10 py-3.5 text-xs text-[#120D26] placeholder-[#747688] font-semibold focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#747688] hover:text-[#120D26] transition-colors focus:outline-none cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 rounded-2xl text-xs font-black text-white bg-[#5669FF] hover:bg-[#4657E5] shadow-lg shadow-[#5669FF]/30 active:scale-95 transition-all flex items-center justify-between px-6 cursor-pointer disabled:opacity-50"
              >
                <span className="flex-1 text-center pl-4">
                  {loading ? "Signing In..." : "SIGN IN TO PARKEASE"}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                  {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                </div>
              </button>
            </form>

            {/* Signup Callout */}
            <div className="text-center text-xs text-[#747688] pt-2 border-t border-[#F0F1F7] space-y-2">
              <p>
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-black text-[#5669FF] hover:underline">
                  Sign up with 100 free credits
                </Link>
              </p>
              <Link
                href="/parking"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-[#5669FF]"
              >
                <span>Browse live parking hubs as Guest</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

