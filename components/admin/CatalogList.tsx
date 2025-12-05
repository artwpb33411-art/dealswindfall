"use client";
import { useEffect, useState, useMemo } from "react";

export default function CatalogList() {
  const [catalogs, setCatalogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔍 Filters
  const [search, setSearch] = useState("");
  const [storeFilter, setStoreFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  // ↕️ Sorting
  const [sortField, setSortField] = useState("published_at");
  const [sortOrder, setSortOrder] = useState("desc");

  // 📄 Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 20;

  // ✏️ Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editCatalog, setEditCatalog] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const fetchCatalogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/catalogs");
      const data = await res.json();
      if (res.ok) setCatalogs(data);
      else setError(data.error || "Failed to load catalogs");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this catalog?")) return;
    try {
      const res = await fetch("/api/catalogs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (res.ok) {
        setCatalogs(catalogs.filter((c) => c.id !== id));
      } else {
        alert(`❌ ${data.error || "Failed to delete"}`);
      }
    } catch (e: any) {
      alert(`❌ ${e.message}`);
    }
  };

  const handleEdit = (catalog: any) => {
    setEditCatalog(catalog);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editCatalog) return;
    setSaving(true);
    try {
      const res = await fetch("/api/catalogs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editCatalog.id,
          store_name: editCatalog.store_name ?? "",
          start_date: editCatalog.start_date ?? "",
          end_date: editCatalog.end_date ?? "",
          catalog_link: editCatalog.catalog_link ?? "",
          screenshot_link: editCatalog.screenshot_link ?? "",
          published_at: editCatalog.published_at ?? new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCatalogs((prev) =>
          prev.map((c) => (c.id === editCatalog.id ? data.updated : c))
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
    fetchCatalogs();
  }, []);

  // 🧮 Filtered and Sorted
  const filteredCatalogs = useMemo(() => {
    let result = catalogs.filter((cat) => {
      const matchesSearch =
        search === "" ||
        cat.store_name?.toLowerCase().includes(search.toLowerCase());
      const matchesStore =
        storeFilter === "" ||
        cat.store_name?.toLowerCase() === storeFilter.toLowerCase();
      const matchesDate =
        dateFilter === "" ||
        (cat.published_at &&
          new Date(cat.published_at).toISOString().split("T")[0] >=
            dateFilter);
      return matchesSearch && matchesStore && matchesDate;
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
  }, [catalogs, search, storeFilter, dateFilter, sortField, sortOrder]);

  // 📄 Pagination logic
  const totalPages = Math.ceil(filteredCatalogs.length / rowsPerPage);
  const paginatedCatalogs = filteredCatalogs.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const storeNames = Array.from(
    new Set(catalogs.map((c) => c.store_name))
  ).filter(Boolean);

  const resetFilters = () => {
    setSearch("");
    setStoreFilter("");
    setDateFilter("");
    setSortField("published_at");
    setSortOrder("desc");
    setPage(1);
  };

  if (loading) return <p className="text-gray-600">Loading catalogs...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-6 relative">
      <h2 className="text-xl font-semibold text-blue-600 mb-3">
        All Published Catalogs
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 items-center">
        <input
          type="text"
          placeholder="Search store name..."
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

        <input
          type="date"
          className="border rounded-md p-2"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        {/* Sort controls */}
        <select
          className="border rounded-md p-2"
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
        >
          <option value="published_at">Sort by Published Date</option>
          <option value="store_name">Sort by Store</option>
          <option value="start_date">Sort by Start Date</option>
          <option value="end_date">Sort by End Date</option>
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
          onClick={fetchCatalogs}
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
              <th className="p-2">Start Date</th>
              <th className="p-2">End Date</th>
              <th className="p-2">Catalog Link</th>
              <th className="p-2">Screenshot</th>
              <th className="p-2">Published</th>
              <th className="p-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedCatalogs.map((cat) => (
              <tr key={cat.id} className="border-t hover:bg-gray-50 transition">
                <td className="p-2">{cat.store_name}</td>
                <td className="p-2">
                  {cat.start_date
                    ? new Date(cat.start_date).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-2">
                  {cat.end_date
                    ? new Date(cat.end_date).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-2 text-blue-600 underline">
                  <a
                    href={cat.catalog_link}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View
                  </a>
                </td>
                <td className="p-2 text-blue-600 underline">
                  {cat.screenshot_link ? (
                    <a
                      href={cat.screenshot_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="p-2 text-gray-500">
                  {cat.published_at
                    ? new Date(cat.published_at).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-2 text-right space-x-2">
                  <button
                    onClick={() => handleEdit(cat)}
                    className="px-2 py-1 text-blue-600 border border-blue-500 rounded hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
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
            <h3 className="text-lg font-semibold mb-4">Edit Catalog</h3>

            <div className="grid grid-cols-2 gap-4">
              <input
                className="border p-2 rounded"
                placeholder="Store Name"
                value={editCatalog?.store_name || ""}
                onChange={(e) =>
                  setEditCatalog({ ...editCatalog, store_name: e.target.value })
                }
              />
              <input
                type="date"
                className="border p-2 rounded"
                value={
                  editCatalog?.start_date
                    ? new Date(editCatalog.start_date)
                        .toISOString()
                        .split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setEditCatalog({ ...editCatalog, start_date: e.target.value })
                }
              />
              <input
                type="date"
                className="border p-2 rounded"
                value={
                  editCatalog?.end_date
                    ? new Date(editCatalog.end_date).toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setEditCatalog({ ...editCatalog, end_date: e.target.value })
                }
              />
              <input
                className="border p-2 rounded col-span-2"
                placeholder="Catalog Link (URL)"
                value={editCatalog?.catalog_link || ""}
                onChange={(e) =>
                  setEditCatalog({
                    ...editCatalog,
                    catalog_link: e.target.value,
                  })
                }
              />
              <input
                className="border p-2 rounded col-span-2"
                placeholder="Screenshot Link"
                value={editCatalog?.screenshot_link || ""}
                onChange={(e) =>
                  setEditCatalog({
                    ...editCatalog,
                    screenshot_link: e.target.value,
                  })
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
