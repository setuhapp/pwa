"use client";

import { useState } from "react";
import { requestOtp, verifyOtp, signupFamilyAction, loginFamilyAction } from "@/app/actions/auth";

export function LoginForm({ role, isDev }: { role: string; isDev: boolean }) {
  // Family Auth Mode
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Caregiver OTP Mode
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const inputClass =
    "rounded-xl border border-gray-300 px-4 py-4 text-lg tracking-wide outline-none focus:border-blue focus:ring-2 focus:ring-blue/20 text-gray-900";

  // --- Caregiver & Admin OTP Flow ---
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !phone.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await requestOtp(role, phone.trim());
      if (res.ok) setStep("code");
      else setError(res.error === "otp_disabled_for_members" ? "Families must log in with Email & Password." : "Could not send the code. Please check the number and try again.");
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
      if (res && !res.ok) {
        if (res.error === "admin_signup_disabled") {
          setError("Administrator signup is disabled in production.");
        } else if (res.error === "family_no_otp" || res.error === "member_otp_disabled") {
          setError("Families must sign up/log in with Email & Password.");
        } else {
          setError("Wrong code. Please try again.");
        }
      }
    } catch {
      // NEXT_REDIRECT bubbles up as an error in Next.js — that's a successful redirect.
    } finally {
      setBusy(false);
    }
  }

  function handleCodeChange(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    if (digits.length === 6) submitCode(digits);
  }

  // --- Family Member Email/Password Flow ---
  async function handleFamilyLogin(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await loginFamilyAction(email, password);
      if (res && !res.ok) {
        if (res.error === "missing_fields") {
          setError("Please fill in all fields.");
        } else if (res.error === "invalid_credentials") {
          setError("Invalid email or password.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      }
    } catch {
      // Successful redirect
    } finally {
      setBusy(false);
    }
  }

  async function handleFamilySignup(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await signupFamilyAction(name, email, password, phone);
      if (res && !res.ok) {
        if (res.error === "missing_fields") {
          setError("Please fill in all fields.");
        } else if (res.error === "phone_already_registered") {
          setError("This phone number is already registered under another account.");
        } else if (res.error === "email_already_registered") {
          setError("This email is already registered.");
        } else {
          setError("Something went wrong. Please try again.");
        }
      }
    } catch {
      // Successful redirect
    } finally {
      setBusy(false);
    }
  }

  if (role === "member") {
    // --- Family Member Email/Password View ---
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 p-6 select-none">
        <div className="text-center mb-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {authMode === "login" ? "Family Sign In" : "Create Family Account"}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {authMode === "login"
              ? "Access Chennai's top trait-led caregiver database."
              : "Sign up to find dementia & elderly care attenders."}
          </p>
        </div>

        {authMode === "login" ? (
          /* Login Form */
          <form onSubmit={handleFamilyLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="rounded-2xl bg-gradient-to-r from-[#dca334] to-[#c29d53] px-4 py-4 text-lg font-extrabold text-white shadow-lg shadow-amber-600/30 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50 mt-2 cursor-pointer"
            >
              {busy ? "Signing In…" : "Sign In"}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setError(null);
                }}
                className="text-sm text-blue hover:underline font-semibold"
              >
                Don't have an account? Sign up
              </button>
            </div>
          </form>
        ) : (
          /* Signup Form */
          <form onSubmit={handleFamilySignup} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Mobile Phone Number</label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                required
              />
            </div>

            {error && <p className="text-red-600 text-sm font-medium">{error}</p>}

            <button
              type="submit"
              disabled={busy}
              className="rounded-2xl bg-gradient-to-r from-[#dca334] to-[#c29d53] px-4 py-4 text-lg font-extrabold text-white shadow-lg shadow-amber-600/30 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50 mt-2 cursor-pointer"
            >
              {busy ? "Creating Account…" : "Create Account"}
            </button>

            <div className="text-center mt-3">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setError(null);
                }}
                className="text-sm text-blue hover:underline font-semibold"
              >
                Already have an account? Log in
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-xs text-gray-400 mt-4 leading-relaxed">
          By signing up, you agree to our{" "}
          <a href="/terms" className="font-bold underline hover:text-blue">
            Terms & Conditions
          </a>.
        </p>
      </main>
    );
  }

  // --- Caregiver & Admin OTP View ---
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-5 p-6">
      <h1 className="text-2xl font-bold text-gray-900 capitalize">Log in as {role}</h1>

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
            className="rounded-xl bg-gradient-to-r from-[#dca334] to-[#c29d53] px-4 py-4 text-lg font-extrabold text-white shadow-lg shadow-amber-600/30 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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
            className="rounded-xl bg-gradient-to-r from-[#dca334] to-[#c29d53] px-4 py-4 text-lg font-extrabold text-white shadow-lg shadow-amber-600/30 transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
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
    </main>
  );
}
