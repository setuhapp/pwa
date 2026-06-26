import { describe, it, expect } from "vitest";
import { toPublicCaregiver, toFullCaregiver } from "@/lib/serializers";

const cg = {
  id: "c1", phone: "999", name: "Asha", photoUrl: "/p.png", address: "12 St", city: "Chennai",
  skills: '["dementia"]', qualifications: "GNM", experienceYears: 5, priorFamilies: "3",
  specialisations: '["dementia"]', availability: "live-in", dailyRate: 800, monthlyRate: 20000,
  isHidden: false, createdAt: new Date(),
} as any;

describe("serializers", () => {
  it("public strips all D fields", () => {
    const p = toPublicCaregiver(cg) as Record<string, unknown>;
    for (const d of ["phone", "name", "photoUrl", "address"]) expect(d in p).toBe(false);
    expect(p.city).toBe("Chennai");      // city is location, not identity → allowed
    expect(p.skills).toBe('["dementia"]');
    expect(p.experienceYears).toBe(5);
  });
  it("full keeps D fields", () => {
    const f = toFullCaregiver(cg) as Record<string, unknown>;
    expect(f.name).toBe("Asha");
    expect(f.phone).toBe("999");
  });
});
