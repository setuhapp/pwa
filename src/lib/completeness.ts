import { parseStringArray } from "@/lib/json";

type CG = {
  name?: string | null; photoUrl?: string | null; address?: string | null; city?: string | null;
  skills?: string | null; qualifications?: string | null;
  experienceYears?: number | null; priorFamilies?: string | null;
  dailyRate?: number | null; monthlyRate?: number | null;
};

// Four equal sections: details, qualifications, experience, rate.
export function profileCompleteness(c: CG): number {
  const details = !!(c.name && c.photoUrl && c.address && c.city);
  // An empty skills array ('[]') must NOT count as filled.
  const quals = parseStringArray(c.skills).length > 0 || !!c.qualifications;
  const exp = c.experienceYears != null || !!c.priorFamilies;
  const rate = c.dailyRate != null || c.monthlyRate != null;
  const filled = [details, quals, exp, rate].filter(Boolean).length;
  return filled * 25;
}
