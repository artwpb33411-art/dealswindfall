"use client";

import { useState } from "react";
import * as XLSX from "xlsx";

export default function ExportDeals() {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [loading, setLoading] = useState(false);

  const exportFile = async (type: "csv" | "xlsx") => {
    if (!start || !end) {
      alert("Select start and end dates.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/deals/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate: start, endDate: end }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error: " + (data.error || "Export failed"));
        setLoading(false);
        return;
      }

      // Convert JSON → worksheet
      const ws = XLSX.utils.json_to_sheet(data.deals);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Deals");

      const fileName = `deals_${start}_to_${end}.${type}`;

      if (type === "csv") {
        XLSX.writeFile(wb, fileName, { bookType: "csv" });
      } else {
        XLSX.writeFile(wb, fileName, { bookType: "xlsx" });
      }

    } catch (err: any) {
      alert("Export error: " + err.message);
    }

    setLoading(false);
  };

  return (
    <div className="p-4 bg-white rounded-md shadow border border-gray-300">
      <h2 className="text-lg font-semibold text-blue-600 mb-3">Export Deals</h2>

      <div className="flex flex-col gap-3">
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="border p-2 rounded"
        />

        <button
          onClick={() => exportFile("xlsx")}
          className="px-4 py-2 rounded bg-green-600 hover:bg-green-700 text-white"
          disabled={loading}
        >
          {loading ? "Exporting..." : "Export Excel (.xlsx)"}
        </button>

        <button
          onClick={() => exportFile("csv")}
          className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
          disabled={loading}
        >
          {loading ? "Exporting..." : "Export CSV (.csv)"}
        </button>
      </div>
    </div>
  );
}
