import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationProvider } from "@/context/NotificationContext";
import Navbar from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: "ParkEase - Find. Reserve. Park. | Smart Parking System",
  description:
    "Discover available parking spaces in real-time, reserve your spot before arrival, and enter seamlessly with QR verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500/30 selection:text-emerald-900">
        <AuthProvider>
          <NotificationProvider>
            <div className="flex min-h-screen flex-col justify-between">
              <Navbar />
              <main className="flex-1">{children}</main>
              
              {/* Footer */}
              <footer className="border-t border-slate-200 bg-white py-10 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
                <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 tracking-tight">
                      Park<span className="text-emerald-600">Ease</span>
                    </span>
                    <span>&copy; 2026 ParkEase Technologies Inc. All rights reserved.</span>
                  </div>
                  <div className="flex items-center gap-6 text-slate-500">
                    <span className="hover:text-emerald-600 transition cursor-pointer">Privacy Policy</span>
                    <span className="hover:text-emerald-600 transition cursor-pointer">Terms of Service</span>
                    <span className="hover:text-emerald-600 transition cursor-pointer">Support</span>
                    <span className="text-emerald-600 font-mono text-[11px]">System Online 🟢</span>
                  </div>
                </div>
              </footer>
            </div>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
