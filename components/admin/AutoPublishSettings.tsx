"use client";

import { useEffect, useState } from "react";
import ManualSocialPosting from "@/components/admin/ManualSocialPosting";

const DEAL_INTERVAL_OPTIONS = [
   { label: "Every 1 minutes", value: 1 },
  { label: "Every 2 minutes", value: 2 },
  { label: "Every 5 minutes", value: 5 },
  { label: "Every 10 minutes", value: 10 },
  { label: "Every 15 minutes", value: 15 },
  { label: "Every 30 minutes", value: 30 },
  { label: "Every 1 hour", value: 60 },
    { label: "Every 1.5 hours", value: 90 },
  { label: "Every 2 hours", value: 120 },
  { label: "Every 6 hours", value: 360 },
  { label: "Every 12 hours", value: 720 },
  { label: "Every 24 hours", value: 1440 },
];

const SOCIAL_INTERVAL_OPTIONS = [
  { label: "Every 10 minutes", value: 10 },
  { label: "Every 15 minutes", value: 15 },
  { label: "Every 30 minutes", value: 30 },
  { label: "Every 45 minutes", value: 45 },
  { label: "Every 1 hour", value: 60 },
  { label: "Every 1.5 hours", value: 90 },
  { label: "Every 2 hours", value: 120 },
  { label: "Every 4 hours", value: 240 },
  { label: "Every 6 hours", value: 360 },
  { label: "Every 12 hours", value: 720 },
];

const ALL_STORES = [
  "Amazon",
  "Walmart",
  "Target",
  "Home Depot",
  "Costco",
  "Best Buy",
  "Sam's Club",
  "Kohl's",
  "Macy's",
  "Staples",
  "Office Depot",
  "eBay",
  "Dell",
  "Woot",
  "HP",
  "T.J.Maxx.",
];




export default function AutoPublishSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [settings, setSettings] = useState({
  enabled: true,
  deals_per_cycle: 6,
  interval_minutes: 60,

  social_enabled: true,
  social_interval_minutes: 60,
  allowed_stores: ["Amazon", "Walmart"],
  social_affiliate_only: false,

  // ✅ ensure these are NEVER undefined
  social_enable_ratios: true,
  social_affiliate_ratio: 4,
  social_non_affiliate_ratio: 1,
  social_en_ratio: 3,
  social_es_ratio: 1,
  social_ratio_window_posts: 10,
});

const [ratioStats, setRatioStats] = useState<null | {
  windowPosts: number;
  total: number;
  affiliate: number;
  nonAffiliate: number;
  en: number;
  es: number;
  latest_posted_at: string | null;
}>(null);

const [statsLoading, setStatsLoading] = useState(false);
async function loadRatioStats() {
  setStatsLoading(true);
  try {
    const res = await fetch("/api/social/ratio-stats", { cache: "no-store" });
    const data = await res.json();
    if (res.ok) setRatioStats(data);
  } catch {
    // ignore preview errors
  }
  setStatsLoading(false);
}
  // LOAD SETTINGS  
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auto-publish-settings");
        const data = await res.json();
        if (res.ok) {
          setSettings(data);
          await loadRatioStats();

        } else {
          setMessage("⚠ Could not load settings.");
        }
      } catch (err) {
        setMessage("⚠ Network error loading settings.");
      }
      setLoading(false);
    }
    load();
  }, []);

  // SAVE SETTINGS
  async function save() {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/auto-publish-settings", {
        method: "POST",
        body: JSON.stringify(settings),
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Settings saved successfully.");
        loadRatioStats();

      } else {
        setMessage("❌ " + (data.error || "Failed to save."));
      }
    } catch (err: any) {
      setMessage("❌ " + err.message);
    }

    setSaving(false);
    setTimeout(() => setMessage(""), 4000);
  }

  // HANDLE STORE CHECKBOXES
  function toggleStore(store: string) {
    const selected = new Set(settings.allowed_stores);

    if (selected.has(store)) {
      selected.delete(store);
    } else {
      selected.add(store);
    }

    setSettings({ ...settings, allowed_stores: [...selected] });
  }

  if (loading) {
    return <div className="p-4 bg-white shadow rounded">Loading...</div>;
  }

  return (

    <div className="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
<div className="h-full">

    <div className="p-6 bg-white border rounded shadow mt-6">
      <h2 className="text-2xl font-semibold text-blue-600 mb-4">
        Auto-Publish Settings
      </h2>

      {message && <div className="mb-4 text-gray-700">{message}</div>}

      {/* DEALS AUTO-PUBLISH TOGGLE */}
      <label className="flex items-center gap-3 mb-4">
        <input
          type="checkbox"
          checked={settings.enabled}
          onChange={(e) =>
            setSettings({ ...settings, enabled: e.target.checked })
          }
        />
        <span className="font-medium">Enable Deals Auto-Publishing</span>
      </label>

      {/* DEALS PER CYCLE */}
     <div className="mb-4 text-sm text-gray-600">
  Auto-publish releases <strong>one deal per cycle</strong> to ensure
  quality, diversity, and SEO stability.
</div>


      {/* DEALS INTERVAL */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">
          Deals Auto-Publish Interval
        </label>
        <select
          value={settings.interval_minutes}
          onChange={(e) =>
            setSettings({
              ...settings,
              interval_minutes: Number(e.target.value),
            })
          }
          className="border rounded p-2 w-60"
        >
          {DEAL_INTERVAL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <hr className="my-6" />

      {/* SOCIAL AUTOPOST TOGGLE */}
      <label className="flex items-center gap-3 mb-4">
        <input
          type="checkbox"
          checked={settings.social_enabled}
          onChange={(e) =>
            setSettings({ ...settings, social_enabled: e.target.checked })
          }
        />
        <span className="font-medium">Turns social auto-posting completely on or off.
  Quiet Hours and scheduling still apply when enabled.</span>
      </label>

      {/* SOCIAL INTERVAL */}
      <div className="mb-6">
        <label className="block mb-1 font-medium">
          Social Posting Interval
        </label>
        <select
          value={settings.social_interval_minutes}
          onChange={(e) =>
            setSettings({
              ...settings,
              social_interval_minutes: Number(e.target.value),
            })
          }
          className="border rounded p-2 w-60"
        >
          {SOCIAL_INTERVAL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

<label className="flex items-center gap-3 mb-1 ml-6">
  <input
    type="checkbox"
    checked={!!settings.social_affiliate_only}
    onChange={(e) =>
      setSettings({
        ...settings,
        social_affiliate_only: e.target.checked,
      })
    }
  />
  <span className="text-sm font-medium">
  Affiliate-only mode
  </span>
</label>

<p className="text-sm text-gray-500 ml-12 mb-4">
 When enabled, automation will post only affiliate deals (falls back to all deals if none found, unless Strict mode is enabled).
</p>


      </div>
<hr className="my-6" />

{/* SOCIAL RATIO CONTROLS */}
{settings.social_enabled && (
  <div className="mb-6">
    <h3 className="text-lg font-semibold text-gray-800 mb-3">
      Social Content Distribution
    </h3>

    {/* Enable Ratios */}
    <label className="flex items-center gap-3 mb-4">
      <input
        type="checkbox"
        checked={settings.social_enable_ratios}
        onChange={(e) =>
          setSettings({
            ...settings,
            social_enable_ratios: e.target.checked,
          })
        }
      />
      <span className="font-medium">
        Enforce content ratios automatically
      </span>
    </label>

    {/* Affiliate Ratio */}
    <div className="mb-4 ml-6">
      <label className="block font-medium mb-1">
        Affiliate vs Non-Affiliate
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={settings.social_affiliate_ratio}
          onChange={(e) =>
            setSettings({
              ...settings,
              social_affiliate_ratio: Number(e.target.value),
            })
          }
          className="border rounded p-2 w-20"
        />
        <span>:</span>
        <input
          type="number"
          min={0}
          value={settings.social_non_affiliate_ratio}
          onChange={(e) =>
            setSettings({
              ...settings,
              social_non_affiliate_ratio: Number(e.target.value),
            })
          }
          className="border rounded p-2 w-20"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Example: 4:1 means 4 affiliate posts for every 1 non-affiliate
      </p>
    </div>

    {/* Language Ratio */}
    <div className="mb-4 ml-6">
      <label className="block font-medium mb-1">
        English vs Spanish
      </label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={0}
          value={settings.social_en_ratio}
          onChange={(e) =>
            setSettings({
              ...settings,
              social_en_ratio: Number(e.target.value),
            })
          }
          className="border rounded p-2 w-20"
        />
        <span>:</span>
        <input
          type="number"
          min={0}
          value={settings.social_es_ratio}
          onChange={(e) =>
            setSettings({
              ...settings,
              social_es_ratio: Number(e.target.value),
            })
          }
          className="border rounded p-2 w-20"
        />
      </div>
    </div>

    {/* Ratio Window */}
    <div className="mb-4 ml-6">
      <label className="block font-medium mb-1">
        Ratio Evaluation Window
      </label>
      <input
        type="number"
        min={1}
        value={settings.social_ratio_window_posts}
        onChange={(e) =>
          setSettings({
            ...settings,
            social_ratio_window_posts: Number(e.target.value),
          })
        }
        className="border rounded p-2 w-24"
      />
      <p className="text-xs text-gray-500 mt-1">
        Number of recent social posts used to balance ratios
      </p>
    </div>
  </div>
)}

{/* LIVE RATIO PREVIEW */}
{settings.social_enabled && (
  <div className="mb-6 border rounded p-4 bg-gray-50">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold text-gray-800">
        Live Ratio Preview (Auto Posts)
      </h3>

      <button
        type="button"
        onClick={loadRatioStats}
        disabled={statsLoading}
        className="text-sm px-3 py-1 rounded border bg-white hover:bg-gray-100 disabled:opacity-50"
      >
        {statsLoading ? "Refreshing..." : "Refresh"}
      </button>
    </div>

    {!ratioStats ? (
      <p className="text-sm text-gray-500 mt-2">
        No preview data yet.
      </p>
    ) : (
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border rounded p-3">
          <div className="text-sm text-gray-600">
            Window (last {ratioStats.windowPosts} log rows)
          </div>
          <div className="text-sm text-gray-600">
            Total rows: <strong>{ratioStats.total}</strong>
          </div>
          {ratioStats.latest_posted_at && (
            <div className="text-xs text-gray-500 mt-1">
              Latest: {new Date(ratioStats.latest_posted_at).toLocaleString()}
            </div>
          )}
        </div>

        <div className="bg-white border rounded p-3">
          <div className="text-sm font-medium text-gray-800 mb-2">
            Distribution
          </div>

          <div className="text-sm text-gray-700">
            Affiliate: <strong>{ratioStats.affiliate}</strong>{" "}
            <span className="text-gray-500">
              (
              {ratioStats.total > 0
                ? Math.round((ratioStats.affiliate / ratioStats.total) * 100)
                : 0}
              %)
            </span>
          </div>

          <div className="text-sm text-gray-700">
            Non-affiliate: <strong>{ratioStats.nonAffiliate}</strong>{" "}
            <span className="text-gray-500">
              (
              {ratioStats.total > 0
                ? Math.round(
                    (ratioStats.nonAffiliate / ratioStats.total) * 100
                  )
                : 0}
              %)
            </span>
          </div>

          <div className="mt-2 text-sm text-gray-700">
            English: <strong>{ratioStats.en}</strong>{" "}
            <span className="text-gray-500">
              (
              {ratioStats.total > 0
                ? Math.round((ratioStats.en / ratioStats.total) * 100)
                : 0}
              %)
            </span>
          </div>

          <div className="text-sm text-gray-700">
            Spanish: <strong>{ratioStats.es}</strong>{" "}
            <span className="text-gray-500">
              (
              {ratioStats.total > 0
                ? Math.round((ratioStats.es / ratioStats.total) * 100)
                : 0}
              %)
            </span>
          </div>
        </div>

        <div className="md:col-span-2 text-xs text-gray-500">
          Note: This preview counts the last N rows in <code>social_post_log</code>.
          Since you log one row per platform, totals represent log entries, not “runs”.
        </div>
      </div>
    )}
  </div>
)}


      {/* STORE PICKER */}
      <div className="mb-6">
        <label className="block mb-2 font-medium">Allowed Stores</label>
        <div className="grid grid-cols-2 gap-2">
          {ALL_STORES.map((s) => (
            <label key={s} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.allowed_stores.includes(s)}
                onChange={() => toggleStore(s)}
              />
              {s}
            </label>
          ))}
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div></div>
 {/* RIGHT COLUMN — Manual Posting */}
<div className="h-full p-6 bg-white border rounded shadow">
    <h2 className="text-2xl font-semibold text-blue-600 mb-4">
      Manual Social Posting
    </h2>

    <p className="text-sm text-gray-600 mb-4">
      Manually post a selected deal to social platforms.
      This bypasses scheduling and quiet hours.
    </p>

    {/* Placeholder for now */}
    <div className="text-gray-400 italic">
      <ManualSocialPosting />
    </div>
  </div>
</div>








  );
}
