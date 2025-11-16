"use client";
import { useEffect, useState } from "react";

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => r.json())
      .then((data) => setStats(data));
  }, []);

  if (!stats) return <p className="p-6">Loading analytics...</p>;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-bold">Website Analytics</h2>

      <div className="border rounded p-4 bg-white shadow">
        <h3 className="font-semibold mb-2">Total Events</h3>
        <p>{stats.total_events}</p>
      </div>

      <div className="border rounded p-4 bg-white shadow">
        <h3 className="font-semibold mb-2">Events by Type</h3>
        <ul>
          {Object.entries(stats.event_type_counts).map(([key, value]) => (
            <li key={key}>
              {key}: {value}
            </li>
          ))}
        </ul>
      </div>

      <div className="border rounded p-4 bg-white shadow">
        <h3 className="font-semibold mb-2">Top Pages</h3>
        <ul>
          {Object.entries(stats.page_counts).map(([page, count]) => (
            <li key={page}>
              {page || "(empty)"}: {count}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
