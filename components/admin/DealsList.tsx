"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HOLIDAY_TAGS } from "@/constants/holidays";

/* -------------------------------------------------------------
   Helpers
------------------------------------------------------------- */
function getCanonicalDealId(d: any) {
  if (!d) return null;
  if (typeof d !== "object") return null;
  return d.superseded_by_id ?? d.id;
}




function renderStatusBadge(status: string) {
  const map: Record<string, string> = {
    Draft: "bg-gray-200 text-gray-700",
    Published: "bg-green-200 text-green-800",
    Archived: "bg-red-200 text-red-800",
  };

  return (
    <span className={`px-2 py-1 text-xs rounded ${map[status] || ""}`}>
      {status}
    </span>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true, // Use AM/PM
  })
}

function formatMoney(value: number | string | null | undefined) {
  if (value === null || value === undefined || value === "") return "—";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "—";
  return `$${num.toFixed(2)}`;
}

function isFutureDate(value?: string | null) {
  if (!value) return false;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  return d.getTime() > Date.now();
}

/* -------------------------------------------------------------
   Component
------------------------------------------------------------- */

export default function DealsList() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ---------------- Filters & Sorting ---------------- */

  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  const [sortField, setSortField] = useState<
  "id" | "published_at" | "percent_diff" | "current_price" | "store_name"
>("id");


  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  /* ---------------- Pagination ---------------- */

  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  /* ---------------- Edit Modal ---------------- */

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);
  const [aiUpdating, setAiUpdating] = useState(false);

  /* -------------------------------------------------------------
     Fetch Deals
  ------------------------------------------------------------- */

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/deals");
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load deals");
      } else {
        setDeals(data || []);
      }
    } catch (e: any) {
      setError(e.message || "Failed to load deals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  /* -------------------------------------------------------------
     AI STATUS + RETRY
  ------------------------------------------------------------- */

  const retryAIForDeal = async (dealId: number) => {
    try {
      await fetch("/api/ai/process-deal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dealId, force: true }),
      });

      setDeals(prev =>
        prev.map(d =>
          d.id === dealId
            ? { ...d, ai_status: "processing", ai_error: null }
            : d
        )
      );
    } catch {
      alert("Failed to retry AI");
    }
  };

  const retryAllFailedAI = async () => {
    const failed = deals.filter(d => d.ai_status === "failed");
    if (!failed.length) {
      alert("No failed AI deals found");
      return;
    }

    if (!confirm(`Retry AI for ${failed.length} deals?`)) return;

    await Promise.all(
      failed.map(d =>
        fetch("/api/ai/process-deal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dealId: d.id, force: true }),
        })
      )
    );

    setDeals(prev =>
      prev.map(d =>
        d.ai_status === "failed"
          ? { ...d, ai_status: "processing", ai_error: null }
          : d
      )
    );
  };

function renderAIStatus(deal: any) {
  const status = deal.ai_status;

  if (!status || status === "skipped") return <span>—</span>;

  if (status === "pending" || status === "processing") {
    return <span title="AI processing">🤖</span>;
  }

  if (status === "completed" || status === "success") {
    return <span title="AI completed">✅</span>;
  }

  if (status === "failed" || status === "error") {
    return (
      <button
        onClick={() => retryAIForDeal(deal.id)}
        title={deal.ai_error || "AI failed — click to retry"}
        className="text-red-600 hover:text-red-800"
      >
        ⚠️
      </button>
    );
  }

  return <span>—</span>;
}



  /* -------------------------------------------------------------
     Publish / Draft toggle
  ------------------------------------------------------------- */
/*
  const toggleStatus = async (deal: any) => {
    const newStatus = deal.status === "Published" ? "Draft" : "Published";

    try {
      const res = await fetch("/api/deals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deal.id, status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed");

      setDeals(prev =>
        prev.map(d => (d.id === deal.id ? { ...d, status: newStatus } : d))
      );
    } catch {
      alert("Failed to update status");
    }
  };
*/

  /* -------------------------------------------------------------
     Auto publish exclude toggle
  ------------------------------------------------------------- */

  const toggleExcludeAuto = async (deal: any) => {
    const newValue = !deal.exclude_from_auto;

    try {
      const res = await fetch("/api/deals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deal.id, exclude_from_auto: newValue }),
      });

      if (!res.ok) throw new Error("Failed");

      setDeals(prev =>
        prev.map(d =>
          d.id === deal.id ? { ...d, exclude_from_auto: newValue } : d
        )
      );
    } catch {
      alert("Failed to update auto-publish flag");
    }
  };

  /* -------------------------------------------------------------
     Delete
  ------------------------------------------------------------- */

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this deal permanently?")) return;

    try {
      const res = await fetch("/api/deals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error("Failed");

      setDeals(prev => prev.filter(d => d.id !== id));
    } catch {
      alert("Failed to delete deal");
    }
  };

  /* -------------------------------------------------------------
     Edit + Save
  ------------------------------------------------------------- */

  const handleEdit = (deal: any) => {
    setEditDeal(deal);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
  if (!editDeal) return;
  setSaving(true);

  try {
    // 🔒 If admin edits after AI, lock it as manual
    const payload = {
      ...editDeal,
      ai_status:
        editDeal.ai_status === "completed"
          ? "manual"
          : editDeal.ai_status,
    };

    const res = await fetch("/api/deals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");

    const updated = data.updated || payload;
    setDeals(prev =>
      prev.map(d => (d.id === updated.id ? updated : d))
    );

    setIsModalOpen(false);
  } catch (err: any) {
    alert(err.message);
  } finally {
    setSaving(false);
  }
};


  /* -------------------------------------------------------------
     AI Regenerate (inside modal)
  ------------------------------------------------------------- */
const handleRegenerateAI = async () => {
  if (!editDeal) return;

  setAiUpdating(true);

  try {
    const res = await fetch("/api/ai-generate-seo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editDeal.description,
        notes: editDeal.notes,
        category: editDeal.category,
        storeName: editDeal.store_name,
        currentPrice: editDeal.current_price,
        oldPrice: editDeal.old_price,
        shippingCost: editDeal.shipping_cost,
        couponCode: editDeal.coupon_code,
        holidayTag: editDeal.holiday_tag,
        productLink: editDeal.product_link,
      }),
    });

    const data = await res.json();

    setEditDeal((prev: any) => ({
      ...prev,
      description: data.title_en || prev.description,
      notes: data.description_en || prev.notes,
      description_es: data.title_es || prev.description_es,
      notes_es: data.description_es || prev.notes_es,
      ai_status: "success",

    //   ai_status: "success",
  ai_error: null,
  ai_generated_at: new Date().toISOString(),
    }));
  } catch (err: any) {
  setEditDeal((prev: any) => ({
    ...prev,
    ai_status: "error",
    ai_error: err?.message || "AI generation failed",
  }));

  alert("AI generation failed");
}
 finally {
    setAiUpdating(false);
  }
};


  /* -------------------------------------------------------------
     Filtering & Sorting
  ------------------------------------------------------------- */

  const filteredDeals = useMemo(() => {
    const q = search.toLowerCase().trim();

    let result = deals.filter(d => {
      const matchText =
        !q ||
        d.description?.toLowerCase().includes(q) ||
        d.description_es?.toLowerCase().includes(q);

      const matchStore = !storeFilter || d.store_name === storeFilter;
      const matchCategory = !categoryFilter || d.category === categoryFilter;

      const matchDate =
        !dateFilter ||
        (d.published_at &&
          new Date(d.published_at).toISOString().split("T")[0] >= dateFilter);

      return matchText && matchStore && matchCategory && matchDate;
    });

    result.sort((a, b) => {
      const A = a[sortField];
      const B = b[sortField];
      if (A == null || B == null) return 0;

      if (sortField === "published_at") {
        return sortOrder === "asc"
          ? new Date(A).getTime() - new Date(B).getTime()
          : new Date(B).getTime() - new Date(A).getTime();
      }

      if (typeof A === "number" && typeof B === "number") {
        return sortOrder === "asc" ? A - B : B - A;
      }

      return sortOrder === "asc"
        ? String(A).localeCompare(String(B))
        : String(B).localeCompare(String(A));
    });

    return result;
  }, [
    deals,
    search,
    storeFilter,
    categoryFilter,
    dateFilter,
    sortField,
    sortOrder,
  ]);

  useEffect(() => {
    setPage(1);
  }, [search, storeFilter, categoryFilter, dateFilter, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredDeals.length / rowsPerPage));
  const paginatedDeals = filteredDeals.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const storeNames = useMemo(
    () => Array.from(new Set(deals.map(d => d.store_name).filter(Boolean))),
    [deals]
  );

  const categories = useMemo(
    () => Array.from(new Set(deals.map(d => d.category).filter(Boolean))),
    [deals]
  );

  /* -------------------------------------------------------------
     Render
  ------------------------------------------------------------- */

  if (loading) return <div className="p-6">Loading deals…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="bg-white border rounded shadow mt-6">
      {/* Header */}
      <div className="p-4 flex justify-between bg-gray-50 border-b">
        <h2 className="font-semibold text-blue-600">
          Deals ({filteredDeals.length})
        </h2>
        <div className="flex gap-2">
        
          <button
            onClick={fetchDeals}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="p-3 flex gap-2 border-b">
        <input
          placeholder="Search…"
          className="border p-2 text-sm rounded flex-1"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select
          className="border p-2 text-sm rounded"
          value={storeFilter}
          onChange={e => setStoreFilter(e.target.value)}
        >
          <option value="">All Stores</option>
          {storeNames.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          className="border p-2 text-sm rounded"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          type="date"
          className="border p-2 text-sm rounded"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
        />

        <select
          className="border p-2 text-sm rounded"
          value={sortField}
          onChange={e => setSortField(e.target.value as any)}
        >
          <option value="id">Newest (ID)</option>
          <option value="published_at">Date</option>
          <option value="percent_diff">Discount %</option>
          <option value="current_price">Current Price</option>
          <option value="store_name">Store</option>
        </select>

        <select
          className="border p-2 text-sm rounded"
          value={sortOrder}
          onChange={e => setSortOrder(e.target.value as any)}
        >
          <option value="desc">Desc</option>
          <option value="asc">Asc</option>
        </select>
      </div>

      {/* Table */}
      <table className="min-w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Deal</th>
            <th className="p-2">Store</th>
            <th className="p-2">Category</th>
            <th className="p-2 text-right">Current</th>
            <th className="p-2 text-center">AI</th>
            <th className="p-2 text-center">Status</th>
            <th className="p-2 text-center">Auto</th>
            <th className="p-2 text-right">Actions</th>
          </tr>
        </thead>
       <tbody>
  {paginatedDeals.map(d => {
    const canonicalId = getCanonicalDealId(d);

    return (
      <tr key={d.id} className="border-t hover:bg-gray-50">
        <td className="p-2">
          <div className="font-medium">{d.description}</div>

          {/* English URL */}
          {canonicalId && d.slug && (
            <a
              href={`/deals/${canonicalId}-${d.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-blue-600 hover:underline"
            >
              EN: /deals/{canonicalId}-{d.slug}
            </a>
          )}

          {/* Spanish URL */}
          {canonicalId && d.slug_es && (
            <a
              href={`/es/deals/${canonicalId}-${d.slug_es}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-xs text-green-600 hover:underline"
            >
              ES: /es/deals/{canonicalId}-{d.slug_es}
            </a>
          )}

          {d.superseded_by_id && (
            <div className="text-xs text-gray-500">
              Superseded → #{d.superseded_by_id}
            </div>
          )}

          {d.is_affiliate && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-orange-500 text-white rounded">
              Affiliate
            </span>
          )}

          {d.feed_at && (
            <div className="text-xs text-gray-400">
              Feed: {formatDate(d.feed_at)}
            </div>
          )}

          {d.canonical_to_id && (
            <div className="text-xs text-blue-500">
              Replaced older deal
            </div>
          )}
        </td>
              <td className="p-2">{d.store_name || "—"}</td>
              
              <td className="p-2">{d.category || "—"}</td>
              <td className="p-2 text-right">{formatMoney(d.current_price)}</td>
              <td className="p-2 text-center">{renderAIStatus(d)}</td>
          <td className="p-2 text-center">
  {renderStatusBadge(d.status)}
</td>


              <td className="p-2 text-center">
               <input
  type="checkbox"
  disabled={d.status === "Archived"}
  checked={!!d.exclude_from_auto}
  onChange={() => toggleExcludeAuto(d)}
/>

              </td>
            <td className="p-2 text-right space-x-2">
  {d.status !== "Archived" && (
    <button
      onClick={() => handleEdit(d)}
      className="px-2 py-1 text-xs border rounded"
    >
      Edit
    </button>
  )}

  <button
    onClick={() => handleDelete(d.id)}
    className="px-2 py-1 text-xs border text-red-600 rounded"
  >
    Delete
  </button>
</td>

            </tr>
          );})}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-3 flex justify-between text-sm bg-gray-50 border-t">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Previous
          </button>
          <span>Page {page} of {totalPages}</span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
     {isModalOpen && editDeal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
    <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Edit Deal</h3>
        <button
          onClick={handleRegenerateAI}
          disabled={aiUpdating}
          className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {aiUpdating ? "AI Generating..." : "🤖 Regenerate AI"}
        </button>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto pr-1 text-sm">

        {/* EN */}
        <input
          className="border p-2 rounded"
          placeholder="English Title"
          value={editDeal.description || ""}
          onChange={e => setEditDeal({ ...editDeal, description: e.target.value })}
        />
        <textarea
          className="border p-2 rounded"
          placeholder="English Description"
          rows={3}
          value={editDeal.notes || ""}
          onChange={e => setEditDeal({ ...editDeal, notes: e.target.value })}
        />

        {/* ES */}
        <input
          className="border p-2 rounded"
          placeholder="Título en Español"
          value={editDeal.description_es || ""}
          onChange={e =>
            setEditDeal({ ...editDeal, description_es: e.target.value })
          }
        />
        <textarea
          className="border p-2 rounded"
          placeholder="Descripción en Español"
          rows={3}
          value={editDeal.notes_es || ""}
          onChange={e =>
            setEditDeal({ ...editDeal, notes_es: e.target.value })
          }
        />

        {/* Prices */}
        <input
          className="border p-2 rounded"
          placeholder="Current Price"
          value={editDeal.current_price ?? ""}
          onChange={e =>
            setEditDeal({ ...editDeal, current_price: e.target.value })
          }
        />
        <input
          className="border p-2 rounded"
          placeholder="Old Price"
          value={editDeal.old_price ?? ""}
          onChange={e =>
            setEditDeal({ ...editDeal, old_price: e.target.value })
          }
        />

        {/* Store / Category */}
        <input
          className="border p-2 rounded"
          placeholder="Store Name"
          value={editDeal.store_name || ""}
          onChange={e =>
            setEditDeal({ ...editDeal, store_name: e.target.value })
          }
        />
        <input
          className="border p-2 rounded"
          placeholder="Category"
          value={editDeal.category || ""}
          onChange={e =>
            setEditDeal({ ...editDeal, category: e.target.value })
          }
        />

        {/* Links */}
        <input
          className="border p-2 rounded"
          placeholder="Product Link"
          value={editDeal.product_link || ""}
          onChange={e =>
            setEditDeal({ ...editDeal, product_link: e.target.value })
          }
        />
        <input
          className="border p-2 rounded"
          placeholder="Image Link"
          value={editDeal.image_link || ""}
          onChange={e =>
            setEditDeal({ ...editDeal, image_link: e.target.value })
          }
        />

        <input
          className="border p-2 rounded"
          placeholder="Review Link"
          value={editDeal.review_link || ""}
          onChange={e =>
            setEditDeal({ ...editDeal, review_link: e.target.value })
          }
        />

        {/* Misc */}
        <input
          className="border p-2 rounded"
          placeholder="Coupon Code"
          value={editDeal.coupon_code || ""}
          onChange={e =>
            setEditDeal({ ...editDeal, coupon_code: e.target.value })
          }
        />
        <input
          className="border p-2 rounded"
          placeholder="Shipping Cost"
          value={editDeal.shipping_cost || ""}
          onChange={e =>
            setEditDeal({ ...editDeal, shipping_cost: e.target.value })
          }
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={editDeal.expire_date || ""}
          onChange={e =>
            setEditDeal({ ...editDeal, expire_date: e.target.value })
          }
        />

        {/* Holiday */}
        <select
          className="border p-2 rounded"
          value={editDeal.holiday_tag || ""}
          onChange={e =>
            setEditDeal({ ...editDeal, holiday_tag: e.target.value || null })
          }
        >
          <option value="">No Holiday</option>
          {HOLIDAY_TAGS.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>

       
        {/* Auto Publish */}
       
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-5">
        <button
          onClick={() => setIsModalOpen(false)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving || aiUpdating}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
