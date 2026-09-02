"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/ui/Sidebar";
import Link from "next/link";
import { Shield, Building2, ArrowRight, LayoutDashboard } from "lucide-react";

export default function AdminBookingsPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#F8F9FE]">
      <Sidebar type="admin" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl">
        <div className="border-b border-[#EBEAEE] pb-4">
          <h1 className="text-2xl font-black text-[#120D26] flex items-center gap-2">
            <Shield className="h-6 w-6 text-purple-600" />
            Facility Operations & Pass Management
          </h1>
          <p className="text-xs text-[#747688] font-medium">
            System administration scope & operational authority
          </p>
        </div>

        <div className="rounded-3xl border border-[#EBEAEE] bg-white p-8 shadow-[0_10px_30px_rgba(86,105,255,0.05)] text-center space-y-5 max-w-2xl mx-auto my-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-100 text-purple-700">
            <Building2 className="h-8 w-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-[#120D26]">
              Facility Manager Domain
            </h2>
            <p className="text-xs text-[#747688] leading-relaxed font-medium">
              Individual driver passes (Pass ID, Vehicle Plate, Duration, Status, Entry/Exit logs) are managed directly by **Facility Hub Managers** at their respective parking locations.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs transition shadow-md shadow-purple-600/25"
            >
              <LayoutDashboard className="h-4 w-4" />
              <span>Master Dashboard</span>
            </Link>
            <Link
              href="/admin/parking"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#F0F1F7] hover:bg-[#EBEAEE] text-[#120D26] font-bold text-xs transition"
            >
              <Building2 className="h-4 w-4 text-purple-600" />
              <span>Facility Approvals</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
