import { describe, it, expect } from "vitest";
import { isSubscriptionActive } from "@/lib/subscription";

describe("isSubscriptionActive", () => {
  const now = new Date("2026-06-05T00:00:00Z");
  it("inactive when status none", () => {
    expect(isSubscriptionActive({ subscriptionStatus: "none", subscriptionExpiry: null }, now)).toBe(false);
  });
  it("active when status active and expiry in future", () => {
    expect(isSubscriptionActive({ subscriptionStatus: "active", subscriptionExpiry: new Date("2026-07-05") }, now)).toBe(true);
  });
  it("inactive when expiry in the past (lapsed)", () => {
    expect(isSubscriptionActive({ subscriptionStatus: "active", subscriptionExpiry: new Date("2026-05-05") }, now)).toBe(false);
  });
});
