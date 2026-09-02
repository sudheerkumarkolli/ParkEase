"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Lock, Mail, KeyRound, Eye, EyeOff, X, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectTo?: string;
  facilityName?: string;
}

export default function LoginModal({
  isOpen,
  onClose,
  redirectTo = "/booking",
  facilityName,
}: LoginModalProps) {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      onClose();
      router.push(redirectTo);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Invalid email or password. Please check credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md rounded-3xl border-2 border-[#5669FF]/30 bg-white p-6 sm:p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#F0F1F7] text-[#747688] hover:bg-[#EBEAEE] hover:text-[#120D26] transition cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#5669FF]/10 text-[#5669FF] shadow-inner">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#120D26]">
            Sign In to Buy Parking Bay
          </h2>
          <p className="text-xs text-[#747688] font-medium leading-relaxed">
            {facilityName ? (
              <>
                Enter your credentials to lock your slot at <strong className="text-[#120D26]">{facilityName}</strong>.
              </>
            ) : (
              "Please enter your login credentials to confirm your booking and generate your digital QR pass."
            )}
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-black text-[#120D26]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#747688]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] pl-10 pr-4 py-3 text-xs font-semibold text-[#120D26] placeholder-[#747688] focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-black text-[#120D26]">Password</label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#747688]" />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] pl-10 pr-10 py-3 text-xs font-semibold text-[#120D26] placeholder-[#747688] focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#747688] hover:text-[#120D26]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#5669FF] hover:bg-[#4657E5] text-white font-black text-xs transition shadow-lg shadow-[#5669FF]/25 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Verifying Credentials..." : "Sign In & Buy Bay"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Footer info */}
        <div className="pt-2 border-t border-[#F0F1F7] text-center space-y-2">
          <p className="text-xs text-[#747688] font-medium">
            Don&apos;t have an account?{" "}
            <Link
              href={`/register?redirect=${encodeURIComponent(redirectTo)}`}
              onClick={onClose}
              className="font-black text-[#5669FF] hover:underline"
            >
              Sign Up (+100 Free Credits)
            </Link>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#747688]">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Encrypted 256-bit Secure Authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
