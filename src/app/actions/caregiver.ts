"use server";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { saveUpload } from "@/lib/upload";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function requireCaregiver() {
  const { session } = await getViewer();
  if (session?.userType !== "caregiver") redirect("/login?role=caregiver");
  return session.userId;
}

// Blank or non-numeric fields stay null (not 0/NaN) so completeness scoring is honest.
function optionalNumber(value: FormDataEntryValue | null): number | null {
  const s = String(value ?? "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isNaN(n) ? null : n;
}

export async function saveStep1(formData: FormData) {
  const id = await requireCaregiver();
  const photo = formData.get("photo") as File | null;
  const photoUrl = photo && photo.size > 0 ? await saveUpload(photo) : undefined;
  await db.caregiver.update({
    where: { id },
    data: {
      name: String(formData.get("name") ?? ""),
      address: String(formData.get("address") ?? ""),
      city: String(formData.get("city") ?? ""),
      ...(photoUrl ? { photoUrl } : {}),
    },
  });
  redirect("/caregiver"); // live after step 1
}

export async function saveStep2(formData: FormData) {
  const id = await requireCaregiver();
  const skills = formData.getAll("skills").map(String);
  await db.caregiver.update({
    where: { id },
    data: { skills: JSON.stringify(skills), qualifications: String(formData.get("qualifications") ?? "") },
  });
  redirect("/caregiver");
}

export async function saveStep3(formData: FormData) {
  const id = await requireCaregiver();
  await db.caregiver.update({
    where: { id },
    data: {
      experienceYears: optionalNumber(formData.get("experienceYears")),
      priorFamilies: String(formData.get("priorFamilies") ?? ""),
      specialisations: JSON.stringify(formData.getAll("specialisations").map(String)),
      availability: String(formData.get("availability") ?? ""),
    },
  });
  redirect("/caregiver");
}

export async function saveStep4(formData: FormData) {
  const id = await requireCaregiver();
  await db.caregiver.update({
    where: { id },
    data: { dailyRate: optionalNumber(formData.get("dailyRate")), monthlyRate: optionalNumber(formData.get("monthlyRate")) },
  });
  redirect("/caregiver");
}

export async function toggleHidden() {
  const id = await requireCaregiver();
  const cg = await db.caregiver.findUnique({ where: { id } });
  if (!cg) return;
  await db.caregiver.update({ where: { id }, data: { isHidden: !cg.isHidden } });
  revalidatePath("/caregiver");
}
