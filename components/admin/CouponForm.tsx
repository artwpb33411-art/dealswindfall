"use client";
import { useState } from "react";

export default function CouponForm() {
  const [coupon, setCoupon] = useState({
    storeName: "",
    couponLink: "",
    expirationDate: "",
    couponFile: null as File | null,
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleChange = (e: any) => {
    const { name, value, files } = e.target;
    if (files) {
      setCoupon({ ...coupon, [name]: files[0] });
    } else {
      setCoupon({ ...coupon, [name]: value });
    }
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...coupon,
          published_at: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      setSaving(false);

      if (!res.ok) {
        setMsg(`❌ ${data.error || "Failed to save"}`);
      } else {
        setMsg("✅ Coupon saved successfully!");
      }
    } catch (err: any) {
      console.error("Network error:", err);
      setMsg("❌ Network error");
      setSaving(false);
    }
  };

  // ✅ Return now correctly inside the component
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {msg && <div className="text-sm">{msg}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input
          name="storeName"
          placeholder="Store Name"
          className="border border-gray-300 rounded-md p-2"
          value={coupon.storeName}
          onChange={handleChange}
        />
        <input
          name="couponLink"
          placeholder="Coupon Link (PDF URL)"
          className="border border-gray-300 rounded-md p-2"
          value={coupon.couponLink}
          onChange={handleChange}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Upload Coupon (PDF)
        </label>
        <input
          type="file"
          name="couponFile"
          accept=".pdf"
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Expiration Date
        </label>
        <input
          type="date"
          name="expirationDate"
          value={coupon.expirationDate}
          onChange={handleChange}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        {saving ? "Saving..." : "Save Coupon"}
      </button>
    </form>
  );
}
