"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  MapPin,
  Compass,
  CalendarCheck2,
  Wallet,
  Bell,
  User,
  Shield,
  Briefcase,
  QrCode,
  Layers,
  BarChart3,
  Users,
  Building2,
  CreditCard,
  LogOut
} from "lucide-react";

interface SidebarProps {
  type?: "user" | "manager" | "admin";
}

export default function Sidebar({ type = "user" }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const userNav = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Find Parking", href: "/parking", icon: Compass },
    { label: "Live Map", href: "/map", icon: MapPin },
    { label: "My Bookings", href: "/bookings", icon: CalendarCheck2 },
    { label: "Wallet & Credits", href: "/wallet", icon: Wallet },
    { label: "Notifications", href: "/notifications", icon: Bell },
    { label: "Profile Settings", href: "/profile", icon: User },
  ];

  const managerNav = [
    { label: "Overview", href: "/manager/dashboard", icon: LayoutDashboard },
    { label: "QR Entry/Exit Scanner", href: "/manager/scanner", icon: QrCode },
    { label: "Manage Parking Hubs", href: "/manager/parking", icon: Building2 },
    { label: "Slot Grid & Control", href: "/manager/slots", icon: Layers },
    { label: "Bookings Ledger", href: "/manager/bookings", icon: CalendarCheck2 },
    { label: "Revenue Analytics", href: "/manager/revenue", icon: BarChart3 },
  ];

  const adminNav = [
    { label: "Admin Console", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "User Management", href: "/admin/users", icon: Users },
    { label: "Parking Approvals", href: "/admin/parking", icon: Building2 },
    { label: "Global Bookings", href: "/admin/bookings", icon: CalendarCheck2 },
    { label: "Financial Ledger", href: "/admin/transactions", icon: CreditCard },
    { label: "Platform Analytics", href: "/admin/analytics", icon: BarChart3 },
  ];

  const navItems = type === "admin" ? adminNav : type === "manager" ? managerNav : userNav;
  const hubTitle = type === "admin" ? "Admin Center" : type === "manager" ? "Manager Portal" : "User Portal";
  const badgeColor = type === "admin" ? "bg-purple-500/20 text-purple-400" : type === "manager" ? "bg-teal-500/20 text-teal-400" : "bg-emerald-500/20 text-emerald-400";

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-800/80 bg-slate-950/60 backdrop-blur-xl p-4 flex flex-col justify-between hidden lg:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        
        {/* Hub Header Badge */}
        <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">{hubTitle}</div>
          <div className="text-sm font-semibold text-white truncate flex items-center justify-between mt-0.5">
            <span>{user?.full_name?.split(" ")[0]}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${badgeColor}`}>
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && item.href !== "/manager/dashboard" && item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/70"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-emerald-400" : "text-slate-400"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Quick Portal Switcher for Admin/Manager */}
        {(user?.role === "ADMIN" || user?.role === "PARKING_MANAGER") && (
          <div className="pt-4 border-t border-slate-800/80 space-y-1">
            <div className="px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-2">Switch View</div>
            
            {type !== "user" && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-slate-900 hover:text-emerald-400 transition"
              >
                <Compass className="h-3.5 w-3.5" />
                Back to User View
              </Link>
            )}

            {user.role === "PARKING_MANAGER" && type !== "manager" && (
              <Link
                href="/manager/dashboard"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-teal-400 hover:bg-teal-500/10 transition"
              >
                <Briefcase className="h-3.5 w-3.5" />
                Manager Dashboard
              </Link>
            )}

            {user.role === "ADMIN" && type !== "admin" && (
              <Link
                href="/admin/dashboard"
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-purple-400 hover:bg-purple-500/10 transition"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin Dashboard
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Footer logout */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
