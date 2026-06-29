"use client";

import { useState } from "react";
import { setAvailability } from "@/app/actions/caregiver";
import { getTranslations } from "@/lib/translations";

function toDateInputValue(d: Date | string | null): string {
  if (!d) return "";
  const date = typeof d === "string" ? new Date(d) : d;
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function AvailabilityEditor({
  availabilityStatus,
  engagedFrom,
  engagedTo,
  lang = "en",
}: {
  availabilityStatus: string;
  engagedFrom: Date | string | null;
  engagedTo: Date | string | null;
  lang?: string;
}) {
  const t = getTranslations(lang);
  const [status, setStatus] = useState(availabilityStatus === "engaged" ? "engaged" : "available");

  const tab = (value: "available" | "engaged", label: string) => (
    <button
      type="button"
      onClick={() => setStatus(value)}
      className={`flex-1 rounded-xl px-4 py-3 text-sm font-bold transition-all active:scale-[0.98] ${
        status === value
          ? value === "available"
            ? "bg-green text-white shadow-sm"
            : "bg-coral text-white shadow-sm"
          : "bg-white text-ink-3 border border-line"
      }`}
    >
      {label}
    </button>
  );

  return (
    <section className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
      <div>
        <h2 className="text-lg font-extrabold text-gray-900">{t.set_availability}</h2>
        <p className="mt-0.5 text-sm text-ink-3">{t.availability_help}</p>
      </div>

      <form action={setAvailability} className="flex flex-col gap-4">
        <input type="hidden" name="availabilityStatus" value={status} />
        <div className="flex gap-2.5">
          {tab("available", t.status_available)}
          {tab("engaged", t.status_engaged)}
        </div>

        {status === "engaged" && (
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-ink-3">
              {t.engaged_from}
              <input
                type="date"
                name="engagedFrom"
                defaultValue={toDateInputValue(engagedFrom)}
                className="rounded-xl border border-line px-3 py-3 text-base text-ink"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-ink-3">
              {t.engaged_until}
              <input
                type="date"
                name="engagedTo"
                defaultValue={toDateInputValue(engagedTo)}
                className="rounded-xl border border-line px-3 py-3 text-base text-ink"
              />
            </label>
          </div>
        )}

        <button className="rounded-2xl bg-blue px-4 py-3 text-sm font-bold text-white shadow-sm transition-transform active:scale-[0.98]">
          {t.save}
        </button>
      </form>
    </section>
  );
}
