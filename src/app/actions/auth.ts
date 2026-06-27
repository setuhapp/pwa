"use server";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/session";
import { DEV_OTP } from "@/lib/constants";
import { redirect } from "next/navigation";

const ROLES = ["caregiver", "member", "admin"] as const;

export async function login(formData: FormData) {
  const phone = String(formData.get("phone") ?? "").trim();
  const rawRole = String(formData.get("role") ?? "member");
  // Only three roles are valid; anything else falls back to member.
  const role = (ROLES as readonly string[]).includes(rawRole) ? rawRole : "member";
  const code = String(formData.get("code") ?? "");
  if (!phone || code !== DEV_OTP) redirect(`/login?role=${role}&error=1`);

  if (role === "caregiver") {
    const cg = await db.caregiver.upsert({ where: { phone }, update: {}, create: { phone } });
    await createSession("caregiver", cg.id);
    redirect(cg.name ? "/caregiver" : "/caregiver/onboarding/1");
  } else if (role === "admin") {
    const a = await db.admin.upsert({ where: { phone }, update: {}, create: { phone } });
    await createSession("admin", a.id);
    redirect("/admin");
  } else {
    const m = await db.member.upsert({ where: { phone }, update: {}, create: { phone } });
    await createSession("member", m.id);
  }
  // Redirect to browse instead of home to fix the "double sign in" feeling
  redirect("/browse");
}

export async function logout() {
  await destroySession();
  redirect("/");
}
