"use client";
import { useState } from "react";

export default function CatalogForm() {
  const [catalog, setCatalog] = useState({
    storeName: "",
    startDate: "",
    endDate: "",
    catalogLink: "",
    screenshotLink: "",
    pdfFile: null as File | null,
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (files) {
      setCatalog({ ...catalog, [name]: files[0] });
    } else {
      setCatalog({ ...catalog, [name]: value });
    }
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/catalogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...catalog,
          published_at: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      setSaving(false);

      if (!res.ok) {
        setMsg(`❌ ${data.error || "Failed to upload"}`);
      } else {
        setMsg("✅ Catalog uploaded successfully!");
      }
    } catch (err: any) {
      console.error("Network error:", err);
      setMsg("❌ Network error");
      setSaving(false);
    }
  };

  // ✅ Return statement now correctly inside the component
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {msg && <div className="text-sm">{msg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="storeName"
          placeholder="Store Name"
          className="border border-gray-300 rounded-md p-2"
          value={catalog.storeName}
          onChange={handleChange}
        />
        <div className="flex gap-2">
          <label className="flex-1">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </span>
            <input
              type="date"
              name="startDate"
              value={catalog.startDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </label>
          <label className="flex-1">
            <span className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </span>
            <input
              type="date"
              name="endDate"
              value={catalog.endDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2"
            />
          </label>
        </div>
      </div>

      <input
        name="catalogLink"
        placeholder="Catalog Link (URL)"
        className="border border-gray-300 rounded-md p-2 w-full"
        value={catalog.catalogLink}
        onChange={handleChange}
      />

      <input
        name="screenshotLink"
        placeholder="Screenshot Link (optional)"
        className="border border-gray-300 rounded-md p-2 w-full"
        value={catalog.screenshotLink}
        onChange={handleChange}
      />

      <div>
        <label className="block text-sm font-medium mb-1">
          Upload Catalog (PDF)
        </label>
        <input
          type="file"
          name="pdfFile"
          accept=".pdf"
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        {saving ? "Uploading..." : "Upload Catalog"}
      </button>
    </form>
  );
}
