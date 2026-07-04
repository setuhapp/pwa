"use client";

import { useState } from "react";
import { updateCaregiverSummary } from "@/app/actions/admin";

export function AdminSummaryEditor({
  caregiverId,
  summary,
}: {
  caregiverId: string;
  summary: string | null;
}) {
  const [value, setValue] = useState(summary ?? "");
  const [saved, setSaved] = useState<string>(summary ?? "");
  const [busy, setBusy] = useState(false);

  const dirty = value !== saved;

  async function handleSave() {
    if (busy || !dirty) return;
    setBusy(true);
    try {
      await updateCaregiverSummary(caregiverId, value.trim());
      setSaved(value.trim());
      setValue(value.trim());
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex w-72 flex-col gap-1.5">
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={2}
        placeholder="Polished summary (trait-led, ~2 lines)…"
        className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-800 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
      />
      <button
        onClick={handleSave}
        disabled={busy || !dirty}
        className="self-start rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white transition disabled:opacity-40"
      >
        {busy ? "Saving…" : dirty ? "Save" : "Saved"}
      </button>
    </div>
  );
}
