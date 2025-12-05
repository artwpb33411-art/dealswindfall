"use client";

import { useEffect, useState } from "react";

export default function AutoPublishSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [settings, setSettings] = useState({
    deals_per_cycle: 3,
    interval_minutes: 120,
    enabled: true,
  });

  // Load settings from API
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/auto-publish-settings");
        const data = await res.json();

        if (res.ok && data) {
          setSettings(data);
        } else {
          setMessage("⚠️ Failed to load settings");
        }
      } catch (err) {
        console.error(err);
        setMessage("⚠️ Could not load settings");
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  // Save settings
  async function saveSettings() {
    setSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/auto-publish-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Settings saved successfully");
      } else {
        setMessage(`❌ ${data.error || "Failed to save settings"}`);
      }
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-white border rounded-md shadow">
        Loading auto-publish settings...
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border rounded-md shadow mt-6">
      <h2 className="text-2xl font-semibold text-blue-600 mb-4">
        Auto-Publish Settings
      </h2>

      {message && (
        <p className="mb-4 text-sm">
          {message}
        </p>
      )}

      <div className="space-y-4">
        {/* Enabled Toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.enabled}
            onChange={(e) =>
              setSettings({ ...settings, enabled: e.target.checked })
            }
            className="w-5 h-5"
          />
          <span className="text-gray-700 font-medium">
            Enable Auto-Publishing
          </span>
        </label>

        {/* Deals per cycle */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Number of deals published each cycle
          </label>
          <input
            type="number"
            min="1"
            className="border p-2 rounded w-40"
            value={settings.deals_per_cycle}
            onChange={(e) =>
              setSettings({
                ...settings,
                deals_per_cycle: Number(e.target.value),
              })
            }
          />
        </div>

        {/* Interval minutes */}
        <div>
          <label className="block mb-1 font-medium text-gray-700">
            Interval (minutes)
          </label>
          <input
            type="number"
            min="1"
            className="border p-2 rounded w-40"
            value={settings.interval_minutes}
            onChange={(e) =>
              setSettings({
                ...settings,
                interval_minutes: Number(e.target.value),
              })
            }
          />
        </div>
      </div>

      <button
        onClick={saveSettings}
        disabled={saving}
        className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
