import { getTranslations } from "@/lib/translations";

// Minimal structural shape — works for both full Caregiver and PublicCaregiver,
// since availability fields are never stripped by the serializers. engagedTo may
// arrive as a string when the object has crossed a server-action boundary.
export type AvailabilityShape = {
  availabilityStatus: string;
  engagedTo: Date | string | null;
};

function engagedToDate(cg: AvailabilityShape): Date | null {
  if (!cg.engagedTo) return null;
  const d = cg.engagedTo instanceof Date ? cg.engagedTo : new Date(cg.engagedTo);
  return Number.isNaN(d.getTime()) ? null : d;
}

// A caregiver counts as available now if they marked themselves available, or if
// their current engagement's end date has already passed (they forgot to flip back).
export function isAvailableNow(cg: AvailabilityShape, now: Date = new Date()): boolean {
  if (cg.availabilityStatus === "available") return true;
  const to = engagedToDate(cg);
  return to != null && to < now;
}

export function formatShortDate(d: Date, lang: string): string {
  return new Intl.DateTimeFormat(lang === "ta" ? "ta-IN" : "en-IN", {
    day: "numeric",
    month: "short",
  }).format(d);
}

// Returns a display badge: green "Available", or "Available from <date>" / "Engaged".
export function availabilityLabel(
  cg: AvailabilityShape,
  lang: string
): { available: boolean; text: string } {
  const t = getTranslations(lang);
  if (isAvailableNow(cg)) return { available: true, text: t.status_available };
  const to = engagedToDate(cg);
  if (to) {
    return { available: false, text: `${t.available_from} ${formatShortDate(to, lang)}` };
  }
  return { available: false, text: t.status_engaged };
}
