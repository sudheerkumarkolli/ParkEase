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
  SlidersHorizontal,
} from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

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
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update role");
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { is_active: !currentStatus });
      await fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to update user status");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-50">
      <Sidebar type="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-600" />
              User & Role Management
            </h1>
            <p className="text-xs text-slate-500">
              View driver profiles, assign facility manager roles, and manage active platform accounts
            </p>
          </div>

          <button
            onClick={fetchUsers}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition"
          >
            <RefreshCw className="h-3.5 w-3.5 text-purple-600" />
            <span>Refresh Users</span>
          </button>
        </div>

        {/* Filter & Search Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or vehicle..."
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none shadow-sm"
            />
          </div>

          {/* High-Contrast Filter Buttons */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs shadow-sm">
            {["ALL", "USER", "PARKING_MANAGER", "ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl font-bold transition ${
                  roleFilter === r
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading user records...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No users found matching query.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Phone / Vehicle</th>
                    <th className="p-4">Wallet Balance</th>
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{u.full_name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                      </td>
                      <td className="p-4 text-slate-600">
                        <div>{u.phone || "No phone registered"}</div>
                        {u.vehicle_number && (
                          <div className="text-[11px] font-mono text-emerald-700 font-bold">
                            {u.vehicle_number} ({u.vehicle_type})
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-black text-slate-900">
                        {u.wallet_balance} Credits <span className="text-slate-400 font-normal">(₹{u.wallet_balance})</span>
                      </td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-white border border-slate-300 text-[11px] font-bold text-purple-700 rounded-xl px-3 py-1.5 focus:border-purple-500 focus:outline-none shadow-sm cursor-pointer"
                        >
                          <option value="USER">USER</option>
                          <option value="PARKING_MANAGER">PARKING_MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            u.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {u.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleStatusToggle(u.id, u.is_active)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                            u.is_active
                              ? "bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200"
                          }`}
                        >
                          {u.is_active ? "Suspend" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
