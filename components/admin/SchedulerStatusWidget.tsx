"use client";

import { useEffect, useState } from "react";

export default function SchedulerStatusWidget() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [platforms, setPlatforms] = useState<any>(null);
  const [message, setMessage] = useState("");

  async function load() {
    setLoading(true);

    const res1 = await fetch("/api/auto-publish-status");
    const res2 = await fetch("/api/auto-publish-platforms");

    const s1 = await res1.json();
    const s2 = await res2.json();

    setStatus(s1);
    setPlatforms(s2);

    setLoading(false);
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 10_000); // auto-refresh every 10s
    return () => clearInterval(timer);
  }, []);

  async function action(type: string) {
    setMessage("");

    if (type === "publish_deals") {
      await fetch("/api/publish-random", {
        method: "POST",
        body: JSON.stringify({ count: 1 }),
      });
      setMessage("✅ Deals published now");
    }

    if (type === "publish_social") {
      await fetch("/api/social/hourly", { method: "POST" });
      setMessage("📣 Social post published now");
    }

    if (type === "skip_next") {
      await fetch("/api/auto-publish-action", {
        method: "POST",
        body: JSON.stringify({ action: "skip_next" }),
      });
      setMessage("⏭️ Skipped next cycle");
    }

    if (type === "reset") {
      await fetch("/api/auto-publish-action", {
        method: "POST",
        body: JSON.stringify({ action: "reset" }),
      });
      setMessage("🔄 Scheduler reset");
    }

    load();
  }

  if (loading) {
    return <div className="p-4 bg-white rounded shadow">Loading scheduler...</div>;
  }

  return (
    <div className="p-6 bg-white border rounded shadow mt-6 space-y-4">
      <h2 className="text-2xl font-semibold text-blue-600">
        Scheduler Status
      </h2>

      {message && <div className="p-2 bg-green-100 text-green-700 rounded">{message}</div>}

      {/* DEAL PUBLISH STATUS */}
      <div className="border p-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">🔥 Deals Auto-Publish</h3>

        <p className="text-sm text-gray-700">
          <strong>Enabled:</strong> {status.enabled ? "Yes" : "No"}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Last Run:</strong>{" "}
          {status.last_run ? new Date(status.last_run).toLocaleString() : "Never"}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Next Run:</strong>{" "}
          {status.next_run ? new Date(status.next_run).toLocaleString() : "Not Scheduled"}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Deals Last Published:</strong> {status.last_count ?? 0}
        </p>

        <button
          onClick={() => action("publish_deals")}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Publish Deals Now
        </button>
      </div>

      {/* SOCIAL POST STATUS */}
      <div className="border p-4 rounded-md">
        <h3 className="text-lg font-semibold mb-2">📣 Social Auto-Posting</h3>

        <p className="text-sm text-gray-700">
          <strong>Enabled:</strong> {status.social_enabled ? "Yes" : "No"}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Last Social Run:</strong>{" "}
          {status.social_last_run
            ? new Date(status.social_last_run).toLocaleString()
            : "Never"}
        </p>
        <p className="text-sm text-gray-700">
          <strong>Next Social Run:</strong>{" "}
          {status.social_next_run
            ? new Date(status.social_next_run).toLocaleString()
            : "Not Scheduled"}
        </p>

        <p className="text-sm text-gray-700">
          <strong>Last Posted Deal:</strong>{" "}
          {status.social_last_deal ? `#${status.social_last_deal}` : "None"}
        </p>

        <p className="text-sm text-gray-700 mb-2">
          <strong>Platforms:</strong>{" "}
          {platforms
            ? Object.entries(platforms)
                .filter(([k, v]) => ["x", "telegram", "facebook", "instagram"].includes(k))
                .map(([k, v]) => (v ? k : null))
                .filter(Boolean)
                .join(", ") || "None enabled"
            : "Loading..."}
        </p>

        <button
          onClick={() => action("publish_social")}
          className="mt-3 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Publish Social Now
        </button>
      </div>

      {/* ADVANCED ACTIONS */}
      <div className="border p-4 rounded-md bg-gray-50">
        <h3 className="text-lg font-semibold mb-2">⚙️ Advanced</h3>

        <div className="flex gap-4">
          <button
            onClick={() => action("skip_next")}
            className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Skip Next Cycle
          </button>

          <button
            onClick={() => action("reset")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reset Scheduler
          </button>
        </div>
      </div>
    </div>
  );
}
