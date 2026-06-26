export function isSubscriptionActive(
  m: { subscriptionStatus: string; subscriptionExpiry: Date | null },
  now: Date,
): boolean {
  if (m.subscriptionStatus !== "active") return false;
  if (!m.subscriptionExpiry) return false;
  return m.subscriptionExpiry.getTime() > now.getTime();
}
