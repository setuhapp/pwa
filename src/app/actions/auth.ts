"use server";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import { sendOtp, checkOtp } from "@/lib/otp";
import { redirect } from "next/navigation";

const ROLES = ["caregiver", "member", "admin"] as const;

function normalizeRole(rawRole: string): "caregiver" | "member" | "admin" {
  // Only three roles are valid; anything else falls back to member.
  return (ROLES as readonly string[]).includes(rawRole) ? (rawRole as "caregiver" | "member" | "admin") : "member";
}

// Step 1: send the OTP to the given phone.
export async function requestOtp(_role: string, phone: string): Promise<{ ok: boolean; error?: string }> {
  const trimmed = phone.trim();
  if (!trimmed) return { ok: false, error: "missing_phone" };
  return sendOtp(trimmed);
}

// Step 2: verify the OTP and create a session. Redirects on success.
export async function verifyOtp(rawRole: string, phone: string, code: string): Promise<{ ok: boolean; error?: string; existingRole?: string }> {
  const trimmed = phone.trim();
  if (!trimmed) return { ok: false, error: "missing_phone" };

  const valid = await checkOtp(trimmed, code);
  if (!valid) return { ok: false, error: "wrong_code" };

  const role = normalizeRole(rawRole);

  // 1. Fetch user status across all roles in parallel
  const [admin, caregiver, member] = await Promise.all([
    db.admin.findUnique({ where: { phone: trimmed } }),
    db.caregiver.findUnique({ where: { phone: trimmed } }),
    db.member.findUnique({ where: { phone: trimmed } }),
  ]);

  const existingRole = admin ? "admin" : caregiver ? "caregiver" : member ? "member" : null;
  const existingUser = admin || caregiver || member;

  // 2. If user exists, enforce strict role matching
  if (existingUser && existingRole) {
    if (existingRole !== role) {
      return { ok: false, error: "role_mismatch", existingRole };
    }
    
    // Valid login: Create session and redirect
    await createSession(existingRole, existingUser.id);
    if (existingRole === "admin") {
      redirect("/admin");
    } else if (existingRole === "caregiver") {
      redirect(caregiver?.name ? "/caregiver" : "/caregiver/onboarding/1");
    } else {
      redirect("/browse");
    }
  }

  // 3. New Signup (does not exist under any role)
  if (role === "admin") {
    if (process.env.NODE_ENV === "production") {
      return { ok: false, error: "admin_signup_disabled" };
    }
    const a = await db.admin.create({ data: { phone: trimmed } });
    await createSession("admin", a.id);
    redirect("/admin");
  } else if (role === "caregiver") {
    const cg = await db.caregiver.create({ data: { phone: trimmed } });
    await createSession("caregiver", cg.id);
    redirect("/caregiver/onboarding/1");
  } else {
    const m = await db.member.create({ data: { phone: trimmed } });
    await createSession("member", m.id);
    redirect("/browse");
  }
}

export async function logout() {
  await destroySession();
  redirect("/");
}
