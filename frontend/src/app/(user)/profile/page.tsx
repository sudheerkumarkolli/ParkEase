"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/ui/Sidebar";
import { api } from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  Car,
  Lock,
  Shield,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Save,
} from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("Car");
  const [password, setPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhone(user.phone || "");
      setVehicleNumber(user.vehicle_number || "");
      setVehicleType(user.vehicle_type || "Car");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const payload: any = {
        full_name: fullName,
        phone,
        vehicle_number: vehicleNumber.toUpperCase(),
        vehicle_type: vehicleType,
      };
      if (password.trim()) {
        payload.password = password;
      }
      await api.put("/users/me", payload);
      await refreshUser();
      setSuccess("Profile settings updated successfully!");
      setPassword("");
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to update profile"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="user" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl">
        
        <div className="border-b border-slate-100 pb-4">
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <User className="h-6 w-6 text-emerald-400" />
            Profile & Vehicle Settings
          </h1>
          <p className="text-xs text-slate-500">
            Manage your personal profile, primary vehicle registration, and credentials
          </p>
        </div>

        {success && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 font-semibold flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-medium flex items-center gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* User Card Summary */}
        <div className="rounded-3xl border border-slate-100 bg-white/60 p-6 flex items-center justify-between backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-slate-950 font-black text-xl">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{user?.full_name}</h3>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 uppercase">
                  {user?.role}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Wallet: {user?.wallet_balance} Credits
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-100 bg-white/60 p-6 space-y-4 backdrop-blur-xl">
          
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-950 pl-10 pr-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email (Read Only)</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <input
                  type="email"
                  disabled
                  value={user?.email || ""}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-950/40 pl-10 pr-4 py-3 text-xs text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border border-slate-100 bg-slate-950 pl-10 pr-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100/80">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vehicle License Plate</label>
              <div className="relative">
                <Car className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="AP 16 BQ 7788"
                  className="w-full rounded-2xl border border-slate-100 bg-slate-950 pl-10 pr-4 py-3 text-xs font-mono uppercase font-bold text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vehicle Category</label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="w-full rounded-2xl border border-slate-100 bg-slate-950 px-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Car">Car</option>
                <option value="SUV">SUV</option>
                <option value="Bike">Bike</option>
                <option value="EV">EV</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100/80">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Change Password (Leave blank to keep current)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password (min 6 chars)"
                className="w-full rounded-2xl border border-slate-100 bg-slate-950 pl-10 pr-4 py-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 py-3.5 text-xs font-black text-slate-950 hover:from-emerald-300 transition shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving Changes..." : "Save Settings"}
          </button>
        </form>
      </main>
    </div>
  );
}
