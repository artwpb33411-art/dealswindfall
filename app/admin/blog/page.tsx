"use client";

import { useEffect, useState } from "react";

type BlogPost = {
  id: number;
  slug: string;
  title_en: string;
  published: boolean;
  published_at: string | null;
  updated_at: string;
};

export default function AdminBlogListPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadPosts() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/blog/list"); // We will create this small API below
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load posts");

      setPosts(data.posts || []);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Blog Posts</h1>

        <a
          href="/admin/blog/new"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + New Blog Post
        </a>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && posts.length === 0 && (
        <p className="text-gray-500">No blog posts found.</p>
      )}

      {/* Blog table */}
      {posts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Title</th>
                <th className="border p-2 text-left">Slug</th>
                <th className="border p-2 text-center">Status</th>
                <th className="border p-2 text-center">Published At</th>
                <th className="border p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="border p-2">{post.title_en}</td>
                  <td className="border p-2 text-sm text-gray-600">
                    {post.slug}
                  </td>
                  <td className="border p-2 text-center">
                    {post.published ? (
                      <span className="text-green-600 font-semibold">
                        Published
                      </span>
                    ) : (
                      <span className="text-orange-600 font-semibold">
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="border p-2 text-center text-sm">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleString()
                      : "-"}
                  </td>
                  <td className="border p-2 text-center">
                    <a
                      href={`/admin/blog/edit/${post.id}`}
                      className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-black"
                    >
                      Edit
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
