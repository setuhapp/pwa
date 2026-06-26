// Safely parse a JSON string array (e.g. skills/specialisations columns),
// returning [] for null/empty/invalid values rather than throwing.
export function parseStringArray(s: string | null | undefined): string[] {
  try {
    const v = s ? JSON.parse(s) : [];
    return Array.isArray(v) ? (v as string[]) : [];
  } catch {
    return [];
  }
}
