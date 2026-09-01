"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import {
  MapPin,
  Compass,
  Wallet,
  Bell,
  User,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  Shield,
  Briefcase,
  Car,
  CheckCircle2,
  Sparkles,
  Search,
  Bookmark,
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#EBEAEE] bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* ParkEase Brand Logo & Location */}
        <div className="flex items-center gap-4">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#5669FF] text-white shadow-md shadow-[#5669FF]/25 group-hover:scale-105 transition-transform">
              <Car className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#120D26] flex items-center gap-0.5">
                Park<span className="text-[#5669FF]">Ease</span>
              </span>
              <span className="hidden sm:block text-[9px] uppercase tracking-widest text-[#5669FF] font-extrabold -mt-1">
                Smart Parking Platform
              </span>
            </div>
          </Link>


          {/* Quick Location Chip */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0F1F7] text-[11px] font-bold text-[#120D26]">
            <MapPin className="h-3.5 w-3.5 text-[#5669FF]" />
            <span>Vijayawada & Hyderabad</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link
            href={isAuthenticated ? "/parking" : "/login?redirect=/parking"}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname.startsWith("/parking")
                ? "bg-[#5669FF] text-white shadow-md shadow-[#5669FF]/20"
                : "text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7]"
            }`}
          >
            <Compass className="h-4 w-4" />
            <span>Explore Hubs</span>
          </Link>

          <Link
            href={isAuthenticated ? "/map" : "/login?redirect=/map"}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              pathname === "/map"
                ? "bg-[#5669FF] text-white shadow-md shadow-[#5669FF]/20"
                : "text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7]"
            }`}
          >
            <MapPin className="h-4 w-4" />
            <span>Live GPS Map</span>
          </Link>

          {isAuthenticated && (
            <>
              <Link
                href="/bookings"
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname.startsWith("/bookings")
                    ? "bg-[#5669FF] text-white shadow-md shadow-[#5669FF]/20"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7]"
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>My Passes</span>
              </Link>

              {user?.role === "PARKING_MANAGER" && (
                <Link
                  href="/manager/dashboard"
                  className="px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 text-[#29D697] bg-[#29D697]/10 hover:bg-[#29D697]/20"
                >
                  <Briefcase className="h-4 w-4" />
                  <span>Manager Hub</span>
                </Link>
              )}

              {user?.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 text-[#F0635A] bg-[#F0635A]/10 hover:bg-[#F0635A]/20"
                >
                  <Shield className="h-4 w-4" />
                  <span>Admin Console</span>
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right Actions & User Area */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Wallet Credits Chip */}
              <Link
                href="/wallet"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#5669FF]/10 border border-[#5669FF]/25 hover:bg-[#5669FF]/20 transition shadow-sm"
              >
                <Wallet className="h-4 w-4 text-[#5669FF]" />
                <span className="text-xs font-black text-[#5669FF]">
                  {user?.wallet_balance ?? 0} <span className="text-[10px] font-bold">Credits</span>
                </span>
              </Link>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 rounded-2xl p-1.5 bg-[#F0F1F7] hover:bg-[#EBEAEE] transition"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#5669FF] text-white text-xs font-extrabold">
                    {user?.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-3xl border border-[#EBEAEE] bg-white p-2 shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-[#F0F1F7]">
                      <div className="text-xs font-bold text-[#120D26]">{user?.full_name}</div>
                      <div className="text-[11px] text-[#747688] font-mono">{user?.email}</div>
                      <span className="inline-block mt-1 text-[9px] uppercase font-extrabold px-2 py-0.5 rounded bg-[#5669FF]/10 text-[#5669FF]">
                        {user?.role}
                      </span>
                    </div>

                    <Link
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold text-[#120D26] hover:bg-[#F0F1F7]"
                    >
                      <LayoutDashboard className="h-4 w-4 text-[#5669FF]" />
                      Dashboard
                    </Link>

                    <Link
                      href="/wallet"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-semibold text-[#120D26] hover:bg-[#F0F1F7]"
                    >
                      <Wallet className="h-4 w-4 text-[#5669FF]" />
                      Credits & Wallet
                    </Link>

                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-2xl text-xs font-extrabold text-[#120D26] hover:bg-[#F0F1F7] transition"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-extrabold text-white bg-[#5669FF] hover:bg-[#4657E5] shadow-md shadow-[#5669FF]/25 active:scale-95 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Get Started</span>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F0F1F7] text-[#120D26]"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-[#EBEAEE] bg-white px-4 pt-3 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-4">
          <Link
            href={isAuthenticated ? "/parking" : "/login?redirect=/parking"}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
          >
            Explore Parking Hubs
          </Link>
          <Link
            href={isAuthenticated ? "/map" : "/login?redirect=/map"}
            onClick={() => setMobileMenuOpen(false)}
            className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
          >
            Live GPS Map
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
              >
                My Dashboard
              </Link>
              <Link
                href="/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
              >
                My Passes & QR Tickets
              </Link>
              <Link
                href="/wallet"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-[#5669FF] hover:bg-[#5669FF]/10"
              >
                Wallet ({user?.wallet_balance} Credits)
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="block w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-2xl text-xs font-bold text-[#120D26] bg-[#F0F1F7]"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-2.5 rounded-2xl text-xs font-bold text-white bg-[#5669FF]"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
