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
export async function verifyOtp(rawRole: string, phone: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const trimmed = phone.trim();
  if (!trimmed) return { ok: false, error: "missing_phone" };

  const valid = await checkOtp(trimmed, code);
  if (!valid) return { ok: false, error: "wrong_code" };

  const role = normalizeRole(rawRole);

  // 1. Try to find the user in the selected role table first (takes 1 query for correct route logins).
  let userId = "";
  let activeRole = role;
  let caregiverName: string | null = null;

  if (role === "caregiver") {
    const cg = await db.caregiver.findUnique({ where: { phone: trimmed } });
    if (cg) {
      userId = cg.id;
      caregiverName = cg.name;
    }
  } else if (role === "admin") {
    const a = await db.admin.findUnique({ where: { phone: trimmed } });
    if (a) {
      userId = a.id;
    }
  } else {
    const m = await db.member.findUnique({ where: { phone: trimmed } });
    if (m) {
      userId = m.id;
    }
  }

  // 2. If not found in the selected table, check the other tables for an existing sticky role.
  if (!userId) {
    if (role !== "caregiver") {
      const cg = await db.caregiver.findUnique({ where: { phone: trimmed } });
      if (cg) {
        userId = cg.id;
        activeRole = "caregiver";
        caregiverName = cg.name;
      }
    }
    if (!userId && role !== "admin") {
      const a = await db.admin.findUnique({ where: { phone: trimmed } });
      if (a) {
        userId = a.id;
        activeRole = "admin";
      }
    }
    if (!userId && role !== "member") {
      const m = await db.member.findUnique({ where: { phone: trimmed } });
      if (m) {
        userId = m.id;
        activeRole = "member";
      }
    }
  }

  // 3. If still not found anywhere, this is a new signup under the selected role.
  if (!userId) {
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

  // 4. Authenticate and redirect based on the resolved existing sticky role.
  await createSession(activeRole, userId);
  if (activeRole === "caregiver") {
    redirect(caregiverName ? "/caregiver" : "/caregiver/onboarding/1");
  } else if (activeRole === "admin") {
    redirect("/admin");
  } else {
    redirect("/browse");
  }
}

export async function logout() {
  await destroySession();
  redirect("/");
}
