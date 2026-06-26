import type { Caregiver } from "@prisma/client";

const D_FIELDS = ["phone", "name", "photoUrl", "address"] as const;

export type PublicCaregiver = Omit<Caregiver, (typeof D_FIELDS)[number]>;

export function toPublicCaregiver(c: Caregiver): PublicCaregiver {
  const clone: Record<string, unknown> = { ...c };
  for (const f of D_FIELDS) delete clone[f];
  return clone as PublicCaregiver;
}

export function toFullCaregiver(c: Caregiver): Caregiver {
  return c;
}
