import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function money(v: number | string | undefined | null) {
  const n = typeof v === "number" ? v : Number(v ?? 0);
  return (Number.isFinite(n) ? n : 0).toFixed(2);
}

export function uid(prefix = "id") {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
