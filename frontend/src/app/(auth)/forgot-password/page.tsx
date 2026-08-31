"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Mail, ArrowRight, KeyRound, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/forgot-password", { email });
      setSubmitted(true);
      if (res.data.dev_token) {
        setDevToken(res.data.dev_token);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400 shadow-lg">
            <KeyRound className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Reset Password</h2>
          <p className="text-xs text-slate-400">
            Enter your email to receive a secure password reset token
          </p>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-5">
          {submitted ? (
            <div className="space-y-4 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 mx-auto">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-xs text-slate-300">
                Password reset token generated!
              </p>
              {devToken && (
                <div className="p-3 rounded-2xl bg-slate-950 border border-emerald-500/30 text-xs">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                    Development Reset Token:
                  </span>
                  <span className="font-mono font-bold text-white text-sm">{devToken}</span>
                </div>
              )}
              <Link
                href={`/reset-password?email=${encodeURIComponent(email)}&token=${encodeURIComponent(devToken || "")}`}
                className="block w-full text-center rounded-2xl bg-emerald-500 py-3 text-xs font-bold text-slate-950 hover:bg-emerald-400 transition"
              >
                Proceed to Reset Password
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-2xl border border-slate-800 bg-slate-950/90 pl-10 pr-4 py-3 text-xs text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-300 py-3.5 text-xs font-extrabold text-slate-950 hover:from-emerald-300 transition active:scale-95 disabled:opacity-50"
              >
                {loading ? "Generating Token..." : "Request Reset Token"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          <div className="text-center text-xs text-slate-400 pt-2">
            Remembered your password?{" "}
            <Link href="/login" className="font-bold text-emerald-400 hover:underline">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
