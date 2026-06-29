"use server";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import { sendOtp, checkOtp } from "@/lib/otp";
import { redirect } from "next/navigation";

const ROLES = ["caregiver", "member", "admin"] as const;

function normalizeRole(rawRole: string): string {
  // Only three roles are valid; anything else falls back to member.
  return (ROLES as readonly string[]).includes(rawRole) ? rawRole : "member";
}

// Step 1: send the OTP to the given phone.
export async function requestOtp(_role: string, phone: string): Promise<{ ok: boolean; error?: string }> {
  const trimmed = phone.trim();
  if (!trimmed) return { ok: false, error: "missing_phone" };
  return sendOtp(trimmed);
}

// Step 2: verify the OTP and create a session. Redirects on success.
export async function verifyOtp(rawRole: string, phone: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const role = normalizeRole(rawRole);
  const trimmed = phone.trim();
  if (!trimmed) return { ok: false, error: "missing_phone" };

  const valid = await checkOtp(trimmed, code);
  if (!valid) return { ok: false, error: "wrong_code" };

  if (role === "caregiver") {
    const cg = await db.caregiver.upsert({ where: { phone: trimmed }, update: {}, create: { phone: trimmed } });
    await createSession("caregiver", cg.id);
    redirect(cg.name ? "/caregiver" : "/caregiver/onboarding/1");
  } else if (role === "admin") {
    const a = await db.admin.upsert({ where: { phone: trimmed }, update: {}, create: { phone: trimmed } });
    await createSession("admin", a.id);
    redirect("/admin");
  } else {
    const m = await db.member.upsert({ where: { phone: trimmed }, update: {}, create: { phone: trimmed } });
    await createSession("member", m.id);
    redirect("/browse");
  }
}

export async function logout() {
  await destroySession();
  redirect("/");
}
