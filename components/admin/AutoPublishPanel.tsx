"use client";

import AutoPublishLogs from "./AutoPublishLogs";
import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Zap,
  Settings2,
} from "lucide-react";



//const [quietStart, setQuietStart] = useState<number | null>(null);
//const [quietEnd, setQuietEnd] = useState<number | null>(null);
//const [savingQuiet, setSavingQuiet] = useState(false);


export default function AutoPublishPanel() {

  const [quietStart, setQuietStart] = useState<number | null>(null);
  const [quietEnd, setQuietEnd] = useState<number | null>(null);
  const [savingQuiet, setSavingQuiet] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [platforms, setPlatforms] = useState<any>(null);
  const [savingPlatforms, setSavingPlatforms] = useState(false);

  const [actionMessage, setActionMessage] = useState("");

  // -----------------------
  // Load platform settings
  // -----------------------
  useEffect(() => {
    async function loadPlatforms() {
      const res = await fetch("/api/auto-publish-platforms");
      const data = await res.json();
      setPlatforms(data);
    }
    loadPlatforms();
  }, []);

  // -----------------------
  // Load scheduler state
  // -----------------------

useEffect(() => {
  async function loadQuietHours() {
    const res = await fetch("/api/auto-publish-settings");
    const data = await res.json();

    setQuietStart(data.social_quiet_start_hour ?? 1);
    setQuietEnd(data.social_quiet_end_hour ?? 5);
  }

  loadQuietHours();
}, []);



  async function loadStatus() {
    try {
      const res = await fetch("/api/auto-publish-status");
      const data = await res.json();
      setStatus(data);
    } catch {
      setStatus(null);
    } finally {
      setLoadingStatus(false);
    }
  }

  useEffect(() => {
    loadStatus();
  }, []);

  // -----------------------
  // Save platforms
  // -----------------------
  async function savePlatforms() {
    if (!platforms) return;

    setSavingPlatforms(true);
    try {
      const res = await fetch("/api/auto-publish-platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(platforms),
      });

      if (res.ok) {
        setActionMessage("✔ Platforms updated");
      } else {
        setActionMessage("✖ Failed to save platforms");
      }
    } catch {
      setActionMessage("✖ Failed to save platforms");
    } finally {
      setSavingPlatforms(false);
      setTimeout(() => setActionMessage(""), 4000);
    }
  }

  // -----------------------
  // Manual actions
  // -----------------------
  async function triggerAction(type: string) {
    try {
      await fetch("/api/auto-publish-action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: type }),
      });

      if (type === "publish_now") setActionMessage("🚀 Social post triggered");
      if (type === "skip_next") setActionMessage("⏭ Next cycle skipped");
      if (type === "reset") setActionMessage("🔄 Scheduler reset");

      loadStatus();
    } catch {
      setActionMessage("✖ Action failed");
    }
    setTimeout(() => setActionMessage(""), 4000);
  }

  async function saveQuietHours() {
  if (quietStart === null || quietEnd === null) return;

  setSavingQuiet(true);
  try {
    const res = await fetch("/api/auto-publish-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        social_quiet_start_hour: quietStart,
        social_quiet_end_hour: quietEnd,
      }),
    });

    if (res.ok) {
      setActionMessage("🌙 Quiet hours updated");
    } else {
      setActionMessage("✖ Failed to update quiet hours");
    }
  } catch {
    setActionMessage("✖ Failed to update quiet hours");
  } finally {
    setSavingQuiet(false);
    setTimeout(() => setActionMessage(""), 4000);
  }
}


  return (
    <div className="space-y-8">
      {actionMessage && (
        <div className="p-3 bg-blue-100 text-blue-700 rounded shadow-sm text-center">
          {actionMessage}
        </div>
      )}

      {/* ---------------------------
         SCHEDULER OVERVIEW CARD
      ---------------------------- */}
      <div className="p-6 bg-white rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Social Auto-Post Scheduler
        </h2>

        {loadingStatus ? (
          <p className="text-gray-500">Loading scheduler...</p>
        ) : (
          <div className="space-y-3 text-gray-800">
            <p>
              <strong>Status:</strong>{" "}
              {status?.enabled ? (
                <span className="text-green-600 font-semibold flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" /> Active
                </span>
              ) : (
                <span className="text-red-600 font-semibold flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Disabled
                </span>
              )}
            </p>

            <p>
              <strong>Last Social Post:</strong>{" "}
              {status?.social_last_run
                ? new Date(status.social_last_run).toLocaleString()
                : "Never"}
            </p>

            <p>
              <strong>Next Scheduled Run:</strong>{" "}
              {status?.social_next_run
                ? new Date(status.social_next_run).toLocaleString()
                : "Not Scheduled"}
            </p>

            <p>
              <strong>Platform Used Last Time:</strong>{" "}
              {status?.social_last_deal ?? "None"}
            </p>
          </div>
        )}
      </div>

{/* ---------------------------
   QUIET HOURS (EST)
---------------------------- */}
<div className="p-6 bg-white rounded-lg shadow border">
  <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
    <Clock className="w-5 h-5" />
    Quiet Hours (EST)
  </h2>

 <p className="text-sm text-gray-600 mb-4">
  Auto social posting will be paused during this time (EST).
  <br />
  <strong>To disable quiet hours, set Start and End to the same hour.</strong>
</p>


  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md">
    <div>
      <label className="block text-sm font-medium mb-1">
        Start Hour
      </label>
      <select
        value={quietStart ?? ""}
        onChange={(e) => setQuietStart(Number(e.target.value))}
        className="w-full border rounded px-3 py-2"
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <option key={i} value={i}>
            {i}:00
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium mb-1">
        End Hour
      </label>
      <select
        value={quietEnd ?? ""}
        onChange={(e) => setQuietEnd(Number(e.target.value))}
        className="w-full border rounded px-3 py-2"
      >
        {Array.from({ length: 24 }).map((_, i) => (
          <option key={i} value={i}>
            {i}:00
          </option>
        ))}
      </select>
    </div>
  </div>

  <button
    disabled={savingQuiet}
    onClick={saveQuietHours}
    className="mt-5 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
  >
    {savingQuiet ? "Saving..." : "Save Quiet Hours"}
  </button>
</div>


      {/* ---------------------------
         PLATFORM SETTINGS
      ---------------------------- */}
      <div className="p-6 bg-white rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
          <Settings2 className="w-5 h-5" />
          Platforms
        </h2>

        {!platforms ? (
          <p className="text-gray-500">Loading platforms...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(platforms).map((key) => (
                <label
                  key={key}
                  className="flex items-center gap-3 bg-gray-50 p-3 rounded border hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={platforms[key]}
                    onChange={(e) =>
                      setPlatforms({ ...platforms, [key]: e.target.checked })
                    }
                    className="w-5 h-5"
                  />
                  <span className="capitalize text-gray-800">{key}</span>
                </label>
              ))}
            </div>

            <button
              disabled={savingPlatforms}
              onClick={savePlatforms}
              className="mt-5 px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {savingPlatforms ? "Saving..." : "Save Platform Settings"}
            </button>
          </>
        )}
      </div>

      {/* ---------------------------
         MANUAL ACTIONS
      ---------------------------- */}
      <div className="p-6 bg-white rounded-lg shadow border">
        <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Manual Actions Social
        </h2>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => triggerAction("publish_now")}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Publish Now
          </button>

          <button
            onClick={() => triggerAction("skip_next")}
            className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center gap-2"
          >
            <Clock className="w-4 h-4" />
            Skip Next
          </button>

          <button
            onClick={() => triggerAction("reset")}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            Reset Scheduler
          </button>
        </div>
      </div>

      {/* ---------------------------
         LOGS
      ---------------------------- */}
      <AutoPublishLogs />
    </div>
  );
}
