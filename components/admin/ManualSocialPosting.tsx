"use client";

import { useEffect, useState } from "react";

type Deal = {
  id: number;
  description: string | null;
  store_name: string | null;
  published_at: string;
};

export default function ManualSocialPosting() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [postingId, setPostingId] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function loadDeals() {
      try {
        const res = await fetch("/api/admin/latest-deals");
        const data = await res.json();
        setDeals(data ?? []);
      } catch {
        setDeals([]);
      } finally {
        setLoading(false);
      }
    }

    loadDeals();
  }, []);

  async function postNow(dealId: number) {
    setPostingId(dealId);
    setMessage("");

    try {
      const res = await fetch("/api/social/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deal_id: dealId }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(`✅ Deal ${dealId} posted successfully`);
      } else {
        setMessage(`❌ ${data.error || "Failed to post deal"}`);
      }
    } catch {
      setMessage("❌ Network error while posting");
    } finally {
      setPostingId(null);
      setTimeout(() => setMessage(""), 4000);
    }
  }

  return (
    <div className="p-6 bg-white border rounded shadow h-full">
      <h2 className="text-2xl font-semibold text-blue-600 mb-4">
        Manual Social Posting
      </h2>

      <p className="text-sm text-gray-600 mb-4">
        Post a deal immediately to social platforms.
        This bypasses scheduling and quiet hours.
      </p>

      {message && (
        <div className="mb-3 text-sm text-blue-700 bg-blue-50 p-2 rounded">
          {message}
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading recent deals…</p>
      ) : deals.length === 0 ? (
        <p className="text-gray-500">No recent deals found.</p>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-auto">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="flex items-center justify-between border rounded p-3 hover:bg-gray-50"
            >
              <div>
                <div className="font-medium text-gray-800">
                  {deal.description || "Untitled deal"}
                </div>
                <div className="text-xs text-gray-500">
                  {deal.store_name} ·{" "}
                  {new Date(deal.published_at).toLocaleString()}
                </div>
              </div>

              <button
                onClick={() => postNow(deal.id)}
                disabled={postingId === deal.id}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
              >
                {postingId === deal.id ? "Posting…" : "Post Now"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
