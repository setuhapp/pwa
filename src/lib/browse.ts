import { UNSIGNED_PROFILE_LIMIT } from "@/lib/constants";
import type { Tier } from "@/lib/viewer";

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
