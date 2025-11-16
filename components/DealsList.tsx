"use client";
import { useEffect, useState, useRef } from "react";
import { createClient } from "@supabase/supabase-js";
import useDebounce from "@/hooks/useDebounce";
import track from "@/lib/track";


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DealsList({
  selectedStore,
  selectedCategory,
  selectedHoliday,
  showHotDeals = false,
  onSelectDeal,
  searchQuery,
}: any) {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // ----------------------------------------------------
  // FETCH DEALS WITH FILTERS
  // ----------------------------------------------------
  useEffect(() => {
    const fetchDeals = async () => {
      setLoading(true);

      let query = supabase
        .from("deals")
        .select("*")
        .eq("status", "Published")
        .order("published_at", { ascending: false });

      // Store Filter
      if (selectedStore && selectedStore !== "Recent Deals") {
        query = query.ilike("store_name", `%${selectedStore}%`);
      }

      // Category Filter
      if (selectedCategory) {
        query = query.ilike("category", `%${selectedCategory}%`);
      }

      // Holiday Filter
      if (selectedHoliday) {
  query = query.eq("holiday_tag", selectedHoliday.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()));
}


      // Hot Deals Filter
      if (showHotDeals) {
        query = query.gte("percent_diff", 30);
      }

      // Search Filter
      if (debouncedSearch) {
        query = query.or(
          `description.ilike.%${debouncedSearch}%,store_name.ilike.%${debouncedSearch}%,category.ilike.%${debouncedSearch}%`
        );
      }

      const { data, error } = await query;

      if (!error) {
        setDeals(data || []);
      }

      setLoading(false);
    };

    fetchDeals();
  }, [
    selectedStore,
    selectedCategory,
    selectedHoliday,
    showHotDeals,
    debouncedSearch,
  ]);

  // ----------------------------------------------------
  // PULL-TO-REFRESH (mobile)
  // ----------------------------------------------------
  useEffect(() => {
    const div = containerRef.current;
    if (!div) return;

    let startY = 0;
    let pulling = false;

    const start = (e: TouchEvent) => {
      if (div.scrollTop === 0) {
        pulling = true;
        startY = e.touches[0].clientY;
      }
    };

    const move = (e: TouchEvent) => {
      if (!pulling) return;
      const delta = e.touches[0].clientY - startY;
      if (delta > 70 && !refreshing) {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 700);
        pulling = false;
      }
    };

    const end = () => (pulling = false);

    div.addEventListener("touchstart", start, { passive: true });
    div.addEventListener("touchmove", move, { passive: true });
    div.addEventListener("touchend", end, { passive: true });

    return () => {
      div.removeEventListener("touchstart", start);
      div.removeEventListener("touchmove", move);
      div.removeEventListener("touchend", end);
    };
  }, [refreshing]);

  // ----------------------------------------------------
  // UI
  // ----------------------------------------------------
  if (loading) return <p className="text-center mt-10">Loading deals...</p>;
  if (!deals.length) return <p className="text-center mt-10">No deals found.</p>;

  return (
    <div
      ref={containerRef}
      className="flex flex-col divide-y divide-gray-200 overflow-y-auto h-full custom-scroll"
    >
      {refreshing && (
        <div className="text-center text-gray-500 text-sm py-2">
          Refreshing...
        </div>
      )}

      {deals.map((deal) => (
        <div
          key={deal.id}
        onClick={() => {
  track({
    event_type: "deal_click",
    deal_id: deal.id,
    page: "/",
    user_agent: navigator.userAgent,
    ip_address: null
  });

  onSelectDeal(deal); // keep your UI behavior
}}



          className="flex items-center gap-4 p-3 h-32 hover:bg-gray-100 cursor-pointer transition"
        >
          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
            {deal.image_link ? (
              <img
                src={deal.image_link}
                alt={deal.description}
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
              {deal.description}
            </h3>
            <p className="text-sm text-gray-500 truncate">{deal.store_name}</p>

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
			 
  
  {/* Heat Level Icon */}
      {deal.percent_diff >= 70 ? (
        <span className="text-red-600 text-lg">🔥🔥🔥</span>
      ) : deal.percent_diff >= 60 ? (
        <span className="text-orange-500 text-lg">🔥🔥</span>
      ) : deal.percent_diff >= 50 ? (
        <span className="text-amber-500 text-lg">🔥</span>
      ) : deal.percent_diff >= 40 ? (
        <span className="text-yellow-600 text-lg">🌡️</span>
      ) : null}

      {/* Percentage Off */}
      {deal.percent_diff ? (
        <span className="text-sm font-bold text-green-600">
          -{deal.percent_diff.toFixed(0)}%
        </span>
      ) : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
