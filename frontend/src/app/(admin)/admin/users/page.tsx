"use client";

import React, { useState, useEffect } from "react";
import { User, Role } from "@/types";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import { formatDateTime } from "@/lib/utils";
import {
  Users,
  Search,
  Shield,
  Briefcase,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Trash2,
  ArrowRightLeft,
  Building2,
  Car,
  Wallet,
  Phone,
  Calendar,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let url = "/admin/users?limit=100";
      if (roleFilter !== "ALL") url += `&role=${roleFilter}`;
      if (searchQuery.trim()) url += `&query=${encodeURIComponent(searchQuery.trim())}`;
      const res = await api.get<User[]>(url);
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, searchQuery]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    setActionLoadingId(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update role");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    setActionLoadingId(userId);
    try {
      await api.put(`/admin/users/${userId}/status`, { is_active: !currentStatus });
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update user status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string, role: string) => {
    if (!confirm(`Are you sure you want to permanently delete ${role} "${userName}" (ID: ${userId})? This cannot be undone.`)) {
      return;
    }
    setActionLoadingId(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to delete user account");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#F8F9FE]">
      <Sidebar type="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EBEAEE] pb-4">
          <div>
            <h1 className="text-2xl font-black text-[#120D26] flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-600" />
              User & Facility Manager Management
            </h1>
            <p className="text-xs text-[#747688] font-medium">
              View all user records, convert users into Hub Managers, modify roles, or delete manager accounts
            </p>
          </div>

          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-black text-purple-700 bg-purple-100 hover:bg-purple-200 border border-purple-200 transition cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Directory</span>
          </button>
        </div>

        {/* Filter & Search Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#747688]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, phone, or vehicle plate..."
              className="w-full rounded-2xl border border-[#EBEAEE] bg-white pl-10 pr-4 py-3 text-xs font-semibold text-[#120D26] placeholder-[#747688] focus:border-purple-600 focus:outline-none focus:ring-4 focus:ring-purple-600/15 shadow-xs"
            />
          </div>

          {/* Role Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#F0F1F7] p-1 rounded-2xl border border-[#EBEAEE] text-xs">
            {["ALL", "PARKING_MANAGER", "USER", "ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl font-bold transition cursor-pointer ${
                  roleFilter === r
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-[#747688] hover:text-[#120D26] hover:bg-white"
                }`}
              >
                {r === "PARKING_MANAGER" ? "Managers" : r === "USER" ? "Drivers" : r === "ADMIN" ? "Admins" : "All Roles"}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-3xl border border-[#EBEAEE] bg-white shadow-[0_10px_30px_rgba(86,105,255,0.04)]">
          {loading ? (
            <div className="p-12 text-center text-xs text-[#747688] font-medium">Loading user directory...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#747688] font-medium">No users found matching query.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#EBEAEE] bg-[#F0F1F7] text-[#747688] uppercase font-black text-[10px]">
                  <tr>
                    <th className="p-4">User Information</th>
                    <th className="p-4">Contact / Vehicle</th>
                    <th className="p-4">Wallet Balance</th>
                    <th className="p-4">Role Designation</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0F1F7]">
                  {users.map((u) => {
                    const isManager = u.role === "PARKING_MANAGER";
                    const isAdmin = u.role === "ADMIN";
                    const isDriver = u.role === "USER";

                    return (
                      <tr key={u.id} className="hover:bg-[#F0F1F7]/50 transition">
                        {/* User details */}
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
                                <Calendar className="h-3 w-3" />
                                <span>Joined {formatDateTime(u.created_at)}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact / Vehicle */}
                        <td className="p-4 text-[#120D26]">
                          <div className="flex items-center gap-1.5 text-xs font-semibold">
                            <Phone className="h-3 w-3 text-[#747688]" />
                            <span>{u.phone || "No phone registered"}</span>
                          </div>
                          {u.vehicle_number ? (
                            <div className="text-[11px] font-mono text-[#5669FF] font-bold mt-1 flex items-center gap-1">
                              <Car className="h-3 w-3" />
                              <span>{u.vehicle_number} ({u.vehicle_type})</span>
                            </div>
                          ) : (
                            <div className="text-[10px] text-[#747688] mt-1">No vehicle registered</div>
                          )}
                        </td>

                        {/* Wallet Balance */}
                        <td className="p-4">
                          <div className="font-black text-[#120D26] text-sm">
                            {u.wallet_balance ?? 0} <span className="text-xs font-bold text-[#5669FF]">Credits</span>
                          </div>
                        </td>

                        {/* Role Selector */}
                        <td className="p-4">
                          <select
                            value={u.role}
                            disabled={actionLoadingId === u.id}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            aria-label="Change User Role"
                            className={`border text-xs font-black rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-500/20 shadow-xs cursor-pointer transition ${
                              isAdmin
                                ? "bg-purple-50 border-purple-200 text-purple-800"
                                : isManager
                                ? "bg-teal-50 border-teal-200 text-teal-800"
                                : "bg-blue-50 border-blue-200 text-blue-800"
                            }`}
                          >
                            <option value="USER">🚗 USER (Driver)</option>
                            <option value="PARKING_MANAGER">🏢 PARKING_MANAGER</option>
                            <option value="ADMIN">🛡️ ADMIN</option>
                          </select>
                        </td>

                        {/* Status */}
                        <td className="p-4">
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

                        {/* Actions */}
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Convert to Manager / Convert to Driver Quick Button */}
                            {isDriver && (
                              <button
                                type="button"
                                disabled={actionLoadingId === u.id}
                                onClick={() => handleRoleChange(u.id, "PARKING_MANAGER")}
                                className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white border border-teal-200 transition cursor-pointer"
                                title="Convert Driver to Facility Manager"
                              >
                                + Make Manager
                              </button>
                            )}

                            {isManager && (
                              <button
                                type="button"
                                disabled={actionLoadingId === u.id}
                                onClick={() => handleRoleChange(u.id, "USER")}
                                className="px-2.5 py-1 rounded-xl text-[11px] font-black bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 transition cursor-pointer"
                                title="Demote Manager to Standard Driver"
                              >
                                Convert to Driver
                              </button>
                            )}

                            {/* Suspend / Activate Button */}
                            <button
                              type="button"
                              disabled={actionLoadingId === u.id}
                              onClick={() => handleStatusToggle(u.id, u.is_active)}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition shadow-xs cursor-pointer ${
                                u.is_active
                                  ? "bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200"
                                  : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200"
                              }`}
                            >
                              {u.is_active ? "Suspend" : "Activate"}
                            </button>

                            {/* Delete User/Manager */}
                            <button
                              type="button"
                              disabled={actionLoadingId === u.id}
                              onClick={() => handleDeleteUser(u.id, u.full_name, u.role)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-500 transition cursor-pointer"
                              title={`Delete ${u.role}`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
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
