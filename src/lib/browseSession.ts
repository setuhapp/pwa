import { cookies } from "next/headers";
import { BROWSE_COOKIE } from "@/lib/constants";

export async function getViewed(): Promise<string[]> {
  const jar = await cookies();
  const val = jar.get(BROWSE_COOKIE)?.value;
  if (!val) return [];
  try {
    const arr = JSON.parse(val);
    if (Array.isArray(arr)) return arr;
  } catch {}
  return [];
}
