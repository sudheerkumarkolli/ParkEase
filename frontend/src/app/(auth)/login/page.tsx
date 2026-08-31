"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Car, Sparkles, ArrowRight, Shield, Briefcase, UserCheck } from "lucide-react";

import { getErrorMessage } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(getErrorMessage(err, "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (role: "admin" | "manager" | "user") => {
    if (role === "admin") {
      setEmail("admin@parkease.local");
      setPassword("Admin@12345");
    } else if (role === "manager") {
      setEmail("manager@parkease.local");
      setPassword("Manager@12345");
    } else {
      setEmail("user@parkease.local");
      setPassword("User@12345");
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Banner */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-xl shadow-emerald-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-slate-950">
              <Car className="h-6 w-6 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Welcome Back</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Sign in to access your ParkEase reservations and credits
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-400 font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-emerald-400 hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 py-3.5 text-xs font-extrabold text-slate-950 hover:from-emerald-300 hover:to-teal-200 transition shadow-lg shadow-emerald-500/25 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Authenticating..." : "Sign In"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="border-t border-slate-800/80 pt-4 space-y-2">
            <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block text-center">
              Quick Test Accounts
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => fillCredentials("user")}
                className="flex items-center justify-center gap-1 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 text-[11px] font-semibold text-emerald-400 transition"
              >
                <UserCheck className="h-3 w-3" />
                User
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("manager")}
                className="flex items-center justify-center gap-1 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-teal-500/40 text-[11px] font-semibold text-teal-400 transition"
              >
                <Briefcase className="h-3 w-3" />
                Manager
              </button>
              <button
                type="button"
                onClick={() => fillCredentials("admin")}
                className="flex items-center justify-center gap-1 p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500/40 text-[11px] font-semibold text-purple-400 transition"
              >
                <Shield className="h-3 w-3" />
                Admin
              </button>
            </div>
          </div>

          <div className="text-center text-xs text-slate-400">
            Don't have an account?{" "}
            <Link href="/register" className="font-bold text-emerald-400 hover:underline">
              Create account & get 100 credits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
