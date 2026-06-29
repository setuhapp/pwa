"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Caregiver } from "@prisma/client";
import { ProfileCard } from "@/components/ProfileCard";
import { loadCaregivers } from "@/app/actions/browse";
import type { CaregiverFilters } from "@/lib/browse";
import { type PublicCaregiver } from "@/lib/serializers";
import { getTranslations } from "@/lib/translations";

type FeedItem = Caregiver | PublicCaregiver;

export function CaregiverFeed({
  initialItems,
  initialHasMore,
  filters,
  lang = "en",
}: {
  initialItems: FeedItem[];
  initialHasMore: boolean;
  filters: CaregiverFilters;
  lang?: string;
}) {
  const [items, setItems] = useState<FeedItem[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const t = getTranslations(lang);

  // Reset when a new filter set arrives (form navigation re-renders the page).
  useEffect(() => {
    setItems(initialItems);
    setHasMore(initialHasMore);
  }, [initialItems, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const res = await loadCaregivers(filters, items.length);
      setItems((prev) => [...prev, ...res.items]);
      setHasMore(res.hasMore);
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, items.length, filters]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px" } // start loading before the sentinel is fully in view
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  if (items.length === 0) {
    return (
      <div className="mt-2 py-12 text-center rounded-3xl bg-white/50 backdrop-blur-sm border border-white p-6 shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 shadow-inner">
          <svg className="h-8 w-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-lg font-bold text-slate-900">{t.no_caregivers_title}</h3>
        <p className="mt-1 text-sm font-medium text-slate-500">{t.no_caregivers_desc}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 mt-2">
      {items.map((cg) => (
        <ProfileCard key={cg.id} caregiver={cg} lang={lang} />
      ))}

      {hasMore && <div ref={sentinelRef} aria-hidden className="h-1 w-full" />}

      {loading && (
        <div className="flex justify-center py-4">
          <div className="h-7 w-7 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-600" />
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="py-4 text-center text-xs font-medium text-slate-400">{t.feed_end}</p>
      )}
    </div>
  );
}
