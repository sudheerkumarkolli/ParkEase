"use client";

import React, { useState, useEffect } from "react";
import { WalletTransaction, Payment } from "@/types";
import { api } from "@/lib/api";
import Sidebar from "@/components/ui/Sidebar";
import { formatDateTime, formatINR } from "@/lib/utils";
import { CreditCard, TrendingUp, TrendingDown, History } from "lucide-react";

export default function AdminTransactionsPage() {
  const [data, setData] = useState<{
    wallet_transactions: WalletTransaction[];
    payment_purchases: Payment[];
  }>({ wallet_transactions: [], payment_purchases: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"wallet" | "purchases">("wallet");

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/transactions?limit=100");
      setData(res.data);
    } catch (err) {
      console.error("Failed to load admin transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl">
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-purple-400" />
              Financials & Ledger Audit
            </h1>
            <p className="text-xs text-slate-500">
              Audit credit top-up purchases, Razorpay-style gateway receipts, and booking credit settlements
            </p>
          </div>

          <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 text-xs shadow-sm">
            <button
              onClick={() => setTab("wallet")}
              className={`px-4 py-1.5 rounded-xl font-bold transition ${
                tab === "wallet" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Wallet Transactions ({data.wallet_transactions.length})
            </button>
            <button
              onClick={() => setTab("purchases")}
              className={`px-4 py-1.5 rounded-xl font-bold transition ${
                tab === "purchases" ? "bg-purple-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Gateway Top-ups ({data.payment_purchases.length})
            </button>
          </div>
        </div>

        {tab === "wallet" ? (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading ledger...</div>
            ) : data.wallet_transactions.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">No wallet transactions logged.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-4">Tx ID</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Credits</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.wallet_transactions.map((tx) => {
                      const isCredit = tx.credits > 0;
                      return (
                        <tr key={tx.id} className="hover:bg-slate-50 transition">
                          <td className="p-4">
                            <span className="inline-block px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 font-mono font-black text-xs">
                              #TX-{tx.id}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-800">
                              {tx.type}
                            </span>
                          </td>
                          <td className="p-4 text-slate-700 max-w-sm">
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
                                isCredit ? "text-emerald-700" : "text-rose-700"
                              }`}
                            >
                              {isCredit ? `+${tx.credits}` : tx.credits} Cr
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              {tx.status}
                            </span>
                          </td>
                          <td className="p-4 text-right text-slate-700 text-[11px] font-mono">
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
        ) : (
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500">Loading payments...</div>
            ) : data.payment_purchases.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500">No payment receipts logged.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-slate-200 bg-slate-50 text-slate-700 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="p-4">Gateway Tx ID</th>
                      <th className="p-4">Package</th>
                      <th className="p-4">Credits Added</th>
                      <th className="p-4">Amount Paid</th>
                      <th className="p-4">Method</th>
                      <th className="p-4 text-right">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.payment_purchases.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50 transition">
                        <td className="p-4 font-mono font-bold text-purple-700">{pay.transaction_id}</td>
                        <td className="p-4 font-bold text-slate-900">{pay.package_name}</td>
                        <td className="p-4 font-black text-emerald-700">+{pay.credits} Cr</td>
                        <td className="p-4 font-black text-slate-900">{formatINR(pay.amount)}</td>
                        <td className="p-4 text-slate-700 font-mono text-[11px]">
                          {pay.payment_method}
                        </td>
                        <td className="p-4 text-right text-slate-700 text-[11px] font-mono">
                          {formatDateTime(pay.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
