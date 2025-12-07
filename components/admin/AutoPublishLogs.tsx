"use client";

import { useEffect, useState } from "react";
import { History } from "lucide-react";

export default function AutoPublishLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadLogs() {
    try {
      const res = await fetch("/api/auto-publish-logs");
      const data = await res.json();
      if (Array.isArray(data)) {
        setLogs(data);
      }
    } catch (e) {
      console.error("Failed loading logs", e);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadLogs();

    // Auto-refresh every 10 seconds
    const interval = setInterval(loadLogs, 10_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-white rounded-lg shadow border mt-8">
      <h2 className="text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
        <History className="w-5 h-5" />
        Auto-Publish Logs
      </h2>

      {loading && <p className="text-gray-500">Loading logs...</p>}

      {!loading && logs.length === 0 && (
        <p className="text-gray-500">No logs yet.</p>
      )}

      {!loading && logs.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 border rounded bg-gray-50 hover:bg-gray-100 transition"
            >
              <p className="text-sm text-gray-600">
                {new Date(log.created_at).toLocaleString()}
              </p>

              <p className="text-gray-800 font-medium mt-1">
                {log.message}
              </p>

              {log.action && (
                <span className="inline-block mt-2 text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                  {log.action}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
