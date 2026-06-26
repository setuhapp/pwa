import { describe, it, expect } from "vitest";
import { profileCompleteness } from "@/lib/completeness";

const base = { name: "A", photoUrl: "p", address: "x", city: "Chennai" };

describe("profileCompleteness", () => {
  it("is 25% with only step 1 filled", () => {
    expect(profileCompleteness({ ...base } as any)).toBe(25);
  });
  it("is 100% with all four sections", () => {
    expect(profileCompleteness({
      ...base, skills: '["dementia"]', qualifications: "GNM",
      experienceYears: 5, priorFamilies: "2",
      dailyRate: 800,
    } as any)).toBe(100);
  });
  it("is 0% when nothing filled", () => {
    expect(profileCompleteness({} as any)).toBe(0);
  });
  it("does NOT count an empty skills array as a filled qualifications section", () => {
    expect(profileCompleteness({ ...base, skills: "[]", qualifications: "" } as any)).toBe(25);
  });
});
