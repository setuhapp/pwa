"use server";

import { cookies } from "next/headers";
import { BROWSE_COOKIE } from "@/lib/constants";
import { getViewed } from "@/lib/browseSession";

export async function recordViews(ids: string[]) {
  if (!ids.length) return;
  const current = await getViewed();
  const next = Array.from(new Set([...current, ...ids]));
  (await cookies()).set(BROWSE_COOKIE, JSON.stringify(next), { path: "/", maxAge: 60 * 60 * 24 * 30 });
}
