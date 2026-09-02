"use client";

import React from "react";
import { useNotifications } from "@/context/NotificationContext";
import Sidebar from "@/components/ui/Sidebar";
import { formatDateTime } from "@/lib/utils";
import { Bell, CheckCheck, Check, Clock } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#F8F9FE]">
      <Sidebar type="user" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
        
        <div className="flex items-center justify-between border-b border-[#EBEAEE] pb-4">
          <div>
            <h1 className="text-2xl font-black text-[#120D26] flex items-center gap-2">
              <Bell className="h-6 w-6 text-[#5669FF]" />
              Notifications
            </h1>
            <p className="text-xs text-[#747688] font-medium">
              System alerts, booking confirmations, entry/exit logs, and wallet credits
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-black text-[#5669FF] bg-[#5669FF]/10 border border-[#5669FF]/20 hover:bg-[#5669FF]/20 transition cursor-pointer"
            >
              <CheckCheck className="h-4 w-4" />
              <span>Mark All as Read</span>
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-[#747688] font-medium">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border-2 border-dashed border-[#EBEAEE] bg-white space-y-2">
              <Bell className="h-8 w-8 text-[#747688] mx-auto mb-2" />
              <h4 className="text-sm font-black text-[#120D26]">No notifications</h4>
              <p className="text-xs text-[#747688]">You&apos;re all caught up!</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  if (!n.is_read) markAsRead(n.id);
                }}
                className={`relative flex items-start justify-between p-5 rounded-3xl border transition-all cursor-pointer ${
                  n.is_read
                    ? "bg-white border-[#EBEAEE] shadow-[0_4px_20px_rgba(86,105,255,0.03)] opacity-85"
                    : "bg-white border-[#5669FF]/40 shadow-[0_10px_30px_rgba(86,105,255,0.08)] ring-2 ring-[#5669FF]/10"
                }`}
              >
                <div className="space-y-1.5 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-[#120D26]">{n.title}</span>
                    {!n.is_read && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black bg-indigo-100 text-indigo-700">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">{n.message}</p>
                  <div className="flex items-center gap-1 text-[11px] text-[#747688] pt-0.5 font-medium">
                    <Clock className="h-3.5 w-3.5 text-[#5669FF]" />
                    <span>{formatDateTime(n.created_at)}</span>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(n.id);
                    }}
                    className="p-2 rounded-xl bg-[#F0F1F7] hover:bg-[#5669FF] hover:text-white text-[#5669FF] transition cursor-pointer"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}

