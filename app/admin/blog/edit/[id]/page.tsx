"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function EditBlogPage() {
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    loadPost();
  }, [id]);

  async function loadPost() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/blog/get?id=${id}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load");

      setForm(data.post);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveChanges() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Save failed");

      alert("Blog updated successfully!");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-4">Loading blog post...</p>;
  if (error) return <p className="p-4 text-red-600">{error}</p>;
  if (!form) return <p className="p-4">Post not found.</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-blue-600">
        Edit Blog Post
      </h1>

      {/* Slug */}
      <div>
        <label className="font-medium">Slug</label>
        <input
          className="w-full border p-2 rounded"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
        />
      </div>

      {/* Title EN */}
      <div>
        <label className="font-medium">Title (English)</label>
        <input
          className="w-full border p-2 rounded"
          value={form.title_en}
          onChange={(e) =>
            setForm({ ...form, title_en: e.target.value })
          }
        />
      </div>

      {/* Title ES */}
      <div>
        <label className="font-medium">Title (Spanish)</label>
        <input
          className="w-full border p-2 rounded"
          value={form.title_es || ""}
          onChange={(e) =>
            setForm({ ...form, title_es: e.target.value })
          }
        />
      </div>

      {/* Cover Image */}
      <div>
        <label className="font-medium">Cover Image URL</label>
        <input
          className="w-full border p-2 rounded"
          value={form.cover_image_url || ""}
          onChange={(e) =>
            setForm({ ...form, cover_image_url: e.target.value })
          }
        />
      </div>

      {/* Meta */}
      <div>
        <label className="font-medium">Meta Description (EN)</label>
        <textarea
          className="w-full border p-2 rounded min-h-[60px]"
          value={form.meta_description_en || ""}
          onChange={(e) =>
            setForm({
              ...form,
              meta_description_en: e.target.value,
            })
          }
        />
      </div>

      <div>
        <label className="font-medium">Meta Description (ES)</label>
        <textarea
          className="w-full border p-2 rounded min-h-[60px]"
          value={form.meta_description_es || ""}
          onChange={(e) =>
            setForm({
              ...form,
              meta_description_es: e.target.value,
            })
          }
        />
      </div>

      {/* Content EN */}
      <div>
        <label className="font-medium">Content (English HTML)</label>
        <textarea
          className="w-full border p-2 rounded min-h-[200px]"
          value={form.content_en || ""}
          onChange={(e) =>
            setForm({ ...form, content_en: e.target.value })
          }
        />
      </div>

      {/* Content ES */}
      <div>
        <label className="font-medium">Content (Spanish HTML)</label>
        <textarea
          className="w-full border p-2 rounded min-h-[200px]"
          value={form.content_es || ""}
          onChange={(e) =>
            setForm({ ...form, content_es: e.target.value })
          }
        />
      </div>

      {/* Published Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.published}
          onChange={(e) =>
            setForm({ ...form, published: e.target.checked })
          }
        />
        <label>Published</label>
      </div>

      {/* Save Button */}
      <button
        onClick={saveChanges}
        disabled={saving}
        className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      {error && <p className="text-red-600">{error}</p>}
    </div>
  );
}
