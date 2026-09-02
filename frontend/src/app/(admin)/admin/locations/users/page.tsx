"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import { formatDateTime } from "@/lib/utils";
import {
  MapPin,
  Search,
  Users,
  Building2,
  Car,
  Shield,
  Briefcase,
  Phone,
  Wallet,
  Calendar,
  RefreshCw,
  Sparkles,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

interface RegionalUser {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
  role: string;
  vehicle_number: string | null;
  vehicle_type: string;
  is_active: boolean;
  created_at: string;
  wallet_balance: number;
  location_city: string;
  total_bookings: number;
  primary_hub: string;
}

interface CitySummary {
  city: string;
  total_users: number;
  managers_count: number;
  drivers_count: number;
  admins_count: number;
}

interface LocationUsersResponse {
  cities: string[];
  city_summaries: CitySummary[];
  users_by_location: Record<string, RegionalUser[]>;
  total_users_count: number;
}

export default function RegionalUsersPage() {
  const [data, setData] = useState<LocationUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const fetchData = async () => {
    try {
      setLoading(true);
      let url = "/admin/users/by-location";
      if (searchQuery.trim()) url += `?query=${encodeURIComponent(searchQuery.trim())}`;
      const res = await api.get<LocationUsersResponse>(url);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load regional users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [searchQuery]);

  // Extract all users or users in selected city
  let displayUsers: RegionalUser[] = [];
  if (data?.users_by_location) {
    if (selectedCity === "ALL") {
      Object.values(data.users_by_location).forEach((userList) => {
        displayUsers = displayUsers.concat(userList);
      });
    } else {
      displayUsers = data.users_by_location[selectedCity] || [];
    }
  }

  // Filter by role if selected
  if (roleFilter !== "ALL") {
    displayUsers = displayUsers.filter((u) => u.role === roleFilter);
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#F8F9FE]">
      <Sidebar type="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EBEAEE] pb-4">
          <div>
            <h1 className="text-2xl font-black text-[#120D26] flex items-center gap-2">
              <MapPin className="h-6 w-6 text-purple-600" />
              Regional Users Directory
            </h1>
            <p className="text-xs text-[#747688] font-medium">
              Geographic breakdown of drivers, hub managers, and registered parking activity by city
            </p>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-200 transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh City Data</span>
          </button>
        </div>

        {/* City Summary Metric Cards */}
        {data && data.city_summaries && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.city_summaries.map((summary) => (
              <div
                key={summary.city}
                onClick={() => setSelectedCity(summary.city === selectedCity ? "ALL" : summary.city)}
                className={`p-4 sm:p-5 rounded-3xl border transition cursor-pointer ${
                  selectedCity === summary.city
                    ? "bg-purple-600 text-white border-purple-600 shadow-lg shadow-purple-600/20"
                    : "bg-white border-[#EBEAEE] text-[#120D26] hover:border-purple-300 shadow-[0_8px_25px_rgba(86,105,255,0.03)]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full border ${
                      selectedCity === summary.city
                        ? "bg-white/20 border-white/30 text-white"
                        : "bg-purple-50 text-purple-700 border-purple-200"
                    }`}
                  >
                    {summary.city}
                  </span>
                  <MapPin className={`h-4 w-4 ${selectedCity === summary.city ? "text-white" : "text-purple-600"}`} />
                </div>
                <div className="text-2xl sm:text-3xl font-black">{summary.total_users}</div>
                <div className={`text-[11px] font-medium mt-1 ${selectedCity === summary.city ? "text-white/80" : "text-[#747688]"}`}>
                  {summary.drivers_count} Drivers • {summary.managers_count} Managers
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Filters and Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#747688]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user name, email, vehicle plate, or hub..."
              className="w-full rounded-2xl border border-[#EBEAEE] bg-white pl-10 pr-4 py-3 text-xs font-semibold text-[#120D26] placeholder-[#747688] focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-600/15 shadow-xs"
            />
          </div>

          {/* City Filter Pills */}
          <div className="flex items-center gap-1 bg-[#F0F1F7] p-1 rounded-2xl border border-[#EBEAEE] text-xs overflow-x-auto max-w-full">
            <button
              onClick={() => setSelectedCity("ALL")}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                selectedCity === "ALL"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-[#747688] hover:text-[#120D26] hover:bg-white"
              }`}
            >
              All Cities
            </button>
            {data?.cities.map((cityName) => (
              <button
                key={cityName}
                onClick={() => setSelectedCity(cityName)}
                className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                  selectedCity === cityName
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-white"
                }`}
              >
                {cityName}
              </button>
            ))}
          </div>

          {/* Role Filter */}
          <div className="flex items-center gap-1 bg-[#F0F1F7] p-1 rounded-2xl border border-[#EBEAEE] text-xs">
            {["ALL", "USER", "PARKING_MANAGER"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  roleFilter === r
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-white"
                }`}
              >
                {r === "PARKING_MANAGER" ? "Managers" : r === "USER" ? "Drivers" : "All Roles"}
              </button>
            ))}
          </div>
        </div>

        {/* Regional Users Table */}
        <div className="overflow-hidden rounded-3xl border border-[#EBEAEE] bg-white shadow-[0_10px_30px_rgba(86,105,255,0.04)]">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#747688] font-medium">Loading regional user data...</div>
          ) : displayUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#747688] font-medium">
              No users registered or active in {selectedCity === "ALL" ? "the selected filters" : selectedCity}.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#EBEAEE] bg-[#F0F1F7] text-[#747688] uppercase font-black text-[10px]">
                  <tr>
                    <th className="p-4">User Information</th>
                    <th className="p-4">Assigned Location / Hub</th>
                    <th className="p-4">Vehicle Details</th>
                    <th className="p-4">Bookings in City</th>
                    <th className="p-4">Wallet Balance</th>
                    <th className="p-4">Role</th>
                    <th className="p-4 text-right">Account Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F1F7]">
                  {displayUsers.map((u) => {
                    const isManager = u.role === "PARKING_MANAGER";
                    const isAdmin = u.role === "ADMIN";

                    return (
                      <tr key={u.id} className="hover:bg-[#F0F1F7]/50 transition">
                        {/* User info */}
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={`flex h-9 w-9 items-center justify-center rounded-2xl text-white font-extrabold text-xs shrink-0 ${
                                isAdmin
                                  ? "bg-purple-600"
                                  : isManager
                                  ? "bg-teal-600"
                                  : "bg-[#5669FF]"
                              }`}
                            >
                              {u.full_name?.charAt(0).toUpperCase() || "U"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-black text-[#120D26] truncate">{u.full_name}</div>
                              <div className="text-[11px] text-[#747688] font-mono truncate">{u.email}</div>
                              <div className="text-[10px] text-[#747688] font-medium flex items-center gap-1 mt-0.5">
                                <Phone className="h-3 w-3" />
                                <span>{u.phone || "No phone"}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Location / Hub */}
                        <td className="p-4">
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 font-bold text-xs">
                            <MapPin className="h-3 w-3 text-purple-600" />
                            <span>{u.location_city}</span>
                          </div>
                          <div className="text-[11px] text-[#747688] font-medium mt-1 truncate max-w-[200px]">
                            {u.primary_hub}
                          </div>
                        </td>

                        {/* Vehicle */}
                        <td className="p-4">
                          {u.vehicle_number ? (
                            <div className="font-mono text-[#120D26] font-bold text-xs flex items-center gap-1">
                              <Car className="h-3.5 w-3.5 text-[#5669FF]" />
                              <span>{u.vehicle_number}</span>
                              <span className="text-[#747688] font-normal text-[11px]">({u.vehicle_type})</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-[#747688]">No vehicle listed</span>
                          )}
                        </td>

                        {/* Bookings count */}
                        <td className="p-4">
                          <span className="inline-block px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 font-black text-xs">
                            {u.total_bookings} Bookings
                          </span>
                        </td>

                        {/* Wallet Balance */}
                        <td className="p-4">
                          <span className="font-black text-[#120D26] text-xs">
                            {u.wallet_balance} Cr
                          </span>
                        </td>

                        {/* Role */}
                        <td className="p-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-xl text-[10px] font-black border ${
                              isAdmin
                                ? "bg-purple-50 text-purple-700 border-purple-200"
                                : isManager
                                ? "bg-teal-50 text-teal-700 border-teal-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                            }`}
                          >
                            {isAdmin ? "Admin" : isManager ? "Manager" : "Driver"}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="p-4 text-right">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                              u.is_active
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-rose-50 text-rose-700 border-rose-200"
                            }`}
                          >
                            {u.is_active ? "Active" : "Suspended"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
