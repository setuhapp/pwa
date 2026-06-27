"use server";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const { session } = await getViewer();
  if (session?.userType !== "admin") throw new Error("Unauthorized");
}

export async function verifyCaregiver(caregiverId: string) {
  await requireAdmin();
  
  // Check if already verified
  const existing = await db.verification.findFirst({ where: { caregiverId } });
  if (!existing) {
    await db.verification.create({ data: { caregiverId } });
  }

  revalidatePath("/admin/caregivers");
  revalidatePath(`/c/${caregiverId}`);
  revalidatePath("/browse");
}
