import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(dateStr: string | Date | undefined): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatDate(dateStr: string | Date | undefined): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getStatusBadgeClass(status: string): string {
  switch (status?.toUpperCase()) {
    case "AVAILABLE":
    case "ACTIVE":
    case "APPROVED":
      return "bg-emerald-100 text-emerald-800 border-emerald-300 font-bold";
    case "COMPLETED":
      return "bg-purple-100 text-purple-800 border-purple-300 font-bold";
    case "UPCOMING":
    case "RESERVED":
    case "PENDING":
      return "bg-amber-100 text-amber-900 border-amber-300 font-bold";
    case "OCCUPIED":
    case "CANCELLED":
    case "EXPIRED":
    case "INACTIVE":
      return "bg-rose-100 text-rose-800 border-rose-300 font-bold";
    case "MAINTENANCE":
      return "bg-slate-200 text-slate-800 border-slate-300 font-bold";
    default:
      return "bg-slate-100 text-slate-700 border-slate-300 font-bold";
  }
}

export function getErrorMessage(err: any, fallback = "An unexpected error occurred"): string {
  if (!err) return fallback;
  if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
    return "Unable to connect to backend server. Please verify the backend service is running on port 8000.";
  }
  const detail = err.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => d?.msg || d?.message || JSON.stringify(d)).join(". ");
  }
  if (typeof detail === "object" && detail !== null) {
    return detail.msg || detail.message || JSON.stringify(detail);
  }
  return err.message || fallback;
}

