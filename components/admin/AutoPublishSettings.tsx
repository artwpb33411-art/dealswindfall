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
  { label: "Every 2 hours", value: 120 },
  { label: "Every 6 hours", value: 360 },
  { label: "Every 12 hours", value: 720 },
  { label: "Every 24 hours", value: 1440 },
];

const SOCIAL_INTERVAL_OPTIONS = [
  { label: "Every 10 minutes", value: 10 },
  { label: "Every 15 minutes", value: 15 },
  { label: "Every 30 minutes", value: 30 },
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
  "Sam’s Club",
  "Lowe’s",
  "Kohl’s",
  "Macy’s",
  "Staples",
  "Office Depot",
  "JCPenney",
  "eBay",
  "Dell",
  "Woot",
  "HP",
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
    social_affiliate_only: false, // 👈 add this
  });

  // LOAD SETTINGS  
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/auto-publish-settings");
        const data = await res.json();
        if (res.ok) {
          setSettings(data);
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
   Prioritize affiliate deals when posting
  </span>
</label>

<p className="text-sm text-gray-500 ml-12 mb-4">
  When enabled, social auto-posting will only publish deals
  with affiliate links.
</p>


      </div>

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
