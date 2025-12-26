"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import { initDealScrollPauseTracker } from "@/lib/analytics/dealScrollPause";

import { trackEvent } from "@/lib/trackEvent";
import useDebounce from "@/hooks/useDebounce";
import { useLangStore } from "@/lib/languageStore";

/* -------------------------------------------------------------
   Supabase
------------------------------------------------------------- */
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/* -------------------------------------------------------------
   Constants
------------------------------------------------------------- */
const LIMIT = 20;
const SCROLL_DEPTHS = [25, 50, 75, 100];

/* -------------------------------------------------------------
   Component
------------------------------------------------------------- */
export default function DealsList({
  selectedStore,
  selectedCategory,
  selectedHoliday,
  showHotDeals = false,
  onSelectDeal,
  searchQuery,
  scrollRef,
}: any) {
  /* -----------------------------------------------------------
     Language store
  ----------------------------------------------------------- */
  const { lang, hydrate, hydrated } = useLangStore();

  useEffect(() => {
    hydrate();
  }, []);

  if (!hydrated) return null;

  const t = {
    loading: lang === "en" ? "Loading deals..." : "Cargando ofertas...",
    noDeals: lang === "en" ? "No deals found." : "Sin ofertas disponibles.",
  };

  /* -----------------------------------------------------------
     State
  ----------------------------------------------------------- */
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const firedDepths = useRef<Set<number>>(new Set());

  const debouncedSearch = useDebounce(searchQuery, 300);

  /* -----------------------------------------------------------
     Build Supabase query
  ----------------------------------------------------------- */
  const buildQuery = () => {
  let query = supabase
    .from("deals")
    .select("*")
    .eq("status", "Published")
    .order("display_order", { ascending: false });

  if (selectedStore && selectedStore !== "Recent Deals") {
    query = query.ilike("store_name", `%${selectedStore}%`);
  }

  if (selectedCategory) {
    query = query.ilike("category", `%${selectedCategory}%`);
  }

  if (selectedHoliday) {
    query = query.eq(
      "holiday_tag",
      selectedHoliday
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c: string) => c.toUpperCase())
    );
  }

  if (showHotDeals) {
    query = query.gte("percent_diff", 30);
  }

  if (debouncedSearch) {
    query = query.or(
      `description.ilike.%${debouncedSearch}%,description_es.ilike.%${debouncedSearch}%,store_name.ilike.%${debouncedSearch}%,category.ilike.%${debouncedSearch}%`
    );
  }

  return query;
};

  /* -----------------------------------------------------------
     Initial load
  ----------------------------------------------------------- */
  useEffect(() => {
    const loadFirstPage = async () => {
      setLoading(true);
      setPage(0);
      setHasMore(true);
      firedDepths.current.clear();

      const { data, error } = await buildQuery().range(0, LIMIT - 1);

      if (error || !data) {
        setDeals([]);
        setLoading(false);
        return;
      }

      const unique = data.filter(
        (d, i, arr) => arr.findIndex((x) => x.id === d.id) === i
      );

      setDeals(unique);
      setHasMore(unique.length === LIMIT);
      setLoading(false);
    };

    loadFirstPage();
  }, [
    selectedStore,
    selectedCategory,
    selectedHoliday,
    showHotDeals,
    debouncedSearch,
    lang,
  ]);

  /* -----------------------------------------------------------
     Load more (infinite scroll)
  ----------------------------------------------------------- */
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    const nextPage = page + 1;
    const from = nextPage * LIMIT;
    const to = from + LIMIT - 1;

    const { data, error } = await buildQuery().range(from, to);

    if (!error && data) {
      const combined = [...deals, ...data];
      const unique = combined.filter(
        (d, i, arr) => arr.findIndex((x) => x.id === d.id) === i
      );

      setDeals(unique);
      setPage(nextPage);
      setHasMore(data.length === LIMIT);
    }

    setLoadingMore(false);
  };

const intentCleanupRef = useRef<null | (() => void)>(null);

useEffect(() => {
  if (!deals.length) return;

  let visitorId = localStorage.getItem("visitor_id");
  if (!visitorId) {
   // visitorId = crypto.randomUUID();
    let visitorId = localStorage.getItem("visitor_id");

if (!visitorId) {
  visitorId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);

  localStorage.setItem("visitor_id", visitorId);
}

  }

  // Cleanup old observer
  intentCleanupRef.current?.();

  // Init new observer AFTER DOM updates
  requestAnimationFrame(() => {
    intentCleanupRef.current = initDealScrollPauseTracker(visitorId);
  });

  return () => {
    intentCleanupRef.current?.();
  };
}, [deals]);

  /* -----------------------------------------------------------
     Scroll listener (infinite scroll + depth tracking)
  ----------------------------------------------------------- */
  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    const onScroll = () => {
      if (loading || loadingMore) return;

      // Infinite scroll
      if (hasMore && div.scrollTop + div.clientHeight >= div.scrollHeight - 200) {
        loadMore();
      }

      // Scroll depth tracking
      const maxScroll = div.scrollHeight - div.clientHeight;
      if (maxScroll <= 0) return;

      const percent = Math.round((div.scrollTop / maxScroll) * 100);

      SCROLL_DEPTHS.forEach((depth) => {
        if (percent >= depth && !firedDepths.current.has(depth)) {
          firedDepths.current.add(depth);

          trackEvent({
            event_name: "scroll_depth",
            event_type: "engagement",
            page: window.location.pathname,
            metadata: { depth },
          });
        }
      });
    };

    div.addEventListener("scroll", onScroll);
    return () => div.removeEventListener("scroll", onScroll);
  }, [loading, loadingMore, hasMore, page]);

  /* -----------------------------------------------------------
     Expose scroll container to parent
  ----------------------------------------------------------- */
  useEffect(() => {
    if (scrollRef && "current" in scrollRef) {
      scrollRef.current = containerRef.current;
    }
  }, [scrollRef]);

  /* -----------------------------------------------------------
     UI
  ----------------------------------------------------------- */
  if (loading) return <p className="text-center mt-10">{t.loading}</p>;
  if (!deals.length) return <p className="text-center mt-10">{t.noDeals}</p>;

  return (
    <div
      ref={containerRef}
      className="flex flex-col divide-y divide-gray-200 overflow-y-auto h-full custom-scroll"
    >
      {deals.map((deal) => {
        const title = lang === "en" ? deal.description : deal.description_es;

        return (
          <a
            key={deal.id}
            data-deal-id={deal.id}
            href={`/deal/${deal.id}`}
            onClick={(e) => {
              e.preventDefault();

              trackEvent({
                event_name: "deal_click",
                event_type: "click",
                page: window.location.pathname,
                deal_id: deal.id,
                store: deal.store_name,
                category: deal.category,
                device: navigator.userAgent,
              });

              onSelectDeal(deal);
            }}
            className="flex items-center gap-4 p-3 h-32 hover:bg-gray-100 cursor-pointer transition"
          >
            <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
              {deal.image_link ? (
                <img
                  src={deal.image_link}
                  alt={title}
                  className="w-full h-full object-contain bg-white"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-xs">
                  No Image
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 line-clamp-2">
                {title}
              </h3>

              <p className="text-sm text-gray-500 truncate">
                {deal.store_name}
              </p>

              <div className="text-sm text-gray-600 mt-1">
                {deal.current_price && (
                  <span className="font-semibold text-green-600">
                    ${deal.current_price.toFixed(2)}
                  </span>
                )}

                {deal.old_price && (
                  <span className="ml-2 line-through text-gray-400">
                    ${deal.old_price.toFixed(2)}
                  </span>
                )}

                {deal.percent_diff && (
                  <span className="ml-2 text-sm font-bold text-green-600">
                    -{deal.percent_diff.toFixed(0)}%
                  </span>
                )}
              </div>
            </div>
          </a>
        );
      })}

      {loadingMore && (
        <div className="p-4 text-center text-gray-500">
          {t.loading}
        </div>
      )}
    </div>
  );
}
