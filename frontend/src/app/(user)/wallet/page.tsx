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
  Plus,
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
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#F8F9FE]">
      <Sidebar type="user" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl">
        
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#EBEAEE] pb-4">
          <div>
            <h1 className="text-2xl font-black text-[#120D26] flex items-center gap-2">
              <WalletIcon className="h-6 w-6 text-[#5669FF]" />
              ParkEase Credits & Wallet
            </h1>
            <p className="text-xs text-[#747688] font-medium">
              Zero-friction touchless parking currency with auto-lock and instant refund guarantees
            </p>
          </div>

          <Link
            href="/wallet/transactions"
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold text-[#120D26] bg-white border border-[#EBEAEE] hover:bg-[#F0F1F7] shadow-sm transition"
          >
            <History className="h-4 w-4 text-[#5669FF]" />
            <span>Transaction Ledger</span>
          </Link>
        </div>

        {/* Balance Hero Card (EventHub VIP Card Style) */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5669FF] via-[#4E62F5] to-[#3D50E0] p-6 sm:p-8 shadow-xl shadow-[#5669FF]/20 text-white">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
            
            <div className="space-y-2">
              <span className="text-xs font-extrabold uppercase tracking-widest text-white/80">
                Available Wallet Balance
              </span>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl sm:text-5xl font-black text-white">
                  {user?.wallet_balance ?? wallet?.balance ?? 0}
                </span>
                <span className="text-lg font-bold text-white/90">Credits (₹{user?.wallet_balance ?? wallet?.balance ?? 0})</span>
              </div>
              <p className="text-xs text-white/80 font-medium">
                1 Credit = ₹1 utility value · Automatically deducted at slot reservation confirmation
              </p>
            </div>

            <div className="flex flex-col sm:items-end gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-white font-black bg-white/20 px-3.5 py-1.5 rounded-full border border-white/25 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5" />
                <span>100 Welcome Credits Activated</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/80 text-[11px] font-medium">
                <ShieldCheck className="h-3.5 w-3.5 text-[#29D697]" />
                <span>Instant 100% refund on cancellations</span>
              </div>
            </div>
          </div>

          <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-white/10 blur-xl pointer-events-none" />
        </div>

        {/* Credit Packages Section */}
        <CreditPackages
          packages={packages}
          onPurchaseSuccess={loadWalletData}
          onBuyPackage={handleBuyPackage}
        />

        {/* Recent Transactions List */}
        <div className="space-y-4 pt-4 border-t border-[#EBEAEE]">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#120D26]">Recent Wallet Activity</h3>
            <Link
              href="/wallet/transactions"
              className="text-xs font-bold text-[#5669FF] hover:underline flex items-center gap-1"
            >
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#EBEAEE] bg-white shadow-[0_10px_30px_rgba(86,105,255,0.04)]">
            {wallet?.recent_transactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#747688]">
                No recent transactions recorded.
              </div>
            ) : (
              <div className="divide-y divide-[#F0F1F7]">
                {wallet?.recent_transactions.map((tx) => {
                  const isCredit = tx.credits > 0;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 hover:bg-[#F0F1F7]/50 transition text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-2xl ${
                            isCredit
                              ? "bg-[#29D697]/15 text-[#29D697]"
                              : "bg-[#F0635A]/15 text-[#F0635A]"
                          }`}
                        >
                          {isCredit ? (
                            <TrendingUp className="h-4 w-4" />
                          ) : (
                            <TrendingDown className="h-4 w-4" />
                          )}
                        </div>
                        <div>
                          <div className="font-black text-[#120D26]">{tx.description}</div>
                          <div className="text-[11px] text-[#747688] font-mono">
                            {formatDateTime(tx.created_at)} · Ref: {tx.reference_id || `TXN-${tx.id}`}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div
                          className={`font-mono font-black text-sm ${
                            isCredit ? "text-[#29D697]" : "text-[#F0635A]"
                          }`}
                        >
                          {isCredit ? `+${tx.credits}` : tx.credits} Cr
                        </div>
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black border ${getStatusBadgeClass(
                            tx.status
                          )}`}
                        >
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
