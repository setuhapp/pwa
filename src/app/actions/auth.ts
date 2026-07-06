"use server";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import { sendOtp, checkOtp } from "@/lib/otp";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/crypto";

const ROLES = ["caregiver", "member", "admin"] as const;

function normalizeRole(rawRole: string): "caregiver" | "member" | "admin" {
  // Only three roles are valid; anything else falls back to member.
  return (ROLES as readonly string[]).includes(rawRole) ? (rawRole as "caregiver" | "member" | "admin") : "member";
}

// Step 1: send the OTP to the given phone.
export async function requestOtp(role: string, phone: string): Promise<{ ok: boolean; error?: string }> {
  const trimmed = phone.trim();
  if (!trimmed) return { ok: false, error: "missing_phone" };

  // OTP is only allowed for Caregivers and Admins
  const targetRole = normalizeRole(role);
  if (targetRole === "member") {
    return { ok: false, error: "otp_disabled_for_members" };
  }

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

  // 2. If user already exists in ANY table, authenticate under their registered role and redirect
  // Note: Members must log in with email/password, so if they try OTP we block it.
  if (admin) {
    await createSession("admin", admin.id);
    redirect("/admin");
  } else if (caregiver) {
    await createSession("caregiver", caregiver.id);
    redirect(caregiver.name ? "/caregiver" : "/caregiver/onboarding/1");
  } else if (member) {
    return { ok: false, error: "family_no_otp" };
  }

  // 3. New Signup (does not exist under any role) - register under the selected UI role
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
    // Member signup via OTP is disabled
    return { ok: false, error: "member_otp_disabled" };
  }
}

/**
 * Sign up a new Family Member using email, password, and phone number (No OTP).
 */
export async function signupFamilyAction(
  name: string,
  email: string,
  password: string,
  phone: string
): Promise<{ ok: boolean; error?: string }> {
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPhone = phone.trim();
  const trimmedPassword = password.trim();

  if (!trimmedName || !trimmedEmail || !trimmedPhone || !trimmedPassword) {
    return { ok: false, error: "missing_fields" };
  }

  // Verify email & phone uniqueness across all user tables
  const [existingAdmin, existingCaregiver, existingMember, memberByEmail] = await Promise.all([
    db.admin.findUnique({ where: { phone: trimmedPhone } }),
    db.caregiver.findUnique({ where: { phone: trimmedPhone } }),
    db.member.findUnique({ where: { phone: trimmedPhone } }),
    db.member.findUnique({ where: { email: trimmedEmail } }),
  ]);

  if (existingAdmin || existingCaregiver || existingMember) {
    return { ok: false, error: "phone_already_registered" };
  }

  if (memberByEmail) {
    return { ok: false, error: "email_already_registered" };
  }

  try {
    const m = await db.member.create({
      data: {
        name: trimmedName,
        email: trimmedEmail,
        passwordHash: hashPassword(trimmedPassword),
        phone: trimmedPhone,
        subscriptionStatus: "none",
      },
    });

    await createSession("member", m.id);
  } catch (err) {
    console.error("Error creating family member:", err);
    return { ok: false, error: "db_error" };
  }

  redirect("/browse");
}

/**
 * Log in an existing Family Member using email and password (No OTP).
 */
export async function loginFamilyAction(
  email: string,
  password: string
): Promise<{ ok: boolean; error?: string }> {
  const trimmedEmail = email.trim().toLowerCase();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return { ok: false, error: "missing_fields" };
  }

  const member = await db.member.findUnique({
    where: { email: trimmedEmail },
  });

  if (!member || !member.passwordHash) {
    return { ok: false, error: "invalid_credentials" };
  }

  const valid = verifyPassword(trimmedPassword, member.passwordHash);
  if (!valid) {
    return { ok: false, error: "invalid_credentials" };
  }

  await createSession("member", member.id);
  redirect("/browse");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
