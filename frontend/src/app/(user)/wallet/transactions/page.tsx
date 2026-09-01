"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { WalletTransaction } from "@/types";
import { api } from "@/lib/api";
import { formatDateTime, getStatusBadgeClass } from "@/lib/utils";
import Sidebar from "@/components/ui/Sidebar";
import {
  History,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Filter,
  CreditCard,
  Sparkles,
} from "lucide-react";

export default function TransactionsLedgerPage() {
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("ALL");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const url = typeFilter === "ALL" ? "/wallet/transactions" : `/wallet/transactions?tx_type=${typeFilter}`;
      const res = await api.get<WalletTransaction[]>(url);
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="user" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/wallet"
              className="p-2 rounded-xl bg-white border border-slate-100 text-slate-500 hover:text-white transition"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Wallet Transaction Ledger</h1>
              <p className="text-xs text-slate-500">Complete immutable record of credits added, used, and refunded</p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1 bg-white p-1 rounded-2xl border border-slate-100 text-xs">
            {[
              { id: "ALL", label: "All Records" },
              { id: "WELCOME_CREDIT", label: "Welcome Bonus" },
              { id: "CREDIT_PURCHASE", label: "Purchases" },
              { id: "BOOKING_PAYMENT", label: "Payments" },
              { id: "BOOKING_REFUND", label: "Refunds" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                  typeFilter === f.id
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-500 hover:text-white"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white/60 backdrop-blur-xl shadow-xl">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading ledger...</div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No transactions matching the selected type.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-950/70 text-slate-500 uppercase font-semibold text-[10px]">
                  <tr>
                    <th className="p-4">Transaction ID</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Description / Reference</th>
                    <th className="p-4">Credits</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {transactions.map((tx) => {
                    const isCredit = tx.credits > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/30 transition">
                        <td className="p-4 font-mono font-bold text-white">#TX-{tx.id}</td>
                        <td className="p-4">
                          <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-100 text-slate-600">
                            {tx.type}
                          </span>
                        </td>
                        <td className="p-4 text-slate-600">
                          <div className="font-medium">{tx.description}</div>
                          {tx.reference_id && (
                            <span className="text-[10px] text-slate-500 font-mono">
                              Ref: {tx.reference_id}
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <span
                            className={`font-black text-sm ${
                              isCredit ? "text-emerald-400" : "text-rose-400"
                            }`}
                          >
                            {isCredit ? `+${tx.credits}` : tx.credits} Cr
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-4 text-right text-slate-500 text-[11px]">
                          {formatDateTime(tx.created_at)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
