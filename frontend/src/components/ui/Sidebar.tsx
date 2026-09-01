"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  CalendarCheck2,
  Wallet,
  User,
  Compass,
  MapPin,
  QrCode,
  Layers,
  TrendingUp,
  Building2,
  Users,
  CreditCard,
  BarChart3,
  LogOut,
  Sparkles,
} from "lucide-react";

interface SidebarProps {
  type: "user" | "manager" | "admin";
}

export default function Sidebar({ type }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userNav = [
    { name: "My Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Explore Hubs", href: "/parking", icon: Compass },
    { name: "Live GPS Map", href: "/map", icon: MapPin },
    { name: "My Smart Passes", href: "/bookings", icon: CalendarCheck2 },
    { name: "Credits & Wallet", href: "/wallet", icon: Wallet },
    { name: "Profile Settings", href: "/profile", icon: User },
  ];

  const managerNav = [
    { name: "Operations Center", href: "/manager/dashboard", icon: LayoutDashboard },
    { name: "QR Gate Scanner", href: "/manager/scanner", icon: QrCode },
    { name: "Facility Bays & Slots", href: "/manager/slots", icon: Layers },
    { name: "Manage Facilities", href: "/manager/parking", icon: Building2 },
    { name: "Live Bookings", href: "/manager/bookings", icon: CalendarCheck2 },
    { name: "Hub Revenue", href: "/manager/revenue", icon: TrendingUp },
  ];

  const adminNav = [
    { name: "Master Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "User Management", href: "/admin/users", icon: Users },
    { name: "Facility Approvals", href: "/admin/parking", icon: Building2 },
    { name: "Global Bookings", href: "/admin/bookings", icon: CalendarCheck2 },
    { name: "Financial Ledger", href: "/admin/transactions", icon: CreditCard },
    { name: "Platform Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  const navItems = type === "admin" ? adminNav : type === "manager" ? managerNav : userNav;

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-[#EBEAEE] bg-white min-h-[calc(100vh-4rem)] p-4 justify-between">
      <div className="space-y-6">
        {/* User Card */}
        <div className="flex items-center gap-3 p-3.5 rounded-3xl bg-[#F0F1F7] border border-[#EBEAEE]">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#5669FF] text-white font-extrabold text-sm shadow-md shadow-[#5669FF]/20">
            {user?.full_name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-black text-[#120D26] truncate">{user?.full_name || "Driver"}</div>
            <span className="inline-block mt-0.5 text-[9px] uppercase font-black px-2 py-0.5 rounded-full bg-[#5669FF]/15 text-[#5669FF]">
              {user?.role || type.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Navigation Items with EventHub Squircle Highlight */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-black transition-all duration-200 ${
                  isActive
                    ? "bg-[#5669FF] text-white shadow-lg shadow-[#5669FF]/25"
                    : "text-[#747688] hover:bg-[#F0F1F7] hover:text-[#120D26]"
                }`}
              >
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-xl transition ${
                    isActive ? "bg-white/20 text-white" : "bg-[#F0F1F7] text-[#5669FF]"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Sign Out */}
      <div className="pt-4 border-t border-[#F0F1F7] space-y-2">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
