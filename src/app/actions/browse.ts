"use server";

import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getViewer } from "@/lib/session";
import { BROWSE_COOKIE } from "@/lib/constants";
import { getViewed } from "@/lib/browseSession";
import { toFullCaregiver, type PublicCaregiver } from "@/lib/serializers";
import {
  buildCaregiverWhere,
  CAREGIVER_ORDER_BY,
  CAREGIVER_PAGE_SIZE,
  type CaregiverFilters,
} from "@/lib/browse";
import type { Caregiver } from "@prisma/client";

export async function recordViews(ids: string[]) {
  if (!ids.length) return;
  const current = await getViewed();
  const next = Array.from(new Set([...current, ...ids]));
  (await cookies()).set(BROWSE_COOKIE, JSON.stringify(next), { path: "/", maxAge: 60 * 60 * 24 * 30 });
}

// Loads the next page of caregivers for infinite scroll. Tier is re-derived
// server-side, never trusted from the client. Anon (incl. unsubscribed members)
// stays capped via applyCap on the page, so it never paginates here.
export async function loadCaregivers(
  filters: CaregiverFilters,
  skip: number
): Promise<{ items: (Caregiver | PublicCaregiver)[]; hasMore: boolean }> {
  const { tier } = await getViewer();
  if (tier === "anon") return { items: [], hasMore: false };

  const rows = await db.caregiver.findMany({
    where: buildCaregiverWhere(filters),
    orderBy: CAREGIVER_ORDER_BY,
    skip: Math.max(0, skip),
    take: CAREGIVER_PAGE_SIZE + 1, // fetch one extra to detect whether more remain
  });

  const hasMore = rows.length > CAREGIVER_PAGE_SIZE;
  const items = rows.slice(0, CAREGIVER_PAGE_SIZE).map(toFullCaregiver);
  return { items, hasMore };
}
