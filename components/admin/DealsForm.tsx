"use client";

import { useEffect, useState } from "react";

/* -------------------------------------------------------------
   Constants
------------------------------------------------------------- */
//const [error, setError] = useState<string | null>(null);

//const [result, setResult] = useState<any | null>(null);
//const [error, setError] = useState<string | null>(null);


const STORE_TAGS = [
  "",
  "Amazon","Walmart","Target","Home Depot","Costco","Best Buy",
  "Sam’s Club","Lowe’s","Kohl’s","Macy’s","Staples","Office Depot","JCPenney", "Woot", "Ebay", "Dell", "HP",
];

const CAT_TAGS = [
  "",
  "Electronics","Clothing & Apparel","Kids & Toys","Home & Kitchen",
  "Beauty & Personal Care","Grocery & Food","Appliances",
  "Health & Wellness","Pet Supplies",
];

const HOLIDAY_TAGS = [
  "",
  "Black Friday","Cyber Monday","Thanksgiving Week",
  "Christmas","New Year","Back to School","Prime Day",
  "Memorial Day","Labor Day","Independence Day","Spring Sale","World Cup", "Valentine's",
];

const DEFAULT_FORM = {
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
  asin: "",
  upc: "",
  is_affiliate: false,
  affiliate_source: "",
  affiliate_priority: 0,
  sub_category: "",
hash_tags: "",

};

/* -------------------------------------------------------------
   Component
------------------------------------------------------------- */

export default function DealsForm() {
//const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null); 

 const [form, setForm] = useState(DEFAULT_FORM);
  const [productUrl, setProductUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [generateAI, setGenerateAI] = useState(true);
  
 const [result, setResult] = useState<any | null>(null);
  /* -------------------------------------------------------------
     Restore last selections (client only)
  ------------------------------------------------------------- */
  useEffect(() => {
    setForm(prev => ({
      ...prev,
      storeName: localStorage.getItem("lastStoreName") || "",
      category: localStorage.getItem("lastCategory") || "",
      holidayTag: localStorage.getItem("lastHolidayTag") || "",
    }));
  }, []);

  /* -------------------------------------------------------------
     Handlers
  ------------------------------------------------------------- */

  const onChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    if (name === "storeName") localStorage.setItem("lastStoreName", value);
    if (name === "category") localStorage.setItem("lastCategory", value);
    if (name === "holidayTag") localStorage.setItem("lastHolidayTag", value);
  };

  /* -------------------------------------------------------------
     Auto scrape product info
  ------------------------------------------------------------- */
  const handleAutoFetch = async () => {
    if (!productUrl) return alert("Paste a product URL first.");

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

      setForm(prev => ({
        ...prev,
        description: data.title || prev.description,
        currentPrice: data.price?.replace(/[^0-9.]/g, "") || prev.currentPrice,
        storeName: data.store || prev.storeName,
        category: data.category || prev.category,
        imageLink: data.image || prev.imageLink,
        productLink: productUrl,
      }));

      setMsg("✅ Product info fetched");
    } catch (err: any) {
      setMsg("❌ " + err.message);
    } finally {
      setFetching(false);
    }
  };

  /* -------------------------------------------------------------
     Submit (AI runs async in backend)
  ------------------------------------------------------------- */
  const onSubmit = async (e: any) => {
  e.preventDefault();
  setSaving(true);
  setMsg(null);
  setError(null);

  try {
    const res = await fetch("/api/deals/ingest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // TEXT
        description: form.description || null,
        notes: form.notes || null,
        description_es: form.description_es || null,
        notes_es: form.notes_es || null,

        // PRICES (camelCase)
        currentPrice: form.currentPrice,
        oldPrice: form.oldPrice,

        // LINKS
        imageLink: form.imageLink,
        productLink: form.productLink,
        reviewLink: form.reviewLink,

        // META
        couponCode: form.couponCode,
        shippingCost: form.shippingCost,
        expireDate: form.expireDate,

        category: form.category,
        storeName: form.storeName,
        holidayTag: form.holidayTag,

        // FLAGS
        ai_requested: generateAI,

asin: form.asin || null,
upc: form.upc || null,

is_affiliate: form.is_affiliate,
affiliate_source: form.affiliate_source || null,
affiliate_priority: Number(form.affiliate_priority) || 0,


      }),
    });

    const data = await res.json();

if (!res.ok) {
  setResult({ type: "error", message: data.message || "Failed to save deal" });
  throw new Error(data.message || "Failed to save deal");
}





    // ✅ Store result for UI feedback
    setResult(data);

    // ✅ Reset only when a new deal was created
    if (data.result === "inserted" || data.result === "superseded_old") {
      setForm(prev => ({
        ...DEFAULT_FORM,
        storeName: prev.storeName,
        category: prev.category,
        holidayTag: prev.holidayTag,
      }));
      setProductUrl("");
    }
  } catch (err: any) {
    setError(err.message || "Unexpected error");
  } finally {
    setSaving(false);
  }
};

  /* -------------------------------------------------------------
     Render
  ------------------------------------------------------------- */

  return (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded shadow space-y-4 max-w-2xl">
      <h2 className="text-lg font-semibold text-blue-600">Add New Deal</h2>

      {result && (
  <div
    className={`rounded p-3 text-sm font-medium ${
      result.result === "inserted"
        ? "bg-green-100 text-green-800"
        : result.result === "bumped_existing"
        ? "bg-blue-100 text-blue-800"
        : result.result === "superseded_old"
        ? "bg-purple-100 text-purple-800"
        : result.result === "skipped_duplicate"
        ? "bg-yellow-100 text-yellow-800"
        : "bg-red-100 text-red-800"
    }`}
  >
    {result.result === "inserted" && "✅ New deal created (Draft)."}
    {result.result === "bumped_existing" &&
      "🔁 Existing deal was bumped to the top."}
    {result.result === "superseded_old" &&
      "🔄 Price changed — old deal replaced with a new one."}
    {result.result === "skipped_duplicate" &&
      "⚠️ Duplicate deal detected — no action taken."}
    {result.result === "error" && `❌ ${result.message}`}
  </div>
)}

      {msg && <div className="text-sm">{msg}</div>}

      {/* Scrape */}
      <div className="flex gap-2">
	  
        <input
          type="url"
          value={productUrl}
          onChange={e => setProductUrl(e.target.value)}
          placeholder="Paste Amazon / Walmart / Target product link..."
          className="input flex-1"
        />
        <button
          type="button"
          onClick={handleAutoFetch}
          disabled={fetching}
          className="px-4 py-2 rounded bg-blue-600 text-white"
        >
          {fetching ? "Fetching..." : "Fetch"}
        </button>
      </div>

      {/* EN */}
      <input name="description" value={form.description} onChange={onChange} placeholder="English Title" className="input" />
      <textarea name="notes" value={form.notes} onChange={onChange} placeholder="English Description" rows={3} className="input" />

      {/* Prices */}
      <div className="grid grid-cols-2 gap-2">
        <input name="currentPrice" value={form.currentPrice} onChange={onChange} placeholder="Current Price" className="input" />
        <input name="oldPrice" value={form.oldPrice} onChange={onChange} placeholder="Old Price" className="input" />
      </div>

   

      {/* Links */}
      <input name="imageLink" value={form.imageLink} onChange={onChange} placeholder="Image Link" className="input" />
      <input name="productLink" value={form.productLink} onChange={onChange} placeholder="Product Link" className="input" />

       {/* AI toggle */}
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={generateAI} onChange={e => setGenerateAI(e.target.checked)} />
        Auto-generate AI content (EN + ES)
      </label>

      <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white p-2 rounded">
        {saving ? "Saving..." : "Save Deal"}
      </button>

         {/* Store / Category / Holiday */}
      <select name="storeName" value={form.storeName} onChange={onChange} className="input">
        {STORE_TAGS.map(t => <option key={t} value={t}>{t || "Select Store"}</option>)}
      </select>

      <select name="category" value={form.category} onChange={onChange} className="input">
        {CAT_TAGS.map(t => <option key={t} value={t}>{t || "Select Category"}</option>)}
      </select>

      <select name="holidayTag" value={form.holidayTag} onChange={onChange} className="input">
        {HOLIDAY_TAGS.map(t => <option key={t} value={t}>{t || "No Holiday / Event"}</option>)}
      </select>

<input
  name="sub_category"
  value={form.sub_category}
  onChange={onChange}
  placeholder="Sub Category (AI can adjust later)"
  className="input"
/>

<input
  name="hash_tags"
  value={form.hash_tags}
  onChange={onChange}
  placeholder="Hash tags (comma separated, optional)"
  className="input"
/>





      <input
  name="asin"
  value={form.asin}
  onChange={onChange}
  placeholder="ASIN (Amazon)"
  className="input"

  
/>

<input
  name="upc"
  value={form.upc}
  onChange={onChange}
  placeholder="UPC / Barcode"
  className="input"
/>

<label className="flex items-center gap-2 text-sm">
  <input
    type="checkbox"
    checked={form.is_affiliate}
    onChange={e =>
      setForm(prev => ({ ...prev, is_affiliate: e.target.checked }))
    }
  />
  Affiliate Deal
</label>

{form.is_affiliate && (
  <>
    <input
      name="affiliate_source"
      value={form.affiliate_source}
      onChange={onChange}
      placeholder="Affiliate Source (Amazon, CJ, Impact, etc.)"
      className="input"
    />

    <select
      name="affiliate_priority"
      value={form.affiliate_priority}
      onChange={onChange}
      className="input"
    >
      <option value={0}>Normal</option>
      <option value={1}>Affiliate</option>
      <option value={2}>Strategic Partner</option>
      <option value={3}>Sponsored / Premium</option>
    </select>
  </>
)}

      <input name="reviewLink" value={form.reviewLink} onChange={onChange} placeholder="Review Link" className="input" />

      {/* Misc */}
      <input name="couponCode" value={form.couponCode} onChange={onChange} placeholder="Coupon Code" className="input" />
      <input name="shippingCost" value={form.shippingCost} onChange={onChange} placeholder="Shipping Cost" className="input" />
      <input name="expireDate" value={form.expireDate} onChange={onChange} placeholder="Expiry Date (YYYY-MM-DD)" className="input" />

      {/* ES */}
      <input name="description_es" value={form.description_es} onChange={onChange} placeholder="Título en Español" className="input" />
      <textarea name="notes_es" value={form.notes_es} onChange={onChange} placeholder="Descripción en Español" rows={3} className="input" />

     
    </form>
	
	
  );
}
