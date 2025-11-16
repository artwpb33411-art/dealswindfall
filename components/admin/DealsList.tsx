"use client";
import { useEffect, useState, useMemo } from "react";
import { HOLIDAY_TAGS } from "@/constants/holidays";

export default function DealsList() {
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const toggleStatus = async (deal: any) => {
  const newStatus = deal.status === "Published" ? "Draft" : "Published";
  try {
    const res = await fetch("/api/deals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: deal.id, status: newStatus }),
    });
    const data = await res.json();
    if (res.ok) {
      setDeals((prev) =>
        prev.map((d) => (d.id === deal.id ? { ...d, status: newStatus } : d))
      );
    } else {
      alert(`❌ ${data.error || "Failed to update status"}`);
    }
  } catch (e: any) {
    alert(`❌ ${e.message}`);
  }
};

  const [error, setError] = useState<string | null>(null);

  // 🔍 Filters
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // ↕️ Sorting
  const [sortField, setSortField] = useState("published_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // 📄 Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  // ✏️ Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editDeal, setEditDeal] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchDeals = async () => {
  setLoading(true);
  try {
    const res = await fetch("/api/deals");
    const data = await res.json();
    console.log("🔍 Deals API response:", data); // 👈 add this line
    if (res.ok) setDeals(data);
    else setError(data.error || "Failed to load deals");
  } catch (e: any) {
    console.error("❌ Fetch failed:", e);
    setError(e.message);
  } finally {
    setLoading(false);
  }
};


  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this deal?")) return;
    try {
      const res = await fetch("/api/deals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        setDeals(deals.filter((d) => d.id !== id));
      } else {
        alert(`❌ ${data.error || "Failed to delete"}`);
      }
    } catch (e: any) {
      alert(`❌ ${e.message}`);
    }
  };

  const handleEdit = (deal: any) => {
    setEditDeal(deal);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editDeal) return;
    setSaving(true);
    try {
      const res = await fetch("/api/deals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
  id: editDeal.id,
  description: editDeal.description,
  store_name: editDeal.store_name,
  category: editDeal.category,
  old_price: editDeal.old_price,
  current_price: editDeal.current_price,
  price_diff: editDeal.price_diff,
  percent_diff: editDeal.percent_diff,
  deal_level: editDeal.deal_level, // ✅ explicitly include it
  product_link: editDeal.product_link,
  image_link: editDeal.image_link,
  review_link: editDeal.review_link,
  coupon_code: editDeal.coupon_code,
  shipping_cost: editDeal.shipping_cost,
  notes: editDeal.notes,
  holiday_tag: editDeal.holiday_tag ?? null,   // 👈 NEW
}),

      });
      const data = await res.json();
      if (res.ok) {
        setDeals((prev) =>
          prev.map((d) => (d.id === editDeal.id ? data.updated : d))
        );
        setIsModalOpen(false);
      } else {
        alert(`❌ ${data.error || "Failed to update"}`);
      }
    } catch (e: any) {
      alert(`❌ ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  // 🧮 Filtered + Sorted deals
  const filteredDeals = useMemo(() => {
    let result = deals.filter((deal) => {
      const matchesSearch =
        search === "" ||
        deal.description?.toLowerCase().includes(search.toLowerCase());
      const matchesStore =
        storeFilter === "" ||
        deal.store_name?.toLowerCase() === storeFilter.toLowerCase();
      const matchesCategory =
        categoryFilter === "" ||
        deal.category?.toLowerCase() === categoryFilter.toLowerCase();
      const matchesDate =
        dateFilter === "" ||
        (deal.published_at &&
          new Date(deal.published_at).toISOString().split("T")[0] >=
            dateFilter);

      return matchesSearch && matchesStore && matchesCategory && matchesDate;
    });

    result.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA == null || valB == null) return 0;

      if (sortField === "published_at") {
        const dateA = new Date(valA).getTime();
        const dateB = new Date(valB).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }

      if (typeof valA === "string") {
        return sortOrder === "asc"
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      }

      return sortOrder === "asc" ? valA - valB : valB - valA;
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

  // Pagination
  const totalPages = Math.ceil(filteredDeals.length / rowsPerPage);
  const paginatedDeals = filteredDeals.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const storeNames = Array.from(new Set(deals.map((d) => d.store_name))).filter(Boolean);
  const categories = Array.from(new Set(deals.map((d) => d.category))).filter(Boolean);

  const resetFilters = () => {
    setSearch("");
    setStoreFilter("");
    setCategoryFilter("");
    setDateFilter("");
    setSortField("published_at");
    setSortOrder("desc");
    setPage(1);
  };

  if (loading) return <p className="text-gray-600">Loading deals...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
//console.log("✅ DealsList component reached render with", deals.length, "deals");
//console.log("🔹 Filtered:", filteredDeals.length, "Paginated:", paginatedDeals.length);

  return (
 <div
  className="mt-6 flex flex-col flex-grow bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
  style={{ minHeight: "400px" }}
>
  <div className="flex-grow overflow-auto custom-scroll p-4">

    <h2 className="text-xl font-semibold text-blue-600 mb-3">
      All Published Deals
    </h2>


      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search description..."
          className="border rounded-md p-2 flex-1 min-w-[200px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border rounded-md p-2"
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
          className="border rounded-md p-2"
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
          className="border rounded-md p-2"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        {/* Sorting */}
        <select
          className="border rounded-md p-2"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
        >
          <option value="published_at">Sort by Date</option>
          <option value="percent_diff">Sort by Discount %</option>
          <option value="current_price">Sort by Current Price</option>
          <option value="store_name">Sort by Store</option>
        </select>

        <select
          className="border rounded-md p-2"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </select>

        <button
          onClick={fetchDeals}
          className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          Refresh
        </button>

        <button
          onClick={resetFilters}
          className="px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
        >
          Reset
        </button>
      </div>

{/* Table */}
<div className="overflow-x-auto border border-gray-200 rounded-md mt-4">
  <table className="min-w-full text-sm text-gray-700">
    <thead className="bg-gray-100 text-left">
      <tr>
        <th className="p-2">Description</th>
        <th className="p-2">Store</th>
        <th className="p-2">Category</th>
        <th className="p-2">Current</th>
        <th className="p-2">Old</th>
        <th className="p-2">Discount %</th>
        <th className="p-2">Published</th>
        <th className="p-2">Status</th>
        <th className="p-2 text-right">Actions</th>
      </tr>
    </thead>

    <tbody>
      {paginatedDeals.length > 0 ? (
        paginatedDeals.map((d) => (
          <tr key={d.id} className="border-t hover:bg-gray-50 transition">
            <td className="p-2">{d.description}</td>
            <td className="p-2">{d.store_name}</td>
            <td className="p-2">{d.category}</td>
            <td className="p-2">{d.current_price}</td>
            <td className="p-2">{d.old_price}</td>
            <td className="p-2">{d.percent_diff}</td>
            <td className="p-2 text-gray-500">
              {d.published_at
                ? new Date(d.published_at).toLocaleDateString()
                : "—"}
            </td>
            <td className="p-2 text-center">
              <button
                onClick={() => toggleStatus(d)}
                className={`px-3 py-1 rounded text-white text-xs ${
                  d.status === "Published"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-gray-500 hover:bg-gray-600"
                }`}
              >
                {d.status || "Draft"}
              </button>
            </td>
            <td className="p-2 text-right space-x-2">
              <button
                onClick={() => handleEdit(d)}
                className="px-2 py-1 text-blue-600 border border-blue-500 rounded hover:bg-blue-50"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(d.id)}
                className="px-2 py-1 text-red-600 border border-red-500 rounded hover:bg-red-50"
              >
                Delete
              </button>
            </td>
          </tr>
        ))
      ) : (
        <tr>
          <td colSpan={9} className="text-center py-6 text-gray-500">
            No deals found
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
  </div> {/* ← close inner scroll area */}


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className={`px-3 py-1 rounded-md border ${
              page === 1
                ? "bg-gray-200 text-gray-400"
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
                ? "bg-gray-200 text-gray-400"
                : "bg-white text-blue-600 border-blue-400 hover:bg-blue-50"
            }`}
          >
            Next
          </button>
        </div>
      )}

      {/* 🪟 Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
            <h3 className="text-lg font-semibold mb-4">Edit Deal</h3>

            <div className="grid grid-cols-2 gap-4">
              <input
                className="border p-2 rounded"
                placeholder="Description"
                value={editDeal?.description || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, description: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Store Name"
                value={editDeal?.store_name || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, store_name: e.target.value })
                }
              />
             <input
  type="number"
  className="border p-2 rounded"
  placeholder="Old Price"
  value={editDeal?.old_price || ""}
  onChange={(e) => {
    const newOld = parseFloat(e.target.value || "0");
    const newCurr = parseFloat(editDeal?.current_price || "0");
    const priceDiff = newOld - newCurr;
    const percentDiff = newOld
      ? Number(((priceDiff / newOld) * 100).toFixed(2))
      : 0;

    let dealLevel = "";
    if (percentDiff >= 40 && percentDiff < 51) dealLevel = "Blistering deal";
    else if (percentDiff >= 51 && percentDiff < 61) dealLevel = "Scorching deal";
    else if (percentDiff >= 61 && percentDiff < 71) dealLevel = "Searing deal";
    else if (percentDiff >= 71) dealLevel = "Flaming deal";

    setEditDeal({
      ...editDeal,
      old_price: newOld,
      price_diff: priceDiff,
      percent_diff: percentDiff,
      deal_level: dealLevel,
    });
  }}
/>

<input
  type="number"
  className="border p-2 rounded"
  placeholder="Current Price"
  value={editDeal?.current_price || ""}
  onChange={(e) => {
    const newCurr = parseFloat(e.target.value || "0");
    const newOld = parseFloat(editDeal?.old_price || "0");
    const priceDiff = newOld - newCurr;
    const percentDiff = newOld
      ? Number(((priceDiff / newOld) * 100).toFixed(2))
      : 0;

    let dealLevel = "";
    if (percentDiff >= 40 && percentDiff < 49) dealLevel = "Blistering deal";
    else if (percentDiff >= 50 && percentDiff < 59) dealLevel = "Scorching deal";
    else if (percentDiff >= 60 && percentDiff < 69) dealLevel = "Searing deal";
    else if (percentDiff >= 70) dealLevel = "Flaming deal";

    setEditDeal({
      ...editDeal,
      current_price: newCurr,
      price_diff: priceDiff,
      percent_diff: percentDiff,
      deal_level: dealLevel,
    });
  }}
/>

              <input
                className="border p-2 rounded"
                placeholder="Product Link"
                value={editDeal?.product_link || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, product_link: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Image Link"
                value={editDeal?.image_link || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, image_link: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Review Link"
                value={editDeal?.review_link || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, review_link: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Coupon Code"
                value={editDeal?.coupon_code || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, coupon_code: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Shipping Cost"
                value={editDeal?.shipping_cost || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, shipping_cost: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Category"
                value={editDeal?.category || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, category: e.target.value })
                }
              />
			  
              <input
                className="border p-2 rounded"
                placeholder="Notes"
                value={editDeal?.notes || ""}
                onChange={(e) =>
                  setEditDeal({ ...editDeal, notes: e.target.value })
                }
              />
			  <select
  className="border p-2 rounded"
  value={editDeal?.holiday_tag || ""}
  onChange={(e) =>
    setEditDeal({ ...editDeal, holiday_tag: e.target.value })
  }
>
  {HOLIDAY_TAGS.map((tag) => (
    <option key={tag} value={tag}>
      {tag === "" ? "No holiday / event" : tag}
    </option>
  ))}
</select>


            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
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
