"use client";

import { useState } from "react";

type GeneratedBlog = {
  title_en: string;
  title_es: string;
  slug: string;
  content_en: string;
  content_es: string;
  meta_title_en: string;
  meta_title_es: string;
  meta_description_en: string;
  meta_description_es: string;
  tags: string[];
};

export default function NewBlogPage() {
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [loadingAI, setLoadingAI] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedBlog | null>(null);
  const [published, setPublished] = useState(false);
  const [coverImageUrl, setCoverImageUrl] = useState("");

  async function handleGenerate() {
    setError(null);
    setLoadingAI(true);
    try {
      const res = await fetch("/api/blog/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic, notes }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate content");
      }

      const data = await res.json();
      setGenerated(data);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoadingAI(false);
    }
  }

  async function handleSave() {
    if (!generated) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/admin/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...generated,
          cover_image_url: coverImageUrl || null,
          tags: generated.tags || [],
          published,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Failed to save");

      alert("Blog post saved!");
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">New Blog Post (AI + SEO)</h1>

      {/* Step 1: Topic */}
      <div className="space-y-2">
        <label className="font-medium">Topic or Product URL</label>
        <input
          className="w-full border rounded p-2"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Best Amazon deals today, or a product URL"
        />
      </div>

      {/* Step 2: Notes */}
      <div className="space-y-2">
        <label className="font-medium">Notes (optional)</label>
        <textarea
          className="w-full border rounded p-2 min-h-[80px]"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Anything specific to mention, key products, etc."
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={loadingAI || !topic}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loadingAI ? "Generating with AI..." : "Generate with AI"}
      </button>

      {error && <p className="text-red-600">{error}</p>}

      {generated && (
        <div className="border-t pt-4 space-y-4">
          <h2 className="text-xl font-semibold">AI Draft</h2>

          {/* Basic fields to review/edit */}
          <div className="space-y-2">
            <label className="font-medium">Slug</label>
            <input
              className="w-full border rounded p-2"
              value={generated.slug}
              onChange={(e) =>
                setGenerated({ ...generated, slug: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium">Title (English)</label>
            <input
              className="w-full border rounded p-2"
              value={generated.title_en}
              onChange={(e) =>
                setGenerated({ ...generated, title_en: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium">Title (Spanish)</label>
            <input
              className="w-full border rounded p-2"
              value={generated.title_es}
              onChange={(e) =>
                setGenerated({ ...generated, title_es: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium">Cover Image URL (optional)</label>
            <input
              className="w-full border rounded p-2"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium">Meta Description (English)</label>
            <textarea
              className="w-full border rounded p-2 min-h-[60px]"
              value={generated.meta_description_en}
              onChange={(e) =>
                setGenerated({
                  ...generated,
                  meta_description_en: e.target.value,
                })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="font-medium">Meta Description (Spanish)</label>
            <textarea
              className="w-full border rounded p-2 min-h-[60px]"
              value={generated.meta_description_es}
              onChange={(e) =>
                setGenerated({
                  ...generated,
                  meta_description_es: e.target.value,
                })
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="published"
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
            />
            <label htmlFor="published">Publish now</label>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded bg-green-600 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Blog Post"}
          </button>
        </div>
      )}
    </div>
  );
}
