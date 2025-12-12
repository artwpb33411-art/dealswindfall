"use client";

import { useEffect, useState } from "react";

export default function AutoPublishInventory() {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [remaining, setRemaining] = useState(0);
  const [intervalMinutes, setIntervalMinutes] = useState(60);
  const [dealsPerCycle, setDealsPerCycle] = useState(1);
  const [estimatedHours, setEstimatedHours] = useState<number | null>(null);

  async function load() {
    try {
      const res = await fetch("/api/admin/autopublish/inventory");
      const data = await res.json();

      if (res.ok) {
        setEnabled(data.enabled);
        setRemaining(data.remainingDrafts);
        setDealsPerCycle(data.deals_per_cycle);
        setIntervalMinutes(data.interval_minutes);
        setEstimatedHours(data.estimated_hours);
      }
    } catch (e) {
      console.error("Inventory fetch error", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return <div className="p-4 border rounded bg-white">Loading…</div>;
  }

  return (
    <div className="p-5 border rounded-lg bg-white shadow w-full">

      <h2 className="text-lg font-semibold text-blue-600 mb-2">
        Auto-Publish Inventory
      </h2>

      {!enabled && (
        <p className="text-red-600 font-medium mb-3">
          ⚠ Auto-Publishing is currently turned OFF.
        </p>
      )}

      <p className="text-gray-700">
        <strong>{remaining}</strong> deals remaining to be published.
      </p>

      <p className="text-gray-700">
        Publishes <strong>{dealsPerCycle}</strong> deal(s) every{" "}
        <strong>{intervalMinutes} minutes</strong>.
      </p>

      {estimatedHours !== null ? (
        <p className="text-gray-700 mt-2">
          Inventory will last approximately{" "}
          <strong>{estimatedHours.toFixed(1)} hours</strong>.
        </p>
      ) : (
        <p className="text-gray-500 mt-2 italic">No estimate available.</p>
      )}

      {remaining < dealsPerCycle * 2 && (
        <p className="text-red-600 font-semibold mt-3">
          ⚠ Very low inventory! Add more deals ASAP.
        </p>
      )}

      <button
        onClick={load}
        className="mt-4 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Refresh
      </button>
    </div>
  );
}
