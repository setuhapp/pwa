"use client";

import { useState } from "react";
import { requestOtp, verifyOtp } from "@/app/actions/auth";

export function LoginForm({ role, isDev }: { role: string; isDev: boolean }) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const inputClass =
    "rounded-xl border border-gray-300 px-4 py-4 text-lg tracking-wide outline-none focus:border-blue focus:ring-2 focus:ring-blue/20";

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !phone.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await requestOtp(role, phone.trim());
      if (res.ok) setStep("code");
      else setError("Could not send the code. Please check the number and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function submitCode(value: string) {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await verifyOtp(role, phone.trim(), value);
      // On success the server action redirects; we only get here on failure.
      if (res && !res.ok) {
        if (res.error === "admin_signup_disabled") {
          setError("Administrator signup is disabled in production.");
        } else if (res.error === "role_mismatch") {
          const roleNames: Record<string, string> = {
            caregiver: "Caregiver",
            member: "Family Member",
            admin: "Administrator",
          };
          const name = roleNames[res.existingRole || ""] || "another role";
          setError(`This phone number is already registered as a ${name}. Please log in using the correct portal.`);
        } else {
          setError("Wrong code. Please try again.");
        }
      }
    } catch {
      // NEXT_REDIRECT bubbles up as an error in some runtimes — that's success.
    } finally {
      setBusy(false);
    }
  }

  function handleCodeChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (digits.length === 6) submitCode(digits);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 p-6">
      <h1 className="text-2xl font-bold text-gray-900">Log in as {role}</h1>

      {step === "phone" ? (
        <form onSubmit={handleSendOtp} className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">Mobile number</label>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            autoFocus
            placeholder="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={busy || !phone.trim()}
            className="rounded-xl bg-blue px-4 py-4 text-lg font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Sending…" : "Continue"}
          </button>
          <p className="mt-1 text-center text-xs text-gray-500">
            By continuing, you agree to our{" "}
            <a href="/terms" className="font-bold underline hover:text-blue">
              Terms & Conditions
            </a>.
          </p>
        </form>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); submitCode(code); }} className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-700">
            Enter the code sent to <span className="font-semibold">{phone}</span>
          </label>
          <input
            name="code"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            placeholder="6-digit code"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className={`${inputClass} text-center text-2xl tracking-[0.5em]`}
            maxLength={6}
            required
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={busy || code.length < 4}
            className="rounded-xl bg-blue px-4 py-4 text-lg font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Verifying…" : "Verify & Continue"}
          </button>
          <p className="mt-1 text-center text-xs text-gray-500">
            By continuing, you agree to our{" "}
            <a href="/terms" className="font-bold underline hover:text-blue">
              Terms & Conditions
            </a>.
          </p>
          <button
            type="button"
            onClick={() => { setStep("phone"); setCode(""); setError(null); }}
            className="text-sm text-gray-500 underline mt-2"
          >
            Change number
          </button>
        </form>
      )}

      {isDev && (
        <p className="mt-1 text-sm text-gray-500">Dev mode: any phone number, OTP is 000000.</p>
      )}
      {isDev && role === "member" && (
        <p className="text-blue font-bold text-sm">
          💡 Subscribed member test account (unlocked profiles): 9200000000
        </p>
      )}
    </main>
  );
}
