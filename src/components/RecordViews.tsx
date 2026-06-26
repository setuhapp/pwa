"use client";

import { useEffect } from "react";
import { recordViews } from "@/app/actions/browse";

export function RecordViews({ ids }: { ids: string[] }) {
  const idsKey = JSON.stringify(ids);
  
  useEffect(() => {
    if (ids.length > 0) {
      recordViews(ids).catch(console.error);
    }
  }, [idsKey]); // Depend on stringified array to avoid referential inequality loop

  return null;
}
