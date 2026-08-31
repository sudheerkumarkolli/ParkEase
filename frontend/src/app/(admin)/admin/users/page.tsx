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
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        
        <div className="border-b border-slate-800 pb-4">
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Users className="h-6 w-6 text-purple-400" />
            User & Role Management
          </h1>
          <p className="text-xs text-slate-400">
            View driver profiles, assign facility manager roles, and manage access permissions
          </p>
        </div>

        {/* Filter Row */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name, email, or phone..."
              className="w-full rounded-2xl border border-slate-800 bg-slate-900/60 pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-2xl border border-slate-800 text-xs">
            {["ALL", "USER", "PARKING_MANAGER", "ADMIN"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  roleFilter === r
                    ? "bg-purple-500 text-white shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-800 bg-slate-950/70 text-slate-400 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Phone / Vehicle</th>
                    <th className="p-4">Wallet Balance</th>
                    <th className="p-4">Assigned Role</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/30 transition">
                      <td className="p-4">
                        <div className="font-bold text-white">{u.full_name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="p-4 text-slate-300">
                        <div>{u.phone || "No phone"}</div>
                        {u.vehicle_number && (
                          <div className="text-[11px] font-mono text-emerald-400 font-bold">
                            {u.vehicle_number} ({u.vehicle_type})
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-bold text-white">{u.wallet_balance} Cr</td>
                      <td className="p-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-slate-950 border border-slate-800 text-[11px] font-bold text-purple-300 rounded-xl px-2.5 py-1 focus:border-purple-500 focus:outline-none"
                        >
                          <option value="USER">USER</option>
                          <option value="PARKING_MANAGER">PARKING_MANAGER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            u.is_active
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}
                        >
                          {u.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleStatusToggle(u.id, u.is_active)}
                          className={`px-3 py-1 rounded-xl text-[11px] font-bold transition ${
                            u.is_active
                              ? "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                              : "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                          }`}
                        >
                          {u.is_active ? "Block User" : "Activate"}
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
