import { UNSIGNED_PROFILE_LIMIT } from "@/lib/constants";
import type { Tier } from "@/lib/viewer";

// Number of caregivers fetched per infinite-scroll page (non-anon tiers).
export const CAREGIVER_PAGE_SIZE = 8;

export type CaregiverFilters = {
  city?: string;
  specialisation?: string;
  skill?: string;
  available?: string;
};

// Shared Prisma `where` builder so the browse page and the load-more action stay in sync.
export function buildCaregiverWhere(f: CaregiverFilters) {
  const where: Record<string, unknown> = { isHidden: false };
  if (f.city) where.city = f.city;
  if (f.specialisation) where.specialisations = { contains: f.specialisation };
  if (f.skill) where.skills = { contains: f.skill };
  // "Available now" = marked available, or current engagement already ended.
  if (f.available === "now") {
    where.OR = [{ availabilityStatus: "available" }, { engagedTo: { lt: new Date() } }];
  }
  return where;
}

// Stable ordering with a unique tiebreaker so skip/take paging never skips or repeats rows.
export const CAREGIVER_ORDER_BY = [
  { experienceYears: "desc" as const },
  { id: "asc" as const },
];

export function applyCap(orderedIds: string[], tier: Tier, alreadyViewed: string[]) {
  if (tier !== "anon") return { visibleIds: orderedIds, capped: false };
  
  const visibleIds: string[] = [];
  const newlyViewed: string[] = [];
  
  for (const id of orderedIds) {
    if (alreadyViewed.includes(id)) {
      visibleIds.push(id);
    } else if (alreadyViewed.length + newlyViewed.length < UNSIGNED_PROFILE_LIMIT) {
      visibleIds.push(id);
      newlyViewed.push(id);
    }
  }
  
  const capped = orderedIds.length > visibleIds.length;
  return { visibleIds, capped };
}
