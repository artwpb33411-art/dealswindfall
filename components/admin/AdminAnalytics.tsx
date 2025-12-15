"use client";

import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";

// Normalize store/category keys to avoid Macy’s vs Macy's issues
const normalize = (s: string | null | undefined) =>
  (s || "").trim().replace(/’/g, "'");

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [start, setStart] = useState(
    format(subDays(new Date(), 7), "yyyy-MM-dd")
  );
  const [end, setEnd] = useState(format(new Date(), "yyyy-MM-dd"));


  const SimpleTable = ({
  title,
  data,
}: {
  title: string;
  data: Record<string, number>;
}) => {
  const rows = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);

  if (!rows.length)
    return (
      <div className="bg-white p-4 border rounded shadow">
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-gray-500 text-sm">No data available.</p>
      </div>
    );

  return (
    <div className="bg-white p-4 border rounded shadow">
      <h3 className="font-semibold mb-3">{title}</h3>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border text-left">Type</th>
            <th className="p-2 border text-left">Count</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([key, count]) => (
            <tr key={key}>
              <td className="p-2 border">{key || "(unknown)"}</td>
              <td className="p-2 border font-semibold">{count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

  /* ------------------------------------------------------------------
     LOAD ANALYTICS
  ------------------------------------------------------------------ */
  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?start=${start}&end=${end}`);
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error("Analytics load error:", e);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  /* ------------------------------------------------------------------
     PRESET DATE RANGE BUTTONS
  ------------------------------------------------------------------ */
  const applyPreset = (days: number) => {
    const endDate = new Date();
    const startDate = subDays(endDate, days);

    setStart(format(startDate, "yyyy-MM-dd"));
    setEnd(format(endDate, "yyyy-MM-dd"));
    loadStats();
  };

  const applyMonthPreset = (type: "this" | "last") => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    let startDate: Date, endDate: Date;

    if (type === "this") {
      startDate = new Date(year, month, 1);
      endDate = new Date();
    } else {
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    }

    setStart(format(startDate, "yyyy-MM-dd"));
    setEnd(format(endDate, "yyyy-MM-dd"));
    loadStats();
  };

  const applyAllTime = () => {
    setStart("2000-01-01");
    setEnd(format(new Date(), "yyyy-MM-dd"));
    loadStats();
  };

  if (!stats || loading) return <p className="p-6">Loading analytics...</p>;

  /* ------------------------------------------------------------------
     SMALL SUB-COMPONENTS
  ------------------------------------------------------------------ */

  const Card = ({ label, value }: { label: string; value: number }) => (
    <div className="p-4 bg-white rounded shadow border text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-blue-600">{value ?? 0}</p>
    </div>
  );

  const StoreTable = ({ stats }: any) => {
    const stores = Array.from(
      new Set([
        ...Object.keys(stats.store_deal_counts || {}),
        ...Object.keys(stats.store_clicks || {}),
        ...Object.keys(stats.store_ctr || {}),
      ])
    )
      .map(normalize)
      .sort();

    if (!stores.length)
      return <p className="text-gray-500 mt-2">No store data.</p>;

    return (
      <table className="w-full mt-3 text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left border">Store</th>
            <th className="p-2 text-left border">Deals Published</th>
            <th className="p-2 text-left border">Clicks</th>
            <th className="p-2 text-left border">CTR</th>
          </tr>
        </thead>
        <tbody>
          {stores.map((store) => {
            const key = normalize(store);
            const deals = stats.store_deal_counts?.[key] || 0;
            const clicks = stats.store_clicks?.[key] || 0;
            const ctrRaw = stats.store_ctr?.[key] || 0;
            const ctr = (ctrRaw * 100).toFixed(1) + "%";

            return (
              <tr key={key} className="border">
                <td className="p-2 border">{key || "(unknown)"}</td>
                <td className="p-2 border">{deals}</td>
                <td className="p-2 border">{clicks}</td>
                <td className="p-2 border">{ctr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const CategoryTable = ({ stats }: any) => {
    const cats = Array.from(
      new Set([
        ...Object.keys(stats.category_deal_counts || {}),
        ...Object.keys(stats.category_clicks || {}),
        ...Object.keys(stats.category_ctr || {}),
      ])
    )
      .map(normalize)
      .sort();

    if (!cats.length)
      return <p className="text-gray-500 mt-2">No category data.</p>;

    return (
      <table className="w-full mt-3 text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left border">Category</th>
            <th className="p-2 text-left border">Deals Published</th>
            <th className="p-2 text-left border">Clicks</th>
            <th className="p-2 text-left border">CTR</th>
          </tr>
        </thead>
        <tbody>
          {cats.map((cat) => {
            const key = normalize(cat);
            const deals = stats.category_deal_counts?.[key] || 0;
            const clicks = stats.category_clicks?.[key] || 0;
            const ctrRaw = stats.category_ctr?.[key] || 0;
            const ctr = (ctrRaw * 100).toFixed(1) + "%";

            return (
              <tr key={key} className="border">
                <td className="p-2 border">{key || "(unknown)"}</td>
                <td className="p-2 border">{deals}</td>
                <td className="p-2 border">{clicks}</td>
                <td className="p-2 border">{ctr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  const TopDealsTable = ({
    title,
    deals,
  }: {
    title: string;
    deals: any[];
  }) => {
    if (!deals || deals.length === 0)
      return (
        <div className="bg-white rounded border shadow p-4">
          <h3 className="text-lg font-semibold mb-2">{title}</h3>
          <p className="text-gray-500 text-sm">No data for this range.</p>
        </div>
      );

    return (
      <div className="bg-white rounded border shadow p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border text-left">#</th>
              <th className="p-2 border text-left">Deal</th>
              <th className="p-2 border text-left">Store</th>
              <th className="p-2 border text-left">Category</th>
              <th className="p-2 border text-left">Clicks</th>
              <th className="p-2 border text-left">Link</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((d, idx) => (
              <tr key={d.deal_id} className="border">
                <td className="p-2 border">{idx + 1}</td>
                <td className="p-2 border">
                  {d.description || `Deal #${d.deal_id}`}
                </td>
                <td className="p-2 border">
                  {d.store_name || "(unknown)"}
                </td>
                <td className="p-2 border">
                  {d.category || "(unknown)"}
                </td>
                <td className="p-2 border font-semibold">{d.clicks}</td>
                <td className="p-2 border">
                  {d.internal_url && (
                    <a
                      href={d.internal_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  /* ------------------------------------------------------------------
     RENDER UI
  ------------------------------------------------------------------ */

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-bold text-blue-600">📊 Website Analytics</h2>

      {/* DATE RANGE */}
      <div className="bg-white p-4 rounded border shadow space-y-4">
        <h3 className="font-semibold text-lg">Date Range</h3>

        <div className="flex flex-wrap gap-2">
          <button
            className="px-3 py-1 bg-gray-100 border rounded"
            onClick={() => applyPreset(0)}
          >
            Today
          </button>
          <button
            className="px-3 py-1 bg-gray-100 border rounded"
            onClick={() => applyPreset(7)}
          >
            Last 7 Days
          </button>
          <button
            className="px-3 py-1 bg-gray-100 border rounded"
            onClick={() => applyPreset(30)}
          >
            Last 30 Days
          </button>
          <button
            className="px-3 py-1 bg-gray-100 border rounded"
            onClick={() => applyMonthPreset("this")}
          >
            This Month
          </button>
          <button
            className="px-3 py-1 bg-gray-100 border rounded"
            onClick={() => applyMonthPreset("last")}
          >
            Last Month
          </button>
          <button
            className="px-3 py-1 bg-gray-100 border rounded"
            onClick={applyAllTime}
          >
            All Time
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className="font-semibold text-sm">Start</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="ml-2 border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="font-semibold text-sm">End</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="ml-2 border rounded px-2 py-1"
            />
          </div>

          <button
            onClick={loadStats}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Load
          </button>
        </div>
      </div>

      {/* VISITOR CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card label="Unique Visitors" value={stats.unique_visitors} />
        <Card label="New Visitors" value={stats.new_visitors} />
        <Card label="Returning Visitors" value={stats.returning_visitors} />
        <Card label="Page Views" value={stats.total_page_views} />
      </div>

      {/* ACTIVITY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card label="Deal Clicks" value={stats.total_deal_clicks} />
        <Card label="Outbound Clicks" value={stats.total_outbound_clicks} />
        <Card label="Total Events" value={stats.total_events} />
      </div>

      {/* STORE PERFORMANCE */}
      <section className="bg-white rounded border shadow p-4">
        <h3 className="text-xl font-semibold">
          Store Performance (Clicks & CTR)
        </h3>
        <StoreTable stats={stats} />
      </section>

      {/* CATEGORY PERFORMANCE */}
      <section className="bg-white rounded border shadow p-4">
        <h3 className="text-xl font-semibold">
          Category Performance (Clicks & CTR)
        </h3>
        <CategoryTable stats={stats} />
      </section>

      {/* TOP DEALS - INTERNAL & OUTBOUND */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopDealsTable
          title="Top 20 Clicked Deals (On Site)"
          deals={stats.top_internal_deals}
        />
        <TopDealsTable
          title="Top 20 Outbound Clicked Deals"
          deals={stats.top_outbound_deals}
        />
      </div>
   {/* TECHNOLOGY OVERVIEW */}
<section className="space-y-6">
  <h3 className="text-2xl font-bold text-blue-600">
    🖥️ Technology Overview
  </h3>

  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <SimpleTable
      title="Device Types"
      data={stats.device_types}
    />

    <SimpleTable
      title="Operating Systems"
      data={stats.operating_systems}
    />

    <SimpleTable
      title="Browsers"
      data={stats.browsers}
    />

    <SimpleTable
      title="Screen Sizes"
      data={stats.screen_sizes}
    />
  </div>
</section>

     </div>

     
  );

  
}
