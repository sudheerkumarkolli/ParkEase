"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Wallet, CreditPackage, WalletTransaction } from "@/types";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import CreditPackages from "@/components/wallet/CreditPackages";
import { formatDateTime, getStatusBadgeClass } from "@/lib/utils";
import {
  Wallet as WalletIcon,
  Coins,
  History,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

export default function WalletPage() {
  const { user, refreshUser } = useAuth();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [packages, setPackages] = useState<CreditPackage[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const [wRes, pRes] = await Promise.all([
        api.get<Wallet>("/wallet"),
        api.get<CreditPackage[]>("/wallet/packages"),
      ]);
      setWallet(wRes.data);
      setPackages(pRes.data);
    } catch (err) {
      console.error("Wallet load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWalletData();
  }, []);

  const handleBuyPackage = async (packageName: string, paymentMethod: string) => {
    await api.post("/wallet/add-credits", {
      package_name: packageName,
      payment_method: paymentMethod,
    });
    await refreshUser();
    await loadWalletData();
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="user" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl">
        
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <WalletIcon className="h-6 w-6 text-emerald-400" />
              ParkEase Credits & Wallet
            </h1>
            <p className="text-xs text-slate-400">
              Zero-friction touchless parking currency with auto-lock and refund guarantees
            </p>
          </div>

          <Link
            href="/wallet/transactions"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:bg-slate-800 transition"
          >
            <History className="h-4 w-4 text-emerald-400" />
            Full Transaction Ledger
          </Link>
        </div>

        {/* Balance Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/40 p-6 sm:p-8 backdrop-blur-2xl shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-400">
                Active Available Balance
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black text-white">
                  {user?.wallet_balance ?? wallet?.balance ?? 0}
                </span>
                <span className="text-lg font-bold text-emerald-400">Credits</span>
              </div>
              <p className="text-xs text-slate-300">
                1 Credit = ₹1 value · Automatically deducted at slot reservation confirmation
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-300 font-semibold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                <Sparkles className="h-3.5 w-3.5" />
                <span>100 Welcome Credits Activated</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Full instant refund upon cancellation prior to start</span>
              </div>
            </div>
          </div>
        </div>

        {/* Credit Packages Section */}
        <CreditPackages
          packages={packages}
          onPurchaseSuccess={loadWalletData}
          onBuyPackage={handleBuyPackage}
        />

        {/* Recent Transactions List */}
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Transactions</h3>
            <Link
              href="/wallet/transactions"
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl">
            {wallet?.recent_transactions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No recent transactions found.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {wallet?.recent_transactions.map((tx) => {
                  const isCredit = tx.credits > 0;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-800/30 transition text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                            isCredit
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-rose-500/20 text-rose-400"
                          }`}
                        >
                          {isCredit ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-200">{tx.description || tx.type}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Ref: {tx.reference_id || "TX-DIRECT"} · {formatDateTime(tx.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`text-sm font-extrabold ${
                            isCredit ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isCredit ? `+${tx.credits}` : tx.credits} Credits
                        </span>
                        <span className="block text-[10px] uppercase font-bold text-slate-500">
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
