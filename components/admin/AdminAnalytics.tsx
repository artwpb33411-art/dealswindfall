"use client";

import { useEffect, useState } from "react";
import { format, subDays } from "date-fns";

type AnalyticsStats = {
  total_events: number;
  unique_visitors: number;
  new_visitors: number;
  returning_visitors: number;
  total_page_views: number;
  total_deal_clicks: number;
  total_outbound_clicks: number;

  page_counts: Record<string, number>;
  store_clicks: Record<string, number>;
  category_clicks: Record<string, number>;
  deal_clicks: Record<string, number>;

  store_deal_counts: Record<string, number>;
  category_deal_counts: Record<string, number>;

  store_ctr: Record<string, number>;
  category_ctr: Record<string, number>;
};

export default function AdminAnalytics() {
  const today = new Date();
  const defaultStart = subDays(today, 7);

  const [start, setStart] = useState(format(defaultStart, "yyyy-MM-dd"));
  const [end, setEnd] = useState(format(today, "yyyy-MM-dd"));
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?start=${start}&end=${end}`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error("Failed to load analytics", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

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

  if (loading) return <p className="p-6">Loading analytics...</p>;
  if (!stats) return <p className="p-6">No analytics data for this range.</p>;

  return (
    <div className="p-6 space-y-10">
      <h2 className="text-2xl font-bold">📊 Website Analytics</h2>

      {/* DATE RANGE */}
      <div className="bg-white p-4 rounded border shadow space-y-4">
        <h3 className="text-lg font-semibold">Date Range</h3>

        <div className="flex flex-wrap gap-2">
          <PresetButton label="Today" onClick={() => applyPreset(0)} />
          <PresetButton label="Last 7 Days" onClick={() => applyPreset(7)} />
          <PresetButton label="Last 30 Days" onClick={() => applyPreset(30)} />
          <PresetButton
            label="This Month"
            onClick={() => applyMonthPreset("this")}
          />
          <PresetButton
            label="Last Month"
            onClick={() => applyMonthPreset("last")}
          />
          <PresetButton label="All Time" onClick={applyAllTime} />
        </div>

        <div className="flex items-center gap-4">
          <div>
            <label className="text-sm font-semibold">Start</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="ml-2 border rounded px-2 py-1"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">End</label>
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

      {/* VISITOR + CLICK SUMMARY */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard label="Unique Visitors" value={stats.unique_visitors} />
        <StatCard label="New Visitors" value={stats.new_visitors} />
        <StatCard label="Returning Visitors" value={stats.returning_visitors} />
        <StatCard label="Page Views" value={stats.total_page_views} />
        <StatCard label="Deal Clicks" value={stats.total_deal_clicks} />
        <StatCard label="Outbound Clicks" value={stats.total_outbound_clicks} />
      </div>

      {/* STORE PERFORMANCE */}
      <Section title="Store Performance (Clicks & CTR)">
        <StoreTable
          storeClicks={stats.store_clicks}
          storeDeals={stats.store_deal_counts}
          storeCTR={stats.store_ctr}
        />
      </Section>

      {/* CATEGORY PERFORMANCE */}
      <Section title="Category Performance (Clicks & CTR)">
        <CategoryTable
          categoryClicks={stats.category_clicks}
          categoryDeals={stats.category_deal_counts}
          categoryCTR={stats.category_ctr}
        />
      </Section>

      {/* DEAL PERFORMANCE */}
      <Section title="Top Deals (Clicks)">
        <SimpleTable data={stats.deal_clicks} col1="Deal ID" col2="Clicks" />
      </Section>

      {/* PAGE VIEWS */}
      <Section title="Top Pages (Views)">
        <SimpleTable data={stats.page_counts} col1="Page" col2="Views" />
      </Section>
    </div>
  );
}

/* ----------------- SMALL COMPONENTS ----------------- */

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border rounded p-4 shadow text-center">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-800">
        {value != null ? value : 0}
      </p>
    </div>
  );
}

function PresetButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 border rounded"
    >
      {label}
    </button>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded border shadow p-4 space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

function SimpleTable({
  data,
  col1,
  col2,
}: {
  data: Record<string, number>;
  col1: string;
  col2: string;
}) {
  if (!data || Object.keys(data).length === 0)
    return <p className="text-gray-500">No data</p>;

  const rows = Object.entries(data);

  return (
    <table className="min-w-full text-sm border">
      <thead>
        <tr className="border-b bg-gray-50">
          <th className="text-left p-2">{col1}</th>
          <th className="text-left p-2">{col2}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([key, value]) => (
          <tr key={key} className="border-b">
            <td className="p-2">{key}</td>
            <td className="p-2 font-semibold">{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StoreTable({
  storeClicks,
  storeDeals,
  storeCTR,
}: {
  storeClicks: Record<string, number>;
  storeDeals: Record<string, number>;
  storeCTR: Record<string, number>;
}) {
  const stores = Array.from(
    new Set([
      ...Object.keys(storeClicks || {}),
      ...Object.keys(storeDeals || {}),
      ...Object.keys(storeCTR || {}),
    ])
  );

  if (stores.length === 0)
    return <p className="text-gray-500">No store data</p>;

  return (
    <table className="min-w-full text-sm border">
      <thead>
        <tr className="border-b bg-gray-50">
          <th className="text-left p-2">Store</th>
          <th className="text-left p-2">Deals Published</th>
          <th className="text-left p-2">Clicks</th>
          <th className="text-left p-2">CTR</th>
        </tr>
      </thead>
      <tbody>
        {stores.map((store) => {
          const deals = storeDeals[store] || 0;
          const clicks = storeClicks[store] || 0;
          const ctrRaw = storeCTR[store] || 0;
          const ctr = (ctrRaw * 100).toFixed(1) + "%";
          return (
            <tr key={store} className="border-b">
              <td className="p-2">{store}</td>
              <td className="p-2">{deals}</td>
              <td className="p-2">{clicks}</td>
              <td className="p-2">{ctr}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function CategoryTable({
  categoryClicks,
  categoryDeals,
  categoryCTR,
}: {
  categoryClicks: Record<string, number>;
  categoryDeals: Record<string, number>;
  categoryCTR: Record<string, number>;
}) {
  const categories = Array.from(
    new Set([
      ...Object.keys(categoryClicks || {}),
      ...Object.keys(categoryDeals || {}),
      ...Object.keys(categoryCTR || {}),
    ])
  );

  if (categories.length === 0)
    return <p className="text-gray-500">No category data</p>;

  return (
    <table className="min-w-full text-sm border">
      <thead>
        <tr className="border-b bg-gray-50">
          <th className="text-left p-2">Category</th>
          <th className="text-left p-2">Deals Published</th>
          <th className="text-left p-2">Clicks</th>
          <th className="text-left p-2">CTR</th>
        </tr>
      </thead>
      <tbody>
        {categories.map((cat) => {
          const deals = categoryDeals[cat] || 0;
          const clicks = categoryClicks[cat] || 0;
          const ctrRaw = categoryCTR[cat] || 0;
          const ctr = (ctrRaw * 100).toFixed(1) + "%";
          return (
            <tr key={cat} className="border-b">
              <td className="p-2">{cat}</td>
              <td className="p-2">{deals}</td>
              <td className="p-2">{clicks}</td>
              <td className="p-2">{ctr}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
