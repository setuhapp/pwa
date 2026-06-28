"use server";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function subscribeMember() {
  const { session } = await getViewer();
  if (session?.userType !== "member") redirect("/login?role=member");

  await db.member.update({
    where: { id: session.userId },
    data: {
      subscriptionStatus: "pending",
      subscriptionExpiry: null,
    },
  });

  revalidatePath("/member/subscribe");
  revalidatePath("/browse");
  redirect("/member/subscribe");
}

export async function activateSubscriptionAction(memberId: string) {
  const { session } = await getViewer();
  if (session?.userType !== "admin") throw new Error("Unauthorized");

  const expiry = new Date();
  expiry.setMonth(expiry.getMonth() + 1);

  await db.member.update({
    where: { id: memberId },
    data: {
      subscriptionStatus: "active",
      subscriptionExpiry: expiry,
    },
  });

  revalidatePath("/admin/families");
  revalidatePath("/");
  revalidatePath("/browse");
}

export async function deactivateSubscriptionAction(memberId: string) {
  const { session } = await getViewer();
  if (session?.userType !== "admin") throw new Error("Unauthorized");

  await db.member.update({
    where: { id: memberId },
    data: {
      subscriptionStatus: "none",
      subscriptionExpiry: null,
    },
  });

  revalidatePath("/admin/families");
  revalidatePath("/");
  revalidatePath("/browse");
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

export async function cancelSubscriptionRequestAction() {
  const { session } = await getViewer();
  if (session?.userType !== "member") redirect("/login?role=member");

  await db.member.update({
    where: { id: session.userId },
    data: {
      subscriptionStatus: "none",
      subscriptionExpiry: null,
    },
  });

  revalidatePath("/member/subscribe");
  revalidatePath("/browse");
  redirect("/member/subscribe");
}
