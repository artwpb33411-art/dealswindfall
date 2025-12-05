"use client";
import { useState } from "react";

export default function DealsForm() {
  const [form, setForm] = useState({
    description: "",        // EN Title
    notes: "",              // EN Description
    description_es: "",     // ES Title
    notes_es: "",           // ES Description

    currentPrice: "",
    oldPrice: "",
    storeName: "",
    imageLink: "",
    productLink: "",
    reviewLink: "",
    couponCode: "",
    shippingCost: "",
    expireDate: "",
    category: "",
    holidayTag: "",
  });

  const HOLIDAY_TAGS = [
    "",
    "Black Friday", "Cyber Monday", "Thanksgiving Week",
    "Christmas", "New Year", "Back to School",
    "Prime Day", "Memorial Day", "Labor Day", "Independence Day",
    "Spring Sale", "World Cup",
  ];

const STORE_TAGS = [
    "",
    "Amazon", "Walmart", "Target",
    "Home Depot", "Costco", "Best Buy",
    "Sam’s Club", "Lowe’s", "Kohl’s", "Macy’s",
    "Staples", "Office Depot", "JCPenney",
  ];

const CAT_TAGS = [
    "",
    "Electronics", "Clothing & Apparel", "Kids & Toys", "Home & Kitchen",
    "Beauty & Personal Care", "Grocery & Food", "Appliances",
    "Health & Wellness", "Pet Supplies",
  ];


  const [productUrl, setProductUrl] = useState("");
  const [fetching, setFetching] = useState(false);
  const [fetchingAI, setFetchingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const onChange = (e: any) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ---------------------------------------------------
  // 1) AUTO-SCRAPE BUTTON (Amazon/Walmart/Target)
  // ---------------------------------------------------
  const handleAutoFetch = async () => {
    if (!productUrl) return alert("Please paste product link first.");
    setFetching(true);
    setMsg("⏳ Fetching product data...");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: productUrl }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to scrape");

      setForm((prev) => ({
        ...prev,
        description: data.title || prev.description,
        currentPrice: data.price?.replace(/[^0-9.]/g, "") || prev.currentPrice,
        storeName: data.store || prev.storeName,
        category: data.category || prev.category,
        imageLink: data.image || prev.imageLink,
        productLink: productUrl,
      }));

      setMsg("✅ Product info fetched successfully!");
    } catch (err: any) {
      console.error(err);
      setMsg("❌ " + err.message);
    }

    setFetching(false);
  };
// 2) AI BUTTON → Rewrite EN + ES SEO Titles & Descriptions
const generateAI = async () => {
  if (!form.description.trim()) {
    return alert("Enter the English Title before generating AI content.");
  }

  setFetchingAI(true);
  setMsg("⏳ Rewriting English & Spanish titles and descriptions...");

  try {
    const res = await fetch("/api/ai-generate-seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.description,
        notes: form.notes,
        storeName: form.storeName,
        category: form.category,
        currentPrice: form.currentPrice,
        oldPrice: form.oldPrice,
        shippingCost: form.shippingCost,
        couponCode: form.couponCode,
        holidayTag: form.holidayTag,
        productLink: form.productLink,
      }),
    });

    const data = await res.json();

    // Fallback or AI failure
    if (!data.success) {
      setForm(prev => ({
        ...prev,
        description_es: data.title_es || prev.description,
        notes_es: data.description_es || prev.notes,
      }));
      setMsg("⚠️ AI unavailable — kept English text, copied to Spanish.");
    } else {
      // Success
      setForm(prev => ({
        ...prev,
        description: data.title_en,
        notes: data.description_en,
        description_es: data.title_es,
        notes_es: data.description_es,
      }));
      setMsg("✅ AI generated full English & Spanish SEO content!");
    }

  } catch (err: any) {
    console.error(err);
    setMsg("❌ AI error: " + err.message);
  }

  setFetchingAI(false);
};


  // ---------------------------------------------------
  // 3) SUBMIT → Save to Supabase (/api/deals)
  // ---------------------------------------------------
  const onSubmit = async (e: any) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      setSaving(false);

      if (!res.ok) {
        setMsg("❌ " + (data.error || "Failed to save deal"));
        return;
      }

      setMsg("✅ Deal saved successfully!");

      // Reset form
      setForm({
        description: "",
        notes: "",
        description_es: "",
        notes_es: "",
        currentPrice: "",
        oldPrice: "",
        storeName: "",
        imageLink: "",
        productLink: "",
        reviewLink: "",
        couponCode: "",
        shippingCost: "",
        expireDate: "",
        category: "",
        holidayTag: "",
      });
      setProductUrl("");

    } catch (err: any) {
      console.error(err);
      setMsg("❌ Network error");
      setSaving(false);
    }
  };

  // ---------------------------------------------------
  // UI Form
  // ---------------------------------------------------
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white shadow p-6 rounded-md space-y-4 max-w-2xl border border-gray-300"
    >
      <h2 className="text-xl font-semibold text-blue-600 mb-2">
        Add New Deal
      </h2>
      {msg && <div className="text-sm">{msg}</div>}

      {/* --------------------------
           SCRAPE PRODUCT INFO
      -------------------------- */}
      <div className="flex gap-2">
        <input
          type="url"
          placeholder="Paste Amazon / Walmart / Target product link..."
          value={productUrl}
          onChange={(e) => setProductUrl(e.target.value)}
          className="border p-2 rounded flex-1"
        />
        <button
          type="button"
          onClick={handleAutoFetch}
          disabled={fetching}
          className={`px-4 py-2 rounded text-white ${
            fetching ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {fetching ? "Fetching..." : "Fetch"}
        </button>
      </div>

     
      {/* --------------------------
           ENGLISH TITLE + DESCRIPTION
      -------------------------- */}
      <input
        name="description"
        value={form.description}
        onChange={onChange}
        placeholder="English Title"
        className="input"
      />

      <textarea
        name="notes"
        value={form.notes}
        onChange={onChange}
        placeholder="English Description"
        className="input"
        rows={3}
      />

      {/* --------------------------
           SPANISH TITLE + DESCRIPTION
      -------------------------- */}
      <input
        name="description_es"
        value={form.description_es}
        onChange={onChange}
        placeholder="Título en Español"
        className="input"
      />

      <textarea
        name="notes_es"
        value={form.notes_es}
        onChange={onChange}
        placeholder="Descripción en Español"
        className="input"
        rows={3}
      />

      {/* --------------------------
           PRICES + STORE
      -------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          name="currentPrice"
          value={form.currentPrice}
          onChange={onChange}
          placeholder="Current Price"
          className="input"
        />
        <input
          name="oldPrice"
          value={form.oldPrice}
          onChange={onChange}
          placeholder="Old Price"
          className="input"
        />
       
		 <select
        name="storeName"
        value={form.storeName}
        onChange={onChange}
        className="input"
      >
        {STORE_TAGS.map((tag) => (
          <option key={tag} value={tag}>
            {tag || "No Store"}
          </option>
        ))}
      </select>
		
		
		
		
		
		
		
      </div>

      {/* --------------------------
           LINKS
      -------------------------- */}
      <input
        name="imageLink"
        value={form.imageLink}
        onChange={onChange}
        placeholder="Image Link"
        className="input"
      />

      <input
        name="productLink"
        value={form.productLink}
        onChange={onChange}
        placeholder="Product Link"
        className="input"
      />

      <input
        name="reviewLink"
        value={form.reviewLink}
        onChange={onChange}
        placeholder="Review Link"
        className="input"
      />

      {/* --------------------------
           MISC FIELDS
      -------------------------- */}
      <input
        name="couponCode"
        value={form.couponCode}
        onChange={onChange}
        placeholder="Coupon Code"
        className="input"
      />

      <input
        name="shippingCost"
        value={form.shippingCost}
        onChange={onChange}
        placeholder="Shipping Cost"
        className="input"
      />

      <input
        name="expireDate"
        value={form.expireDate}
        onChange={onChange}
        placeholder="Deal Expiry Date"
        className="input"
      />

    
	  
	   <select
        name="category"
        value={form.category}
        onChange={onChange}
        className="input"
      >
        {CAT_TAGS.map((tag) => (
          <option key={tag} value={tag}>
            {tag || "No Category"}
          </option>
        ))}
      </select>
	  
	  
	  
	  

      {/* Holiday */}
      <select
        name="holidayTag"
        value={form.holidayTag}
        onChange={onChange}
        className="input"
      >
        {HOLIDAY_TAGS.map((tag) => (
          <option key={tag} value={tag}>
            {tag || "No holiday / event"}
          </option>
        ))}
      </select>


 {/* --------------------------
           AI SEO GENERATION
      -------------------------- */}
      <button
        type="button"
        onClick={generateAI}
        disabled={fetchingAI}
        className={`w-full p-2 rounded text-white ${
          fetchingAI ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"
        }`}
      >
        {fetchingAI ? "Generating..." : "✨ AI: Generate EN + ES SEO"}
      </button>

      {/* --------------------------
           SAVE BUTTON
      -------------------------- */}
      <button
        type="submit"
        disabled={saving}
        className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
      >
        {saving ? "Saving..." : "Save Deal"}
      </button>
    </form>
  );
}
