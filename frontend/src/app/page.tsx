"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ParkingLocation } from "@/types";
import { api } from "@/lib/api";
import ParkingCard from "@/components/parking/ParkingCard";
import {
  Compass,
  MapPin,
  QrCode,
  Wallet,
  ShieldCheck,
  Zap,
  Sparkles,
  Car,
  ChevronRight,
  Clock,
  Star,
  Users,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export default function LandingPage() {
  const [featuredParkings, setFeaturedParkings] = useState<ParkingLocation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await api.get<ParkingLocation[]>("/parking?sort_by=rating_desc");
        setFeaturedParkings(res.data.slice(0, 4));
      } catch (err) {
        console.error("Failed to load featured parking:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center overflow-hidden">
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-bold text-slate-600 shadow-sm mb-6">
          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
          <span>Next-Gen Smart Parking Availability Platform</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Find. Reserve. <span className="text-emerald-600">Park.</span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
          Discover available parking spaces near you in real time and reserve your spot before you arrive. Guaranteed parking bay with instant QR access.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/parking"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Compass className="h-5 w-5" />
            Find Parking Near Me
          </Link>
          <Link
            href="/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
          >
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Get Started (100 Free Credits)
          </Link>
        </div>

        {/* Hero Stats Ribbon */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto p-4 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="p-3 text-center">
            <div className="text-2xl sm:text-3xl font-black text-slate-900">99.8%</div>
            <div className="text-xs text-slate-500 mt-1">Guaranteed Bay Lock</div>
          </div>
          <div className="p-3 text-center border-l border-slate-100">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">&lt; 3 Sec</div>
            <div className="text-xs text-slate-500 mt-1">Instant QR Pass</div>
          </div>
          <div className="p-3 text-center border-l border-slate-100">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">100+</div>
            <div className="text-xs text-slate-500 mt-1">Smart Hubs</div>
          </div>
          <div className="p-3 text-center border-l border-slate-100">
            <div className="text-2xl sm:text-3xl font-black text-emerald-600">4.9 ⭐</div>
            <div className="text-xs text-slate-500 mt-1">Driver Rating</div>
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Seamless Flow</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">How ParkEase Works</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Eliminate circling for parking spots with our four-step precision booking engine.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: "01",
              title: "Discover Nearby Hubs",
              desc: "Use live GPS or search destination to find active parking locations with real-time occupancy counts.",
              icon: MapPin,
            },
            {
              step: "02",
              title: "Choose Your Slot",
              desc: "Select your exact bay (A01, B05) customized for Cars, Bikes, SUVs, or EV chargers with transparent pricing.",
              icon: Car,
            },
            {
              step: "03",
              title: "Instant Wallet Lock",
              desc: "Confirm with your credits wallet. The database locks the slot instantly, eliminating double bookings.",
              icon: Wallet,
            },
            {
              step: "04",
              title: "Scan & Park",
              desc: "Show your encrypted QR Smart Pass at the gate for touchless, approved entry and exit.",
              icon: QrCode,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-110 transition">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-2xl font-mono font-black text-slate-200">{item.step}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. FEATURED LIVE PARKING LOCATIONS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Live Inventory</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Popular Smart Parking Hubs</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time slot availability from verified commercial multi-level locations.
            </p>
          </div>
          <Link
            href="/parking"
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:underline"
          >
            Explore All Locations
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-80 rounded-3xl bg-slate-100 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredParkings.map((p) => (
              <ParkingCard key={p.id} parking={p} />
            ))}
          </div>
        )}
      </section>

      {/* 4. PLATFORM FEATURES */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 sm:p-12 shadow-sm">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Why Choose ParkEase?</h2>
            <p className="text-slate-500 mt-2 text-sm">
              We provide enterprise-grade infrastructure built for everyday drivers.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Live GPS & Leaflet Map", desc: "High-accuracy Haversine proximity calculations dynamically display available spots.", icon: MapPin },
              { title: "Row-Locked Concurrency", desc: "PostgreSQL transactional row locking prevents race conditions.", icon: ShieldCheck },
              { title: "Credit Wallet & Top-ups", desc: "100 welcome credits upon registration with seamless checkout.", icon: Wallet },
              { title: "Encrypted QR Smart Pass", desc: "Cryptographically signed QR tokens for authorized entry.", icon: QrCode },
              { title: "Multi-Role Dashboards", desc: "Dedicated portals for drivers, facility managers, and admins.", icon: Users },
              { title: "Hassle-free Cancellation", desc: "Cancel upcoming bookings for instant credit refunds.", icon: Zap },
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{f.title}</h3>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600">Driver Reviews</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">Loved by Commuters</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: "Vikram R.",
              city: "Vijayawada",
              comment: "No more driving around MG Road hunting for space during shopping hours. The QR code opened the gate instantly!",
              rating: 5,
            },
            {
              name: "Sneha Reddy",
              city: "Hyderabad",
              comment: "Booking my EV parking spot at HITEC City saves me 25 minutes every morning. The credit wallet is super smooth.",
              rating: 5,
            },
            {
              name: "Anand M.",
              city: "Visakhapatnam",
              comment: "Clean multi-level bays and exact slot selection (A04). Parking managers verified my entry in seconds.",
              rating: 5,
            },
          ].map((t, idx) => (
            <div key={idx} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <div className="flex items-center gap-1 text-amber-400">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed italic">"{t.comment}"</p>
              <div className="border-t border-slate-100 pt-3">
                <div className="text-xs font-bold text-slate-900">{t.name}</div>
                <div className="text-[10px] text-slate-500">{t.city}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <HelpCircle className="h-8 w-8 text-slate-400 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-slate-900">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {[
            { q: "How do I get my 100 free welcome credits?", a: "Simply create an account on ParkEase. 100 welcome credits are automatically deposited into your wallet instantly upon registration." },
            { q: "How do I pay for parking?", a: "We use a digital Credits system. You can purchase credit packages using our simulated payment gateway in your Wallet. 1 Credit = ₹1 INR." },
            { q: "Can I cancel my reservation?", a: "Yes, you can cancel any UPCOMING reservation with 1-click before the start time. 100% of your credits will be instantly refunded to your wallet." },
            { q: "How do I enter the parking facility?", a: "Once your booking is confirmed, you'll receive a cryptographically signed QR Smart Pass. Simply show this QR code to the facility manager or scanner at the gate." },
          ].map((faq, i) => (
            <div key={i} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm">
              <h4 className="font-bold text-slate-900 text-sm">{faq.q}</h4>
              <p className="text-slate-500 text-xs mt-2 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. CTA BANNER */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-emerald-600 p-8 sm:p-12 text-center shadow-lg">
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-black text-white">Stop Circling. Start Parking.</h2>
            <p className="text-xs sm:text-sm text-emerald-50">
              Join thousands of smart drivers enjoying guaranteed parking reservations and seamless QR check-ins.
            </p>
            <div className="flex justify-center mt-8">
              <Link
                href="/register"
                className="px-8 py-4 rounded-2xl text-sm font-bold text-emerald-700 bg-white hover:bg-slate-50 transition shadow-sm active:scale-95"
              >
                Create Free Account
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
