import type { Caregiver } from "@prisma/client";

// Fields hidden from anon/unsubscribed viewers. workHistory can name families/
// places, so it's gated; summary stays public (it's the conversion hook).
const D_FIELDS = ["phone", "name", "photoUrl", "address", "workHistory"] as const;

export type PublicCaregiver = Omit<Caregiver, (typeof D_FIELDS)[number]>;

export function toPublicCaregiver(c: Caregiver): PublicCaregiver {
  const clone: Record<string, unknown> = { ...c };
  for (const f of D_FIELDS) delete clone[f];
  return clone as PublicCaregiver;
}

export function toFullCaregiver(c: Caregiver): Caregiver {
  return c;
}
