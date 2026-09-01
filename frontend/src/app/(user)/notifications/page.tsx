"use client";

import React from "react";
import { useNotifications } from "@/context/NotificationContext";
import Sidebar from "@/components/ui/Sidebar";
import { formatDateTime } from "@/lib/utils";
import { Bell, CheckCheck, Check, Sparkles, AlertCircle, Clock } from "lucide-react";

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar type="user" />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
        
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
              <Bell className="h-6 w-6 text-emerald-400" />
              Notifications
            </h1>
            <p className="text-xs text-slate-500">
              System alerts, booking confirmations, entry/exit logs, and wallet credits
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition"
            >
              <CheckCheck className="h-4 w-4" />
              Mark All as Read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-slate-100 bg-white/30 space-y-2">
              <Bell className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No notifications</h4>
              <p className="text-xs text-slate-500">You're all caught up!</p>
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
                    ? "bg-white/40 border-slate-100/80 text-slate-500"
                    : "bg-gradient-to-r from-emerald-950/20 via-slate-900/90 to-slate-900 border-emerald-500/30 text-slate-200 shadow-lg shadow-emerald-500/5"
                }`}
              >
                <div className="space-y-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{n.title}</span>
                    {!n.is_read && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 pt-1 font-mono">
                    <Clock className="h-3 w-3" />
                    <span>{formatDateTime(n.created_at)}</span>
                  </div>
                </div>

                {!n.is_read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(n.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-950 border border-slate-100 text-emerald-400 hover:bg-emerald-500/20 text-xs"
                    title="Mark as read"
                  >
                    <Check className="h-3.5 w-3.5" />
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
