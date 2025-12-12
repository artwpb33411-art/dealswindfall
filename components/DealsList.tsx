"use client";
import { trackEvent } from "@/lib/trackEvent";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import useDebounce from "@/hooks/useDebounce";
import track from "@/lib/track";
import { useLangStore } from "@/lib/languageStore";   // ⭐ ADDED

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LIMIT = 20;

export default function DealsList({
  selectedStore,
  selectedCategory,
  selectedHoliday,
  showHotDeals = false,
  onSelectDeal,
  searchQuery,
  scrollRef,
}: any) {

  // ⭐ LANGUAGE STORE SUPPORT
  const { lang, hydrate, hydrated } = useLangStore();

  useEffect(() => {
    hydrate();
  }, []);

  if (!hydrated) return null;

  // ⭐ TRANSLATION OF TEXT
  const t = {
    loading: lang === "en" ? "Loading deals..." : "Cargando ofertas...",
    noDeals: lang === "en" ? "No deals found." : "Sin ofertas disponibles.",
  };

  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const debouncedSearch = useDebounce(searchQuery, 300);

  /* =============================
     BUILD SUPABASE QUERY
  ============================== */
  const buildQuery = () => {
    let query = supabase
      .from("deals")
      .select("*")
      .eq("status", "Published")
      .order("published_at", { ascending: false });

    if (selectedStore && selectedStore !== "Recent Deals") {
      query = query.ilike("store_name", `%${selectedStore}%`);
    }

    if (selectedCategory) {
      query = query.ilike("category", `%${selectedCategory}%`);
    }

    if (selectedHoliday) {
      query = query.eq(
        "holiday_tag",
        selectedHoliday.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase())
      );
    }

    if (showHotDeals) {
      query = query.gte("percent_diff", 30);
    }

    if (debouncedSearch) {
      // ⭐ bilingual search (description + description_es)
      query = query.or(
        `description.ilike.%${debouncedSearch}%,description_es.ilike.%${debouncedSearch}%,store_name.ilike.%${debouncedSearch}%,category.ilike.%${debouncedSearch}%`
      );
    }

    return query;
  };

  /* =============================
     FIRST PAGE LOAD
  ============================== */
  useEffect(() => {
    const loadFirst = async () => {
      setLoading(true);
      setPage(0);
      setHasMore(true);

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

    loadFirst();
  }, [
    selectedStore,
    selectedCategory,
    selectedHoliday,
    showHotDeals,
    debouncedSearch,
    lang, // ⭐ rerun when language changes
  ]);

  /* =============================
     LOAD MORE (INFINITE SCROLL)
  ============================== */
  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);

    const next = page + 1;
    const from = next * LIMIT;
    const to = from + LIMIT - 1;

    const { data, error } = await buildQuery().range(from, to);

    if (!error && data) {
      const combined = [...deals, ...data];
      const unique = combined.filter(
        (d, i, arr) => arr.findIndex((x) => x.id === d.id) === i
      );

      setDeals(unique);
      setPage(next);
      setHasMore(data.length === LIMIT);
    }

    setLoadingMore(false);
  };

  /* =============================
     SCROLL LISTENER
  ============================== */
  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    const onScroll = () => {
      if (loading || loadingMore || !hasMore) return;

      if (div.scrollTop + div.clientHeight >= div.scrollHeight - 200) {
        loadMore();
      }
    };

    div.addEventListener("scroll", onScroll);
    return () => div.removeEventListener("scroll", onScroll);
  }, [loading, loadingMore, hasMore, page]);

  /* =============================
     EXPOSE SCROLL TO PARENT
  ============================== */
  useEffect(() => {
    if (scrollRef && "current" in scrollRef) {
      scrollRef.current = containerRef.current;
    }
  }, [scrollRef]);

  /* =============================
     UI
  ============================== */
  if (loading) return <p className="text-center mt-10">{t.loading}</p>;
  if (!deals.length) return <p className="text-center mt-10">{t.noDeals}</p>;

  return (
    <div
      ref={containerRef}
      className="flex flex-col divide-y divide-gray-200 overflow-y-auto h-full custom-scroll"
    >
      {deals.map((deal) => {
        const title = lang === "en" ? deal.description : deal.description_es;
        const notes = lang === "en" ? deal.notes : deal.notes_es;

        return (
          <a
            key={deal.id}
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

                {deal.percent_diff >= 70 ? (
                  <span className="text-red-600 text-lg">🔥🔥🔥</span>
                ) : deal.percent_diff >= 60 ? (
                  <span className="text-orange-500 text-lg">🔥🔥</span>
                ) : deal.percent_diff >= 50 ? (
                  <span className="text-amber-500 text-lg">🔥</span>
                ) : deal.percent_diff >= 40 ? (
                  <span className="text-yellow-600 text-lg">🌡️</span>
                ) : null}

                {deal.percent_diff && (
                  <span className="text-sm font-bold text-green-600">
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
