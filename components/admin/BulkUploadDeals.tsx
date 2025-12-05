"use client";
import { useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

export default function BulkUploadDeals() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [useAI, setUseAI] = useState<boolean>(true);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(""); // clear previous result
    }
  };

  const parseCSV = (file: File) =>
    new Promise<any[]>((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data),
        error: reject,
      });
    });

  const parseXLSX = (file: File) =>
    new Promise<any[]>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          resolve(json);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first.");
    setUploading(true);
    setResult("");

    try {
      let deals: any[] = [];

      if (file.name.endsWith(".csv")) {
        deals = await parseCSV(file);
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        deals = await parseXLSX(file);
      } else {
        alert("Unsupported file format. Please upload a CSV or Excel file.");
        setUploading(false);
        return;
      }

      if (!deals.length) {
        alert("No valid data found in file.");
        setUploading(false);
        return;
      }

      const res = await fetch("/api/deals/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deals, useAI }),
      });

      const data = await res.json();
      if (res.ok) {
        setResult(
          `✅ Successfully uploaded ${data.inserted || deals.length} deals.`
        );
      } else {
        setResult(`❌ Error: ${data.error || "Upload failed."}`);
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setResult(`❌ ${err.message || "Error parsing or uploading file."}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow border border-gray-200">
      <h2 className="text-lg font-semibold mb-3 text-blue-600">
        Bulk Upload Deals
      </h2>

      <input
        type="file"
        accept=".csv, .xlsx, .xls"
        onChange={handleFileChange}
        className="border border-gray-300 p-2 rounded-md w-full mb-3"
      />

      <label className="flex items-center gap-2 mb-3 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={useAI}
          onChange={(e) => setUseAI(e.target.checked)}
        />
        <span>Use AI to generate EN/ES descriptions if missing</span>
      </label>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`px-4 py-2 text-white rounded-md ${
          uploading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>

      {result && (
        <p
          className={`mt-3 text-sm ${
            result.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {result}
        </p>
      )}
    </div>
  );
}
