import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Resolve a stored PDF reference into a browser-fetchable URL.
 * - Full HTTP(S) URLs (e.g. Cloudinary) are returned directly so browsers fetch from CDN.
 * - Legacy local filenames/paths fall back to the internal `/api/getPdf/[file]` route.
 */
export function resolvePdfUrl(pdfValue?: string | null): string {
  if (!pdfValue || typeof pdfValue !== "string") return "";

  const cleaned = pdfValue.trim().replace(/^["']|["']$/g, "").trim();
  if (!cleaned) return "";

  if (/^https?:\/\//i.test(cleaned)) {
    // Upgrade legacy http Cloudinary URLs to https to avoid mixed-content blocks
    if (cleaned.startsWith("http://res.cloudinary.com/")) {
      return "https://" + cleaned.slice("http://".length);
    }
    return cleaned;
  }

  const fileName = cleaned.split("/").pop() || cleaned;
  return `/api/getPdf/${encodeURIComponent(fileName)}`;
}

/**
 * Ensure a clean, OS-safe `.pdf` download filename from a display title.
 */
export function sanitizePdfDownloadName(
  name?: string | null,
  fallback = "template"
): string {
  const withoutExt = (name || "")
    .trim()
    .replace(/\.pdf$/i, "");

  const cleanedStem = withoutExt
    .replace(/[\\/:*?"<>|]+/g, "_")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[\s._-]+|[\s._-]+$/g, "");

  const safeFallback =
    fallback.replace(/\.pdf$/i, "").replace(/[^a-zA-Z0-9_-]/g, "_") || "template";

  return `${cleanedStem || safeFallback}.pdf`;
}

/**
 * Extract a clean `.pdf` filename from a URL or file path (for File objects).
 */
export function getPdfFileNameFromUrl(
  urlOrPath?: string | null,
  fallback = "template"
): string {
  if (!urlOrPath) return sanitizePdfDownloadName(fallback, fallback);

  const withoutQueryOrHash = urlOrPath.split("?")[0].split("#")[0];
  const rawSegment = withoutQueryOrHash.split("/").pop() || fallback;

  let decoded = rawSegment;
  try {
    decoded = decodeURIComponent(rawSegment);
  } catch {
    // Keep raw segment if malformed percent-encoding
  }

  return sanitizePdfDownloadName(decoded, fallback);
}

