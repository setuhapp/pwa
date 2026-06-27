"use server";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function sendMessage(otherUserId: string, content: string) {
  const { session } = await getViewer();
  if (!session) throw new Error("Unauthorized");

  const isMember = session.userType === "member";
  
  await db.message.create({
    data: {
      content,
      sender: isMember ? "member" : "caregiver",
      memberId: isMember ? session.userId : otherUserId,
      caregiverId: isMember ? otherUserId : session.userId,
    }
  });

  revalidatePath(`/messages/${otherUserId}`);
  revalidatePath("/messages");
}
