"use client";

import { useEffect, useState } from "react";
import DateRangeFilter from "./DateRangeFilter";
import TopViewedDeals from "./TopViewedDeals";
import TopOutboundDeals from "./TopOutboundDeals";
import AnalyticsSummary from "./AnalyticsSummary";
import AdminTechStats from "./AdminTechStats";
import StoreCTRCard from "./StoreCTRCard";
import CategoryDealViewsCard from "./CategoryDealViewsCard";



export default function AdminAnalyticsV2() {
  const [start, setStart] = useState("2025-12-30");
  const [end, setEnd] = useState("2026-01-06");
  const [limit, setLimit] = useState(20);

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `/api/admin/analytics?start=${start}&end=${end}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          throw new Error("Failed to load analytics");
        }

        const json = await res.json();
        setData(json);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [start, end]);

  return (
    <div className="space-y-8">
      {/* Global date + limit filter */}
      <DateRangeFilter
        start={start}
        end={end}
        limit={limit}
        onChange={(s, e, l) => {
          setStart(s);
          setEnd(e);
          setLimit(l);
        }}
      />

      {loading && (
        <div className="text-sm text-slate-500">Loading analytics…</div>
      )}

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      {!loading && !error && data && (
        <>
          {/* KPI summary */}
          <AnalyticsSummary data={data} />

          {/* Top viewed deals */}
          <TopViewedDeals deals={data.top_viewed_deals} />

          {/* Top outbound clicked deals */}
          <TopOutboundDeals deals={data.top_outbound_deals} />
          
<CategoryDealViewsCard
 rows={data.category_ctr_stats || []}
/>
<StoreCTRCard items={data.store_ctr_stats || []} />


          {/* Tech stats */}
          <AdminTechStats data={data} />
        </>
      )}
    </div>
  );
}
