import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Get the base URL for static files (without /api suffix)
export function getStaticBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "http://localhost:8080";
  const trimmed = String(raw).replace(/\/$/, "");
  // Remove /api suffix if present for static files
  return trimmed.endsWith("/api") ? trimmed.replace("/api", "") : trimmed;
}

// Get the API base URL (with /api suffix)
export function getApiBaseUrl() {
  const raw = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "http://localhost:8080";
  const trimmed = String(raw).replace(/\/$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}
