"use client";
import { useEffect, useState, useMemo } from "react";

export default function CouponList() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // Sorting
  const [sortField, setSortField] = useState("published_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  // Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (res.ok) setCoupons(data);
      else setError(data.error || "Failed to load coupons");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch("/api/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) setCoupons(coupons.filter((c) => c.id !== id));
      else alert(`❌ ${data.error || "Failed to delete"}`);
    } catch (e: any) {
      alert(`❌ ${e.message}`);
    }
  };

  const handleEdit = (coupon: any) => {
    setEditCoupon(coupon);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editCoupon) return;
    setSaving(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editCoupon.id,
          store_name: editCoupon.store_name ?? "",
          category: editCoupon.category ?? "",
          coupon_code: editCoupon.coupon_code ?? "",
          discount_type: editCoupon.discount_type ?? "",
          discount_value: editCoupon.discount_value ?? "",
          coupon_link: editCoupon.coupon_link ?? "",
          expire_date: editCoupon.expire_date ?? "",
          notes: editCoupon.notes ?? "",
          published_at: editCoupon.published_at ?? new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === editCoupon.id ? data.updated : c))
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
    fetchCoupons();
  }, []);

  // Filtered + Sorted
  const filteredCoupons = useMemo(() => {
    let result = coupons.filter((c) => {
      const matchesSearch =
        search === "" ||
        c.coupon_code?.toLowerCase().includes(search.toLowerCase());
      const matchesStore =
        storeFilter === "" ||
        c.store_name?.toLowerCase() === storeFilter.toLowerCase();
      const matchesCategory =
        categoryFilter === "" ||
        c.category?.toLowerCase() === categoryFilter.toLowerCase();
      const matchesDate =
        dateFilter === "" ||
        (c.published_at &&
          new Date(c.published_at).toISOString().split("T")[0] >= dateFilter);
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
  }, [coupons, search, storeFilter, categoryFilter, dateFilter, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredCoupons.length / rowsPerPage);
  const paginatedCoupons = filteredCoupons.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const storeNames = Array.from(new Set(coupons.map((c) => c.store_name))).filter(Boolean);
  const categories = Array.from(new Set(coupons.map((c) => c.category))).filter(Boolean);

  const resetFilters = () => {
    setSearch("");
    setStoreFilter("");
    setCategoryFilter("");
    setDateFilter("");
    setSortField("published_at");
    setSortOrder("desc");
    setPage(1);
  };

  if (loading) return <p>Loading coupons...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold text-blue-600 mb-3">
        All Published Coupons
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search by code..."
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
        <button
          onClick={fetchCoupons}
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
      <div className="overflow-x-auto border border-gray-200 rounded-md">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Store</th>
              <th className="p-2">Category</th>
              <th className="p-2">Coupon Code</th>
              <th className="p-2">Discount</th>
              <th className="p-2">Link</th>
              <th className="p-2">Expire Date</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCoupons.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-2">{c.store_name}</td>
                <td className="p-2">{c.category}</td>
                <td className="p-2">{c.coupon_code}</td>
                <td className="p-2">
                  {c.discount_type && c.discount_value
                    ? `${c.discount_value}${c.discount_type}`
                    : "—"}
                </td>
                <td className="p-2 text-blue-600 underline">
                  {c.coupon_link ? (
                    <a href={c.coupon_link} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2">
                  {c.expire_date
                    ? new Date(c.expire_date).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-2 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(c)}
                    className="px-2 py-1 text-blue-600 border border-blue-500 rounded hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="px-2 py-1 text-red-600 border border-red-500 rounded hover:bg-red-50"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="px-3 py-1 rounded-md border"
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="px-3 py-1 rounded-md border"
          >
            Next
          </button>
        </div>
      )}

      {/* 🪟 Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Edit Coupon</h3>

            <div className="grid grid-cols-2 gap-4">
              <input
                className="border p-2 rounded"
                placeholder="Store Name"
                value={editCoupon?.store_name || ""}
                onChange={(e) =>
                  setEditCoupon({ ...editCoupon, store_name: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Category"
                value={editCoupon?.category || ""}
                onChange={(e) =>
                  setEditCoupon({ ...editCoupon, category: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Coupon Code"
                value={editCoupon?.coupon_code || ""}
                onChange={(e) =>
                  setEditCoupon({ ...editCoupon, coupon_code: e.target.value })
                }
              />
              <input
                className="border p-2 rounded"
                placeholder="Discount Type (e.g. %, $)"
                value={editCoupon?.discount_type || ""}
                onChange={(e) =>
                  setEditCoupon({ ...editCoupon, discount_type: e.target.value })
                }
              />
              <input
                type="number"
                className="border p-2 rounded"
                placeholder="Discount Value"
                value={editCoupon?.discount_value || ""}
                onChange={(e) =>
                  setEditCoupon({
                    ...editCoupon,
                    discount_value: e.target.value,
                  })
                }
              />
              <input
                className="border p-2 rounded col-span-2"
                placeholder="Coupon Link (URL)"
                value={editCoupon?.coupon_link || ""}
                onChange={(e) =>
                  setEditCoupon({
                    ...editCoupon,
                    coupon_link: e.target.value,
                  })
                }
              />
              <input
                type="date"
                className="border p-2 rounded col-span-2"
                value={
                  editCoupon?.expire_date
                    ? new Date(editCoupon.expire_date).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setEditCoupon({ ...editCoupon, expire_date: e.target.value })
                }
              />
              <textarea
                className="border p-2 rounded col-span-2"
                placeholder="Notes"
                value={editCoupon?.notes || ""}
                onChange={(e) =>
                  setEditCoupon({ ...editCoupon, notes: e.target.value })
                }
              />
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
