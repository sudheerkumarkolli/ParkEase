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
    case "COMPLETED":
    case "APPROVED":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    case "UPCOMING":
    case "RESERVED":
    case "PENDING":
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
    case "OCCUPIED":
    case "CANCELLED":
    case "EXPIRED":
    case "INACTIVE":
      return "bg-rose-500/10 text-rose-400 border-rose-500/30";
    case "MAINTENANCE":
      return "bg-zinc-500/10 text-zinc-400 border-zinc-500/30";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/30";
  }
}

export function getErrorMessage(err: any, fallback = "An unexpected error occurred"): string {
  if (!err) return fallback;
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
