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
  revalidatePath("/caregiver");
  revalidatePath("/caregiver/onboarding/[step]", "page");
  redirect("/caregiver/onboarding/2"); // go to step 2 after saving step 1
}

export async function saveStep2(formData: FormData) {
  const id = await requireCaregiver();
  const skills = formData.getAll("skills").map(String);
  await db.caregiver.update({
    where: { id },
    data: { skills: JSON.stringify(skills), qualifications: String(formData.get("qualifications") ?? "") },
  });
  revalidatePath("/caregiver");
  revalidatePath("/caregiver/onboarding/[step]", "page");
  redirect("/caregiver/onboarding/3"); // go to step 3 after saving step 2
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
  revalidatePath("/caregiver");
  revalidatePath("/caregiver/onboarding/[step]", "page");
  redirect("/caregiver/onboarding/4"); // go to step 4 after saving step 3
}

export async function saveStep4(formData: FormData) {
  const id = await requireCaregiver();
  await db.caregiver.update({
    where: { id },
    data: { dailyRate: optionalNumber(formData.get("dailyRate")), monthlyRate: optionalNumber(formData.get("monthlyRate")) },
  });
  revalidatePath("/caregiver");
  revalidatePath("/caregiver/onboarding/[step]", "page");
  redirect("/caregiver");
}

export async function toggleHidden() {
  const id = await requireCaregiver();
  const cg = await db.caregiver.findUnique({ where: { id } });
  if (!cg) return;
  await db.caregiver.update({ where: { id }, data: { isHidden: !cg.isHidden } });
  revalidatePath("/caregiver");
}
