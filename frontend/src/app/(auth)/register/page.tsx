"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { User, Mail, Lock, Phone, Car, Sparkles, ArrowRight, ArrowLeft, ShieldCheck, KeyRound, RefreshCw, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { getErrorMessage } from "@/lib/utils";

export default function RegisterPage() {
  const { register, sendOtp } = useAuth();
  const [step, setStep] = useState<"details" | "otp">("details");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("Car");
  const [roleToken, setRoleToken] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleInitiateVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await sendOtp(email.trim());
      setSuccessMsg(`Verification code sent to ${email}`);
      setStep("otp");
      setResendCooldown(30);
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to send verification code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      setError("Please enter the complete 6-digit verification code");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      await register({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
        confirm_password: confirmPassword,
        vehicle_number: vehicleNumber.trim() || undefined,
        vehicle_type: vehicleType,
        otp: otp.trim(),
        role_token: roleToken.trim() || undefined,
      });
    } catch (err: any) {
      setError(getErrorMessage(err, "Email verification failed. Please check the code and try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setError(null);
    setLoading(true);
    try {
      await sendOtp(email.trim());
      setSuccessMsg(`A fresh verification code has been sent to ${email}`);
      setResendCooldown(30);
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to resend code."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#5669FF]/30 bg-[#5669FF]/10 px-3.5 py-1 text-xs font-bold text-[#5669FF]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>100 Welcome Credits Included</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#120D26] tracking-tight">
            {step === "details" ? "Create ParkEase Account" : "Verify Email"}
          </h2>
          <p className="text-xs sm:text-sm text-[#747688] max-w-md mx-auto font-medium">
            {step === "details"
              ? "Join ParkEase for guaranteed smart parking reservations and live navigation"
              : `Enter the 6-digit verification code sent to ${email}`}
          </p>

        </div>

        {/* Form Card */}
        <div className="rounded-3xl border border-[#EBEAEE] bg-white p-6 sm:p-8 shadow-[0_10px_35px_rgba(86,105,255,0.06)] space-y-5">
          
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === "details" ? (
            /* STEP 1: Personal and Vehicle Details */
            <form onSubmit={handleInitiateVerification} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-black text-[#120D26] mb-1.5">Full Name</label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-xl bg-[#F0F1F7] text-[#5669FF] group-focus-within:bg-[#5669FF] group-focus-within:text-white transition">
                    <User className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Suresh Kumar"
                    className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] pl-12 pr-4 py-3 text-xs text-[#120D26] placeholder-[#747688] font-medium focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15 transition"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#120D26] mb-1.5">Email Address</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-xl bg-[#F0F1F7] text-[#5669FF] group-focus-within:bg-[#5669FF] group-focus-within:text-white transition">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="driver@gmail.com"
                      className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] pl-12 pr-4 py-3 text-xs text-[#120D26] placeholder-[#747688] font-medium focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#120D26] mb-1.5">Phone Number (Optional)</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-xl bg-[#F0F1F7] text-[#5669FF] group-focus-within:bg-[#5669FF] group-focus-within:text-white transition">
                      <Phone className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] pl-12 pr-4 py-3 text-xs text-[#120D26] placeholder-[#747688] font-medium focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Number & Vehicle Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#120D26] mb-1.5">Vehicle Number Plate</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-xl bg-[#F0F1F7] text-[#5669FF] group-focus-within:bg-[#5669FF] group-focus-within:text-white transition">
                      <Car className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="text"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                      placeholder="AP 16 BQ 7788"
                      className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] pl-12 pr-4 py-3 text-xs text-[#120D26] uppercase placeholder-[#747688] font-bold focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-[#120D26] mb-1.5">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] px-4 py-3 text-xs text-[#120D26] font-bold focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15 transition cursor-pointer"
                  >
                    <option value="Car">Car (Sedan / Hatchback)</option>
                    <option value="SUV">SUV / Compact SUV</option>
                    <option value="Bike">Motorcycle / Scooter</option>
                    <option value="EV">Electric Vehicle (EV)</option>
                  </select>
                </div>
              </div>

              {/* Optional Role Token */}
              <div className="space-y-1.5 rounded-2xl bg-[#F8F9FE] p-3.5 border border-[#EBEAEE]">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black text-[#120D26] flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#5669FF]" />
                    <span>Role Access Token</span>
                    <span className="text-[10px] text-[#747688] font-normal">(Optional)</span>
                  </label>
                  <span className="text-[10px] text-[#5669FF] font-bold">
                    No token = Driver
                  </span>
                </div>
                <input
                  type="text"
                  value={roleToken}
                  onChange={(e) => setRoleToken(e.target.value)}
                  placeholder="Enter Manager or Admin token (e.g. MANAGER2026)"
                  className="w-full rounded-xl border border-[#EBEAEE] bg-white px-3.5 py-2.5 text-xs font-semibold text-[#120D26] placeholder-[#747688] focus:border-[#5669FF] focus:outline-none focus:ring-2 focus:ring-[#5669FF]/20"
                />
                <p className="text-[10px] text-[#747688] leading-tight font-medium">
                  🔑 Leave empty for standard Driver account. Use <strong className="text-teal-700">MANAGER2026</strong> for Manager, or <strong className="text-purple-700">ADMIN2026</strong> for Admin.
                </p>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-[#120D26] mb-1.5">Password</label>
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

                <div>
                  <label className="block text-xs font-black text-[#120D26] mb-1.5">Confirm Password</label>
                  <div className="relative group">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-xl bg-[#F0F1F7] text-[#5669FF] group-focus-within:bg-[#5669FF] group-focus-within:text-white transition">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] pl-12 pr-10 py-3 text-xs text-[#120D26] placeholder-[#747688] font-medium focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#747688] hover:text-[#120D26] transition-colors focus:outline-none"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl text-xs font-black text-white bg-[#5669FF] hover:bg-[#4657E5] shadow-lg shadow-[#5669FF]/30 active:scale-95 transition-all flex items-center justify-between px-6 cursor-pointer disabled:opacity-50"
              >
                <span className="flex-1 text-center pl-4">
                  {loading ? "Sending Code..." : "CONTINUE & VERIFY"}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                  {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                </div>
              </button>
            </form>
          ) : (
            /* STEP 2: Enter Email Verification Code */
            <form onSubmit={handleCompleteRegistration} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-black text-[#120D26]">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep("details");
                      setError(null);
                    }}
                    className="flex items-center gap-1 text-[11px] text-[#747688] hover:text-[#5669FF] font-bold transition"
                  >
                    <ArrowLeft className="h-3 w-3" /> Edit details
                  </button>
                </div>

                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-xl bg-[#F0F1F7] text-[#5669FF] group-focus-within:bg-[#5669FF] group-focus-within:text-white transition">
                    <KeyRound className="h-3.5 w-3.5" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                    placeholder="Enter 6-digit code"
                    className="w-full rounded-2xl border border-[#EBEAEE] bg-[#F8F9FE] pl-12 pr-4 py-3.5 text-sm tracking-widest text-center font-mono font-black text-[#120D26] placeholder-[#747688] focus:border-[#5669FF] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#5669FF]/15 transition shadow-inner"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !otp}
                className="w-full py-3.5 rounded-2xl text-xs font-black text-white bg-[#5669FF] hover:bg-[#4657E5] shadow-lg shadow-[#5669FF]/30 active:scale-95 transition-all flex items-center justify-between px-6 cursor-pointer disabled:opacity-50"
              >
                <span className="flex-1 text-center pl-4">
                  {loading ? "Activating Account..." : "CONFIRM & CLAIM 100 CREDITS"}
                </span>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                  {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                </div>
              </button>

              <div className="flex items-center justify-between text-xs text-[#747688] pt-2 border-t border-[#F0F1F7]">
                <span>Didn't receive the code?</span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className="font-bold text-[#5669FF] hover:underline disabled:text-slate-400 disabled:no-underline transition"
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </form>
          )}

          <div className="text-center text-xs text-[#747688] pt-2 border-t border-[#F0F1F7]">
            Already have an account?{" "}
            <Link href="/login" className="font-black text-[#5669FF] hover:underline">
              Sign in directly
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
