import { describe, it, expect } from "vitest";
import { tierFromSession } from "@/lib/viewer";

describe("tierFromSession", () => {
  it("returns anon when no session", () => {
    expect(tierFromSession(null, { subscriptionStatus: "none" })).toBe("anon");
  });
  it("returns member when member session is subscribed", () => {
    expect(tierFromSession({ userType: "member", userId: "m1" }, { subscriptionStatus: "active" })).toBe("member");
  });
  it("returns anon when member session is NOT subscribed", () => {
    expect(tierFromSession({ userType: "member", userId: "m1" }, { subscriptionStatus: "none" })).toBe("anon");
  });
  it("returns caregiver for caregiver session", () => {
    expect(tierFromSession({ userType: "caregiver", userId: "c1" }, null)).toBe("caregiver");
  });
  it("returns admin for admin session", () => {
    expect(tierFromSession({ userType: "admin", userId: "a1" }, null)).toBe("admin");
  });
});
