"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, Car, ArrowRight, ShieldCheck, RefreshCw, AlertCircle, Eye, EyeOff, Sparkles } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password");
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setError(getErrorMessage(err, "Invalid email or password. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Banner (EventHub Style) */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-[#5669FF] text-white shadow-xl shadow-[#5669FF]/30">
            <Car className="h-8 w-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#120D26] tracking-tight">
            Sign In to ParkEase
          </h2>
          <p className="text-xs sm:text-sm text-[#747688] max-w-xs mx-auto font-medium">
            Enter your email and password to access your smart parking passes
          </p>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-[#EBEAEE] bg-white p-6 sm:p-8 shadow-[0_10px_35px_rgba(86,105,255,0.06)] space-y-5">
          
          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-[#120D26] mb-1.5">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-xl bg-[#F0F1F7] text-[#5669FF] group-focus-within:bg-[#5669FF] group-focus-within:text-white transition">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gmail.com or driver@gmail.com"
                  className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] pl-12 pr-4 py-3 text-xs text-[#120D26] placeholder-[#747688] font-medium focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-black text-[#120D26]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold text-[#5669FF] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-xl bg-[#F0F1F7] text-[#5669FF] group-focus-within:bg-[#5669FF] group-focus-within:text-white transition">
                  <Lock className="h-3.5 w-3.5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] pl-12 pr-10 py-3 text-xs text-[#120D26] placeholder-[#747688] font-medium focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#747688] hover:text-[#120D26] transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl text-xs font-black text-white bg-[#5669FF] hover:bg-[#4657E5] shadow-lg shadow-[#5669FF]/30 active:scale-95 transition-all flex items-center justify-between px-6 cursor-pointer disabled:opacity-50"
            >
              <span className="flex-1 text-center pl-4">
                {loading ? "Signing In..." : "SIGN IN"}
              </span>
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
              </div>
            </button>
          </form>

          <div className="text-center text-xs text-[#747688] pt-2 border-t border-[#F0F1F7]">
            Don't have an account?{" "}
            <Link href="/register" className="font-black text-[#5669FF] hover:underline">
              Sign up with 100 free credits
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
