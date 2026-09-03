"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { Notification } from "@/types";
import RegionSelectorModal from "@/components/parking/RegionSelectorModal";
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
  QrCode,
  Layers,
  Users,
  Building2,
  BarChart3,
  CreditCard,
  TrendingUp,
  ArrowRight,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [locationLabel, setLocationLabel] = useState<string>("All Locations");
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    const updateLabel = () => {
      if (typeof window !== "undefined") {
        const savedState = localStorage.getItem("parkease_selected_state");
        const savedCity = localStorage.getItem("parkease_selected_city") || localStorage.getItem("parkease_selected_region");

        const st = savedState && savedState !== "ALL" ? savedState : "";
        const ct = savedCity && savedCity !== "ALL" ? savedCity : "";

        if (ct && st) {
          setLocationLabel(`${ct}, ${st}`);
        } else if (ct) {
          setLocationLabel(ct);
        } else if (st) {
          setLocationLabel(`${st} State`);
        } else {
          setLocationLabel("All Locations");
        }
      }
    };

    const handleOpenModal = () => setIsRegionModalOpen(true);

    updateLabel();
    window.addEventListener("storage", updateLabel);
    window.addEventListener("parkease_location_change", updateLabel);
    window.addEventListener("open_region_modal", handleOpenModal);
    return () => {
      window.removeEventListener("storage", updateLabel);
      window.removeEventListener("parkease_location_change", updateLabel);
      window.removeEventListener("open_region_modal", handleOpenModal);
    };
  }, []);

  const role = user?.role;
  const isAdmin = role === "ADMIN";
  const isManager = role === "PARKING_MANAGER";
  const isUser = role === "USER" || (!isAdmin && !isManager);

  // Logo home target depending on role
  const getLogoHref = () => {
    if (!isAuthenticated) return "/";
    if (isAdmin) return "/admin/dashboard";
    if (isManager) return "/manager/dashboard";
    return "/dashboard";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#EBEAEE] bg-white/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* ParkEase Brand Logo with Role-specific tag */}
        <div className="flex items-center gap-4">
          <Link href={getLogoHref()} className="flex items-center gap-2.5 group">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-md transition-transform group-hover:scale-105 ${
                isAdmin
                  ? "bg-purple-600 shadow-purple-600/30"
                  : isManager
                  ? "bg-teal-600 shadow-teal-600/30"
                  : "bg-[#5669FF] shadow-[#5669FF]/25"
              }`}
            >
              {isAdmin ? (
                <Shield className="h-5 w-5" />
              ) : isManager ? (
                <Building2 className="h-5 w-5" />
              ) : (
                <Car className="h-5 w-5" />
              )}
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#120D26] flex items-center gap-0.5">
                Park
                <span
                  className={
                    isAdmin
                      ? "text-purple-600"
                      : isManager
                      ? "text-teal-600"
                      : "text-[#5669FF]"
                  }
                >
                  Ease
                </span>
              </span>
              <span
                className={`hidden sm:block text-[9px] uppercase tracking-widest font-black -mt-1 ${
                  isAdmin
                    ? "text-purple-600"
                    : isManager
                    ? "text-teal-600"
                    : "text-[#5669FF]"
                }`}
              >
                {isAdmin
                  ? "Admin Console"
                  : isManager
                  ? "Manager Operations"
                  : "Smart Parking Platform"}
              </span>
            </div>
          </Link>

          {/* Interactive Location Badge Pill */}
          <button
            type="button"
            onClick={() => setIsRegionModalOpen(true)}
            title="Click to select region or city"
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F0F1F7] hover:bg-[#E4E6F1] border border-[#EBEAEE] text-xs font-bold text-[#120D26] shadow-xs transition-all hover:scale-102 active:scale-98 cursor-pointer group"
          >
            <MapPin className="h-3.5 w-3.5 text-[#5669FF] group-hover:animate-bounce" />
            <span>{locationLabel}</span>
            <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-slate-700 transition-transform group-hover:translate-y-0.5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* DESKTOP NAVIGATION: TAILORED ACCORDING TO USER ROLE */}
        {/* ======================================================== */}
        <nav className="hidden md:flex items-center gap-1.5">
          {/* 1. ADMIN NAVIGATION */}
          {isAuthenticated && isAdmin && (
            <>
              <Link
                href="/admin/dashboard"
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname === "/admin/dashboard"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7]"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </Link>
              <Link
                href="/admin/users"
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname === "/admin/users"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7]"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Users</span>
              </Link>
              <Link
                href="/admin/regional-users"
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname.startsWith("/admin/regional-users") || pathname.startsWith("/admin/locations/users")
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7]"
                }`}
              >
                <MapPin className="h-4 w-4" />
                <span>Regional Users</span>
              </Link>
              <Link
                href="/admin/parking"
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname.startsWith("/admin/parking")
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7]"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Facilities</span>
              </Link>
              <Link
                href="/admin/transactions"
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname.startsWith("/admin/transactions")
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7]"
                }`}
              >
                <CreditCard className="h-4 w-4" />
                <span>Ledger</span>
              </Link>
              <Link
                href="/admin/analytics"
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname.startsWith("/admin/analytics")
                    ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7]"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Analytics</span>
              </Link>
            </>
          )}

          {/* 2. MANAGER NAVIGATION */}
          {isAuthenticated && isManager && (
            <>
              <Link
                href="/manager/dashboard"
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname === "/manager/dashboard"
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7]"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Operations</span>
              </Link>
              <Link
                href="/manager/scanner"
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname.startsWith("/manager/scanner")
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7]"
                }`}
              >
                <QrCode className="h-4 w-4 text-emerald-400" />
                <span>QR Gate Scanner</span>
              </Link>
              <Link
                href="/manager/slots"
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname.startsWith("/manager/slots")
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7]"
                }`}
              >
                <Layers className="h-4 w-4" />
                <span>Bays & Slots</span>
              </Link>
              <Link
                href="/manager/parking"
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname.startsWith("/manager/parking")
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7]"
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>My Hubs</span>
              </Link>
              <Link
                href="/manager/revenue"
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  pathname.startsWith("/manager/revenue")
                    ? "bg-teal-600 text-white shadow-md shadow-teal-600/20"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7]"
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                <span>Hub Revenue</span>
              </Link>
            </>
          )}

          {/* 3. USER / DRIVER / GUEST NAVIGATION */}
          {(!isAuthenticated || isUser) && (
            <>
              <Link
                href="/parking"
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
                href="/map"
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
              )}
            </>
          )}
        </nav>

        {/* ======================================================== */}
        {/* RIGHT SIDE ACTIONS & USER PROFILE AREA */}
        {/* ======================================================== */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Role-Specific Right Action Badge */}
              {isAdmin ? (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-purple-100 text-purple-900 border border-purple-200 text-xs font-black">
                  <Shield className="h-3.5 w-3.5 text-purple-700" />
                  <span>System Admin Console 🟢</span>
                </div>
              ) : isManager ? (
                <Link
                  href="/manager/scanner"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black transition shadow-sm"
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Scan Pass</span>
                </Link>
              ) : (
                /* Driver Wallet Credits */
                <Link
                  href="/wallet"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-[#5669FF]/10 border border-[#5669FF]/25 hover:bg-[#5669FF]/20 transition shadow-sm"
                >
                  <Wallet className="h-4 w-4 text-[#5669FF]" />
                  <span className="text-xs font-black text-[#5669FF]">
                    {user?.wallet_balance ?? 0} <span className="text-[10px] font-bold">Credits</span>
                  </span>
                </Link>
              )}

              {/* Notification Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotificationDropdownOpen(!notificationDropdownOpen);
                    setProfileDropdownOpen(false);
                  }}
                  className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-[#F0F1F7] hover:bg-[#EBEAEE] transition cursor-pointer"
                >
                  <Bell className="h-5 w-5 text-[#120D26]" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notificationDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-3xl border border-[#EBEAEE] bg-white shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 z-50">
                    <div className="p-3 border-b border-[#F0F1F7] flex items-center justify-between">
                      <h3 className="text-sm font-black text-[#120D26]">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={() => markAllAsRead()}
                          className="text-[10px] font-bold text-[#5669FF] hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-[#747688]">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              if (!notif.is_read) markAsRead(notif.id);
                              setSelectedNotification(notif);
                              setNotificationDropdownOpen(false);
                            }}
                            className={`p-3 border-b border-[#F0F1F7] last:border-0 cursor-pointer transition ${
                              notif.is_read ? "opacity-70 bg-white hover:bg-[#F0F1F7]" : "bg-[#5669FF]/5 hover:bg-[#5669FF]/10"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className="text-xs font-bold text-[#120D26]">{notif.title}</span>
                              {!notif.is_read && (
                                <span className="h-2 w-2 rounded-full bg-[#5669FF] mt-1 flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-[10px] text-[#747688] line-clamp-2">{notif.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(!profileDropdownOpen);
                    setNotificationDropdownOpen(false);
                  }}
                  className="flex items-center gap-2 rounded-2xl p-1.5 bg-[#F0F1F7] hover:bg-[#EBEAEE] transition cursor-pointer"
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl text-white text-xs font-extrabold shadow-sm ${
                      isAdmin ? "bg-purple-600" : isManager ? "bg-teal-600" : "bg-[#5669FF]"
                    }`}
                  >
                    {user?.full_name?.charAt(0).toUpperCase() || "U"}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-3xl border border-[#EBEAEE] bg-white p-2.5 shadow-2xl space-y-1 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-[#F0F1F7]">
                      <div className="text-xs font-black text-[#120D26] truncate">{user?.full_name}</div>
                      <div className="text-[11px] text-[#747688] font-mono truncate">{user?.email}</div>
                      <span
                        className={`inline-block mt-1.5 text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full ${
                          isAdmin
                            ? "bg-purple-100 text-purple-700"
                            : isManager
                            ? "bg-teal-100 text-teal-700"
                            : "bg-[#5669FF]/10 text-[#5669FF]"
                        }`}
                      >
                        {user?.role}
                      </span>
                    </div>

                    {/* Role-Specific Dropdown Items */}
                    {isAdmin && (
                      <>
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
                        >
                          <Shield className="h-4 w-4 text-purple-600" />
                          Master Console
                        </Link>
                        <Link
                          href="/admin/analytics"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
                        >
                          <BarChart3 className="h-4 w-4 text-purple-600" />
                          System Analytics
                        </Link>
                      </>
                    )}

                    {isManager && (
                      <>
                        <Link
                          href="/manager/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
                        >
                          <Building2 className="h-4 w-4 text-teal-600" />
                          Operations Center
                        </Link>
                        <Link
                          href="/manager/scanner"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
                        >
                          <QrCode className="h-4 w-4 text-teal-600" />
                          Gate Scanner
                        </Link>
                      </>
                    )}

                    {isUser && (
                      <>
                        <Link
                          href="/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
                        >
                          <LayoutDashboard className="h-4 w-4 text-[#5669FF]" />
                          My Dashboard
                        </Link>
                        <Link
                          href="/bookings"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
                        >
                          <CheckCircle2 className="h-4 w-4 text-[#5669FF]" />
                          My Smart Passes
                        </Link>
                        <Link
                          href="/wallet"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
                        >
                          <Wallet className="h-4 w-4 text-[#5669FF]" />
                          Credits & Wallet
                        </Link>
                        <Link
                          href="/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
                        >
                          <User className="h-4 w-4 text-[#5669FF]" />
                          Profile Settings
                        </Link>
                      </>
                    )}

                    <div className="pt-1 border-t border-[#F0F1F7]">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
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
          {isAdmin ? (
            <>
              <Link
                href="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-purple-700 bg-purple-50"
              >
                🛡️ Master Overview
              </Link>
              <Link
                href="/admin/users"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
              >
                👥 User Management
              </Link>
              <Link
                href="/admin/regional-users"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
              >
                📍 Regional Users Directory
              </Link>
              <Link
                href="/admin/parking"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
              >
                🏢 Facility Approvals
              </Link>
              <Link
                href="/admin/analytics"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
              >
                📊 System Analytics
              </Link>
            </>
          ) : isManager ? (
            <>
              <Link
                href="/manager/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-teal-700 bg-teal-50"
              >
                🏢 Operations Center
              </Link>
              <Link
                href="/manager/scanner"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
              >
                📱 QR Gate Scanner
              </Link>
              <Link
                href="/manager/slots"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
              >
                🅿️ Facility Bays & Slots
              </Link>
              <Link
                href="/manager/revenue"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
              >
                📈 Hub Revenue
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/parking"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
              >
                Explore Parking Hubs
              </Link>
              <Link
                href="/map"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-4 py-2.5 rounded-2xl text-xs font-bold text-[#120D26] hover:bg-[#F0F1F7]"
              >
                Live GPS Map
              </Link>
              {isAuthenticated && (
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
                </>
              )}
            </>
          )}

          {isAuthenticated ? (
            <div className="pt-2 border-t border-[#F0F1F7]">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="block w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </div>
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

      {/* Selected Notification Full Screen Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#120D26]/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-[#EBEAEE] flex justify-between items-start bg-[#F0F1F7]/50">
              <div className="flex gap-3 items-center">
                <div className={`h-10 w-10 flex items-center justify-center rounded-2xl text-white ${
                  selectedNotification.type === 'REQUEST' ? 'bg-purple-600' : 'bg-[#5669FF]'
                }`}>
                  <Bell className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-[#120D26] leading-tight">{selectedNotification.title}</h2>
                  <span className="text-[10px] text-[#747688] font-bold uppercase tracking-wider">{new Date(selectedNotification.created_at).toLocaleString()}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-2 -mr-2 -mt-2 rounded-full hover:bg-[#EBEAEE] text-[#747688] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-8">
              <p className="text-[15px] text-[#424453] font-medium leading-relaxed whitespace-pre-wrap">
                {selectedNotification.message}
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-6 py-3 rounded-2xl text-xs font-bold text-[#747688] hover:text-[#120D26] hover:bg-[#F0F1F7] transition"
                >
                  Dismiss
                </button>
                {selectedNotification.type === "REQUEST" && isAdmin && (
                  <Link
                    href="/admin/parking"
                    onClick={() => setSelectedNotification(null)}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 transition shadow-lg shadow-purple-600/30"
                  >
                    Check & Update Location
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Global Region Selector Modal triggered from Navbar location pill */}
      <RegionSelectorModal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        onSelectRegion={(region) => {
          if (typeof window !== "undefined") {
            localStorage.setItem("parkease_selected_city", region);
            localStorage.setItem("parkease_selected_region", region);
            window.dispatchEvent(new Event("parkease_location_change"));
          }
        }}
      />
    </header>
  );
}
