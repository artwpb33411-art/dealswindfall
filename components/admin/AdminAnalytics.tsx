"use client";

import { useEffect, useState } from "react";

export default function AdminAnalytics() {
  const [rows, setRows] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/list")
      .then((r) => r.json())
      .then((data) => setRows(data || []))
      .finally(() => setLoading(false));
  }, []);

  const filtered = rows.filter((row: any) =>
    row.event_type?.toLowerCase().includes(filter.toLowerCase()) ||
    row.page?.toLowerCase().includes(filter.toLowerCase()) ||
    row.referrer?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Website Analytics</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search events, pages, referrers..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="border px-3 py-2 rounded w-full md:w-1/3"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Total Events" value={rows.length} />
        <SummaryCard
          title="Clicks"
          value={rows.filter((r: any) => r.event_type === "click").length}
        />
        <SummaryCard
          title="Page Views"
          value={rows.filter((r: any) => r.event_type === "page_view").length}
        />
        <SummaryCard
          title="Unique Referrers"
          value={new Set(rows.map((r: any) => r.referrer).filter(Boolean)).size}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border rounded-lg">
          <thead className="bg-gray-100 text-left">
            <tr>
              <Th text="Event" />
              <Th text="Page" />
              <Th text="Referrer" />
              <Th text="UTM" />
              <Th text="Device" />
              <Th text="Time" />
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={6} className="p-6 text-center">
                  Loading...
                </td>
              </tr>
            )}

            {!loading &&
              filtered.map((row: any) => (
                <tr key={row.id} className="border-t hover:bg-gray-50">
                  <td className="p-2 capitalize">{row.event_type}</td>
                  <td className="p-2">{row.page}</td>
                  <td className="p-2">{row.referrer || "Direct"}</td>
                  <td className="p-2">
                    {row.utm_source || row.utm_campaign
                      ? `${row.utm_source || ""} ${row.utm_campaign || ""}`
                      : "-"}
                  </td>
                  <td className="p-2">{formatDevice(row.user_agent)}</td>
                  <td className="p-2">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Components ---

function SummaryCard({ title, value }) {
  return (
    <div className="p-4 border rounded-lg shadow bg-white">
      <div className="text-gray-600 text-sm">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function Th({ text }) {
  return <th className="border p-2 font-medium">{text}</th>;
}

function formatDevice(ua = "") {
  if (!ua) return "-";
  if (/mobile/i.test(ua)) return "Mobile";
  if (/tablet/i.test(ua)) return "Tablet";
  return "Desktop";
}
