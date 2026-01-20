"use client";

import { useEffect, useState } from "react";

export default function SocialSimulatePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    const res = await fetch("/api/social/simulate", { cache: "no-store" });
    const json = await res.json();
    setData(json);
    setLoading(false);
  }

  useEffect(() => {
    run();
  }, []);

  if (!data) return <div className="p-6">Loading simulation…</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-blue-600">
          Social Scheduler Simulation (Dry Run)
        </h1>
        <button
          onClick={run}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Running..." : "Run Again"}
        </button>
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="text-lg font-semibold mb-2">Decision Context</h2>
        <pre className="text-sm whitespace-pre-wrap">
{JSON.stringify({
  quietHoursActive: data.quietHoursActive,
  estHour: data.estHour,
  window: data.window,
  allowedStores: data.allowedStores,
  affiliateOnly: data.affiliateOnly,
  ratioEnabled: data.ratioEnabled,
  ratioStats: data.ratioStats,
  eligibleCount: data.eligibleCount,
}, null, 2)}
        </pre>
      </div>

      <div className="bg-white border rounded p-4">
        <h2 className="text-lg font-semibold mb-2">Selected Deal</h2>
        {!data.selected ? (
          <div className="text-gray-600">No deal selected.</div>
        ) : (
          <pre className="text-sm whitespace-pre-wrap">
{JSON.stringify(data.selected, null, 2)}
          </pre>
        )}

        <h3 className="font-semibold mt-4">Reasons</h3>
        <ul className="list-disc ml-6 text-sm text-gray-700">
          {(data.reasons ?? []).map((r: string, i: number) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </div>

      {data.flyers && (
        <div className="bg-white border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Flyer Preview</h2>
          <div className="flex flex-wrap gap-4">
            <img
              src={`data:image/jpeg;base64,${data.flyers.portrait}`}
              width={260}
            />
            <img
              src={`data:image/jpeg;base64,${data.flyers.square}`}
              width={260}
            />
            <img
              src={`data:image/jpeg;base64,${data.flyers.story}`}
              width={200}
            />
          </div>
        </div>
      )}

      {data.captions && (
        <div className="bg-white border rounded p-4 space-y-4">
          <h2 className="text-lg font-semibold">Captions</h2>
          <div>
            <h3 className="font-semibold">Facebook</h3>
            <pre className="text-sm whitespace-pre-wrap">{data.captions.facebook?.text ?? ""}</pre>
          </div>
          <div>
            <h3 className="font-semibold">Instagram</h3>
            <pre className="text-sm whitespace-pre-wrap">{data.captions.instagram?.text ?? ""}</pre>
          </div>
          <div>
            <h3 className="font-semibold">Telegram</h3>
            <pre className="text-sm whitespace-pre-wrap">{data.captions.telegram?.text ?? ""}</pre>
          </div>
          <div>
            <h3 className="font-semibold">X</h3>
            <pre className="text-sm whitespace-pre-wrap">{data.captions.x?.text ?? ""}</pre>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        This is a dry run. Nothing is posted to social platforms.
      </div>
    </div>
  );
}
