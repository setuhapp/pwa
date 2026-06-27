"use server";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function subscribeMember() {
  const { session } = await getViewer();
  if (session?.userType !== "member") redirect("/login?role=member");

  // Mock payment: set subscription active for 1 month
  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + 1);

  await db.member.update({
    where: { id: session.userId },
    data: {
      subscriptionStatus: "active",
      subscriptionExpiry: expiry,
    },
  });

  revalidatePath("/");
  redirect("/browse");
}

export async function toggleBookmarkAction(caregiverId: string) {
  const { session } = await getViewer();
  if (session?.userType !== "member") {
    redirect("/login?role=member");
  }

  const existing = await db.bookmark.findFirst({
    where: {
      memberId: session.userId,
      caregiverId,
    },
  });

  if (existing) {
    await db.bookmark.delete({
      where: { id: existing.id },
    });
  } else {
    await db.bookmark.create({
      data: {
        memberId: session.userId,
        caregiverId,
      },
    });
  }

  revalidatePath(`/c/${caregiverId}`);
  revalidatePath("/member/bookmarks");
  revalidatePath("/browse");
}
