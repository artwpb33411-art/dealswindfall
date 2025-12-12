"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { HOLIDAY_TAGS } from "@/constants/holidays";

/* -------------------------------------------------------------
   Helpers
------------------------------------------------------------- */

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
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

  // Filters
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Sorting
  const [sortField, setSortField] = useState<"published_at" | "percent_diff" | "current_price" | "store_name">(
    "published_at"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  // Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<any | null>(null);
  const [saving, setSaving] = useState(false);

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
      console.error("❌ Fetch failed:", e);
      setError(e.message || "Failed to load deals");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  /* -------------------------------------------------------------
     Status toggle (Published / Draft)
  ------------------------------------------------------------- */

  const toggleStatus = async (deal: any) => {
    const newStatus = deal.status === "Published" ? "Draft" : "Published";

    try {
      const res = await fetch("/api/deals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deal.id, status: newStatus }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("❌ Failed: " + (data.error || "Update error"));
        return;
      }

      // Optimistic local update
      setDeals((prev) =>
        prev.map((d) => (d.id === deal.id ? { ...d, status: newStatus } : d))
      );
    } catch (e: any) {
      alert("❌ " + e.message);
    }
  };

  /* -------------------------------------------------------------
     Auto-publish exclude toggle
  ------------------------------------------------------------- */

  const toggleExcludeAuto = async (deal: any) => {
    const newValue = !deal.exclude_from_auto;

    try {
      const res = await fetch("/api/deals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: deal.id,
          exclude_from_auto: newValue,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`❌ ${data.error || "Failed to update auto flag"}`);
        return;
      }

      setDeals((prev) =>
        prev.map((d) =>
          d.id === deal.id ? { ...d, exclude_from_auto: newValue } : d
        )
      );
    } catch (e: any) {
      alert(`❌ ${e.message}`);
    }
  };

  /* -------------------------------------------------------------
     Delete deal
  ------------------------------------------------------------- */

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;

    try {
      const res = await fetch("/api/deals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`❌ ${data.error || "Failed to delete"}`);
        return;
      }

      setDeals((prev) => prev.filter((d) => d.id !== id));
    } catch (e: any) {
      alert(`❌ ${e.message}`);
    }
  };

  /* -------------------------------------------------------------
     Edit deal (open modal)
  ------------------------------------------------------------- */

  const handleEdit = (deal: any) => {
    setEditDeal(deal);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editDeal) return;
    setSaving(true);

    // Make sure numeric fields are numbers
    const payload = {
      ...editDeal,
      current_price:
        editDeal.current_price === "" || editDeal.current_price == null
          ? null
          : parseFloat(editDeal.current_price),
      old_price:
        editDeal.old_price === "" || editDeal.old_price == null
          ? null
          : parseFloat(editDeal.old_price),
      shipping_cost:
        editDeal.shipping_cost === "" || editDeal.shipping_cost == null
          ? null
          : parseFloat(editDeal.shipping_cost),
    };

    try {
      const res = await fetch("/api/deals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`❌ ${data.error || "Failed to update"}`);
        return;
      }

      // Assume API returns { updated: deal }
      const updated = data.updated || payload;

      setDeals((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
      setIsModalOpen(false);
    } catch (e: any) {
      alert(`❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------------
     Filtering & sorting
  ------------------------------------------------------------- */

  const filteredDeals = useMemo(() => {
    const q = search.trim().toLowerCase();

    let result = deals.filter((deal) => {
      const matchesSearch =
        !q ||
        deal.description?.toLowerCase().includes(q) ||
        deal.description_es?.toLowerCase().includes(q);

      const matchesStore =
        !storeFilter ||
        deal.store_name?.toLowerCase() === storeFilter.toLowerCase();

      const matchesCategory =
        !categoryFilter ||
        deal.category?.toLowerCase() === categoryFilter.toLowerCase();

      const matchesDate =
        !dateFilter ||
        (deal.published_at &&
          new Date(deal.published_at).toISOString().split("T")[0] >=
            dateFilter);

      return matchesSearch && matchesStore && matchesCategory && matchesDate;
    });

    result.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];

      if (valA == null || valB == null) return 0;

      // Special case: dates
      if (sortField === "published_at") {
        const tA = new Date(valA).getTime();
        const tB = new Date(valB).getTime();
        if (Number.isNaN(tA) || Number.isNaN(tB)) return 0;
        return sortOrder === "asc" ? tA - tB : tB - tA;
      }

      // Numbers
      if (typeof valA === "number" && typeof valB === "number") {
        return sortOrder === "asc" ? valA - valB : valB - valA;
      }

      // Strings
      if (typeof valA === "string" && typeof valB === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return 0;
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

  // When filters / sort change, reset to page 1
  useEffect(() => {
    setPage(1);
  }, [search, storeFilter, categoryFilter, dateFilter, sortField, sortOrder]);

  /* -------------------------------------------------------------
     Pagination
  ------------------------------------------------------------- */

  const totalPages = Math.max(1, Math.ceil(filteredDeals.length / rowsPerPage));
  const paginatedDeals = filteredDeals.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const storeNames = useMemo(
    () =>
      Array.from(new Set(deals.map((d) => d.store_name).filter(Boolean))).sort(),
    [deals]
  );

  const categories = useMemo(
    () =>
      Array.from(new Set(deals.map((d) => d.category).filter(Boolean))).sort(),
    [deals]
  );

  const resetFilters = () => {
    setSearch("");
    setStoreFilter("");
    setCategoryFilter("");
    setDateFilter("");
    setSortField("published_at");
    setSortOrder("desc");
    setPage(1);
  };

  /* -------------------------------------------------------------
     Loading / Error
  ------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <p className="text-gray-600">Loading deals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 bg-white border border-red-200 rounded-lg shadow-sm p-6">
        <p className="text-red-600 font-medium">Error: {error}</p>
        <button
          onClick={fetchDeals}
          className="mt-3 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  /* -------------------------------------------------------------
     Render
  ------------------------------------------------------------- */

  return (
    <div
      className="mt-6 flex flex-col flex-grow bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
      style={{ minHeight: "400px" }}
    >
      {/* Header + Filters */}
      <div className="border-b border-gray-100 px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-gray-50">
        <div>
          <h2 className="text-lg font-semibold text-blue-600">
            All Published & Scheduled Deals
          </h2>
          <p className="text-xs text-gray-500">
            {filteredDeals.length} deals found · Page {page} of {totalPages}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={fetchDeals}
            className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Refresh
          </button>
          <button
            onClick={resetFilters}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="px-4 pt-3 pb-2 border-b border-gray-100 bg-white">
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="Search title / description..."
            className="border rounded-md p-2 text-sm flex-1 min-w-[200px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border rounded-md p-2 text-sm"
            value={storeFilter}
            onChange={(e) => setStoreFilter(e.target.value)}
          >
            <option value="">All Stores</option>
            {storeNames.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            className="border rounded-md p-2 text-sm"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="border rounded-md p-2 text-sm"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />

          <select
            className="border rounded-md p-2 text-sm"
            value={sortField}
            onChange={(e) =>
              setSortField(e.target.value as typeof sortField)
            }
          >
            <option value="published_at">Sort by Date</option>
            <option value="percent_diff">Sort by Discount %</option>
            <option value="current_price">Sort by Current Price</option>
            <option value="store_name">Sort by Store</option>
          </select>

          <select
            className="border rounded-md p-2 text-sm"
            value={sortOrder}
            onChange={(e) =>
              setSortOrder(e.target.value as typeof sortOrder)
            }
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-grow overflow-auto custom-scroll">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-gray-700">
            <thead className="bg-gray-100 text-left sticky top-0 z-10">
              <tr>
                <th className="p-2 w-[28%]">Deal</th>
                <th className="p-2">Store</th>
                <th className="p-2">Category</th>
                <th className="p-2 text-right">Current</th>
                <th className="p-2 text-right">Old</th>
                <th className="p-2 text-center">Discount</th>
                <th className="p-2">Published</th>
                <th className="p-2 text-center">Status</th>
                <th className="p-2 text-center">Auto</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDeals.length > 0 ? (
                paginatedDeals.map((d) => {
                  const scheduled = isFutureDate(d.published_at);
                  const discount = d.percent_diff ?? null;

                  return (
                    <tr
                      key={d.id}
                      className="border-t hover:bg-gray-50 transition"
                    >
                      {/* Description / title column */}
                      <td className="p-2 align-top">
                        <div className="font-medium text-gray-900 line-clamp-2">
                          {d.description || "Untitled deal"}
                        </div>
                        {d.description_es && (
                          <div className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                            ES: {d.description_es}
                          </div>
                        )}
                        {d.holiday_tag && (
                          <span className="inline-flex mt-1 px-2 py-0.5 text-[10px] rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                            {d.holiday_tag}
                          </span>
                        )}
                      </td>

                      {/* Store */}
                      <td className="p-2 align-top whitespace-nowrap">
                        {d.store_name || "—"}
                      </td>

                      {/* Category */}
                      <td className="p-2 align-top whitespace-nowrap">
                        {d.category || "—"}
                      </td>

                      {/* Current price */}
                      <td className="p-2 text-right align-top whitespace-nowrap">
                        {formatMoney(d.current_price)}
                      </td>

                      {/* Old price */}
                      <td className="p-2 text-right align-top whitespace-nowrap">
                        {formatMoney(d.old_price)}
                      </td>

                      {/* Discount */}
                      <td className="p-2 text-center align-top whitespace-nowrap">
                        {discount !== null && discount !== undefined ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              discount >= 40
                                ? "bg-green-100 text-green-800"
                                : discount >= 20
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            -{discount}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>

                      {/* Published date */}
                      <td className="p-2 align-top whitespace-nowrap">
                        <div className="text-xs text-gray-700">
                          {formatDate(d.published_at)}
                        </div>
                        {scheduled && (
                          <span className="inline-flex mt-1 px-2 py-0.5 text-[10px] rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            Scheduled
                          </span>
                        )}
                      </td>

                      {/* Status button */}
                      <td className="p-2 text-center align-top">
                        <button
                          onClick={() => toggleStatus(d)}
                          className={`px-3 py-1 rounded text-white text-xs font-semibold ${
                            d.status === "Published"
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-gray-500 hover:bg-gray-600"
                          }`}
                        >
                          {d.status || "Draft"}
                        </button>
                      </td>

                      {/* Auto-publish checkbox */}
                      <td className="p-2 text-center align-top">
                        <input
                          type="checkbox"
                          checked={!!d.exclude_from_auto}
                          onChange={() => toggleExcludeAuto(d)}
                          title="Exclude from auto publishing"
                        />
                        <div className="text-[10px] text-gray-500 mt-0.5">
                          {d.exclude_from_auto ? "Excluded" : "Included"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-2 text-right align-top whitespace-nowrap space-x-2">
                        <button
                          onClick={() => handleEdit(d)}
                          className="px-2 py-1 text-xs text-blue-600 border border-blue-400 rounded hover:bg-blue-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="px-2 py-1 text-xs text-red-600 border border-red-400 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="text-center py-6 text-gray-500 text-sm"
                  >
                    No deals found. Try adjusting your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center px-4 py-3 border-t border-gray-100 bg-gray-50 text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className={`px-3 py-1 rounded-md border ${
              page === 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 border-blue-400 hover:bg-blue-50"
            }`}
          >
            Previous
          </button>

          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className={`px-3 py-1 rounded-md border ${
              page === totalPages
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white text-blue-600 border-blue-400 hover:bg-blue-50"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* Edit Modal */}
      {isModalOpen && editDeal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6 relative">
            <h3 className="text-lg font-semibold mb-4">Edit Deal</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto pr-1 text-sm">
              {/* EN title & description */}
              <input
                className="border p-2 rounded"
                placeholder="English Title"
                value={editDeal.description || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, description: e.target.value })
                }
              />
              <textarea
                className="border p-2 rounded"
                placeholder="English Notes / Extra Description"
                value={editDeal.notes || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, notes: e.target.value })
                }
                rows={3}
              />

              {/* ES title & description */}
              <input
                className="border p-2 rounded"
                placeholder="Título en Español"
                value={editDeal.description_es || ""}
                onChange={(e) =>
                  setEditDeal({
                    ...editDeal,
                    description_es: e.target.value,
                  })
                }
              />
              <textarea
                className="border p-2 rounded"
                placeholder="Notas en Español"
                value={editDeal.notes_es || ""}
                onChange={(e) =>
                  setEditDeal({
                    ...editDeal,
                    notes_es: e.target.value,
                  })
                }
                rows={3}
              />

              {/* Prices & store */}
              <input
                className="border p-2 rounded"
                placeholder="Current Price"
                value={
                  editDeal.current_price === null ||
                  editDeal.current_price === undefined
                    ? ""
                    : String(editDeal.current_price)
                }
                onChange={(e) =>
                  setEditDeal({
                    ...editDeal,
                    current_price: e.target.value,
                  })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Old Price"
                value={
                  editDeal.old_price === null || editDeal.old_price === undefined
                    ? ""
                    : String(editDeal.old_price)
                }
                onChange={(e) =>
                  setEditDeal({
                    ...editDeal,
                    old_price: e.target.value,
                  })
                }
              />

              <input
                className="border p-2 rounded"
                placeholder="Store Name"
                value={editDeal.store_name || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, store_name: e.target.value })
                }
              />

              {/* Links */}
              <input
                className="border p-2 rounded"
                placeholder="Image Link"
                value={editDeal.image_link || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, image_link: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Product Link"
                value={editDeal.product_link || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, product_link: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Review Link"
                value={editDeal.review_link || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, review_link: e.target.value })
                }
              />

              {/* Misc */}
              <input
                className="border p-2 rounded"
                placeholder="Coupon Code"
                value={editDeal.coupon_code || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, coupon_code: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Shipping Cost"
                value={
                  editDeal.shipping_cost === null ||
                  editDeal.shipping_cost === undefined
                    ? ""
                    : String(editDeal.shipping_cost)
                }
                onChange={(e) =>
                  setEditDeal({
                    ...editDeal,
                    shipping_cost: e.target.value,
                  })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Expiry Date (YYYY-MM-DD)"
                value={editDeal.expire_date || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, expire_date: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Category"
                value={editDeal.category || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, category: e.target.value })
                }
              />

              {/* Holiday tag using HOLIDAY_TAGS */}
              <div className="flex flex-col gap-1">
                <label className="text-xs text-gray-600">Holiday Tag</label>
                <select
                  className="border p-2 rounded"
                  value={editDeal.holiday_tag || ""}
                  onChange={(e) =>
                    setEditDeal({
                      ...editDeal,
                      holiday_tag: e.target.value || null,
                    })
                  }
                >
                  <option value="">None</option>
                  {HOLIDAY_TAGS.map((tag: string) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
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
