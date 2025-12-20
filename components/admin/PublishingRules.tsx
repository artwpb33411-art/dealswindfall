"use client";

import { useEffect, useState } from "react";

type PublishingSettings = {
  bump_enabled: boolean;
  bump_cooldown_hours: number;
  max_bumps_per_deal: number | null;
  allow_bump_if_expired: boolean;
};

export default function PublishingRules() {
  const [settings, setSettings] = useState<PublishingSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  /* -------------------------------------------------------------
     Load settings
  ------------------------------------------------------------- */
  useEffect(() => {
    fetch("/api/admin/publishing-settings")
      .then(res => res.json())
      .then(setSettings)
      .catch(() => setMsg("❌ Failed to load settings"));
  }, []);

  if (!settings) {
    return <div className="text-sm text-gray-500">Loading publishing rules…</div>;
  }

  /* -------------------------------------------------------------
     Save settings
  ------------------------------------------------------------- */
  const save = async () => {
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/admin/publishing-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Save failed");
      setMsg("✅ Publishing rules updated");
    } catch (err: any) {
      setMsg("❌ " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white p-6 rounded shadow space-y-6">
      <h2 className="text-xl font-semibold text-blue-600">
        Publishing Rules
      </h2>

      {msg && <div className="text-sm">{msg}</div>}

      {/* Enable bumping */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.bump_enabled}
          onChange={e =>
            setSettings({ ...settings, bump_enabled: e.target.checked })
          }
        />
        Enable bumping existing deals
      </label>

      {/* Cooldown */}
      <div>
        <label className="text-sm font-medium">
          Bump cooldown (hours)
        </label>
        <input
          type="number"
          min={1}
          value={settings.bump_cooldown_hours}
          onChange={e =>
            setSettings({
              ...settings,
              bump_cooldown_hours: Number(e.target.value),
            })
          }
          className="input mt-1"
        />
      </div>

      {/* Max bumps */}
      <div>
        <label className="text-sm font-medium">
          Max bumps per deal (optional)
        </label>
        <input
          type="number"
          min={1}
          value={settings.max_bumps_per_deal ?? ""}
          onChange={e =>
            setSettings({
              ...settings,
              max_bumps_per_deal: e.target.value
                ? Number(e.target.value)
                : null,
            })
          }
          className="input mt-1"
          placeholder="Unlimited"
        />
      </div>

      {/* Expired */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={settings.allow_bump_if_expired}
          onChange={e =>
            setSettings({
              ...settings,
              allow_bump_if_expired: e.target.checked,
            })
          }
        />
        Allow bumping expired deals
      </label>

      <button
        onClick={save}
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {saving ? "Saving…" : "Save Rules"}
      </button>
    </div>
  );
}
