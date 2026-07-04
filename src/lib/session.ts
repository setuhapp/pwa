import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { SESSION_COOKIE } from "@/lib/constants";
import { tierFromSession, type SessionInfo, type Tier } from "@/lib/viewer";

export async function createSession(userType: "caregiver" | "member" | "admin", userId: string) {
  const token = crypto.randomUUID();
  await db.session.create({ data: { token, userType, userId } });
  (await cookies()).set(SESSION_COOKIE, token, { 
    httpOnly: true, 
    sameSite: "lax", 
    path: "/",
    maxAge: 60 * 60 * 24 * 365 * 10, // 10 years (never log out)
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { token } });
  jar.delete(SESSION_COOKIE);
}

const USER_TYPES = ["caregiver", "member", "admin"] as const;

async function rawSession(): Promise<SessionInfo> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const s = await db.session.findUnique({ where: { token } });
  if (!s) return null;
  // Guard against a malformed userType in the DB rather than blindly casting.
  if (!(USER_TYPES as readonly string[]).includes(s.userType)) return null;
  return { userType: s.userType as NonNullable<SessionInfo>["userType"], userId: s.userId };
}

import { isSubscriptionActive } from "@/lib/subscription";

export async function getViewer(): Promise<{ session: SessionInfo; tier: Tier }> {
  const session = await rawSession();
  let member = null;
  if (session?.userType === "member") {
    const rawMember = await db.member.findUnique({ where: { id: session.userId } });
    if (rawMember) {
      member = {
        ...rawMember,
        subscriptionStatus: isSubscriptionActive(rawMember, new Date()) ? "active" : "none",
      };
    }
  }
  return { session, tier: tierFromSession(session, member) };
}
