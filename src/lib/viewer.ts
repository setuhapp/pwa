export type Tier = "anon" | "member" | "caregiver" | "admin";
export type SessionInfo = { userType: "caregiver" | "member" | "admin"; userId: string } | null;

// A member only gets the member tier while their subscription is active.
export function tierFromSession(session: SessionInfo, member: { subscriptionStatus: string } | null): Tier {
  if (!session) return "anon";
  if (session.userType === "admin") return "admin";
  if (session.userType === "caregiver") return "caregiver";
  if (session.userType === "member") return member?.subscriptionStatus === "active" ? "member" : "anon";
  return "anon";
}
