import { describe, it, expect } from "vitest";
import { applyCap } from "@/lib/browse";

const ids = ["a", "b", "c", "d", "e", "f", "g"];

describe("applyCap", () => {
  it("members see all", () => {
    const r = applyCap(ids, "member", []);
    expect(r.visibleIds.length).toBe(7);
    expect(r.capped).toBe(false);
  });
  it("anon capped at 5 and flagged", () => {
    const r = applyCap(ids, "anon", []);
    expect(r.visibleIds.length).toBe(5);
    expect(r.capped).toBe(true);
  });
  it("anon cap counts already-viewed profiles", () => {
    const r = applyCap(ids, "anon", ["x", "y", "z"]); // 3 already viewed
    expect(r.visibleIds.length).toBe(2);
    expect(r.capped).toBe(true);
  });
});
