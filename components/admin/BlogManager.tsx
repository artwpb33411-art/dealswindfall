"use client";

import { useEffect, useState } from "react";

export default function BlogManager() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadPosts() {
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/blog/list");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to load posts");
      setPosts(data.posts || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-blue-600">Blog Management</h2>

        <a
          href="/admin/blog/new"
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          + New Blog Post
        </a>
      </div>

      {loading && <p className="text-gray-500">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Table */}
      {posts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Title</th>
                <th className="border p-2 text-left">Slug</th>
                <th className="border p-2 text-center">Status</th>
                <th className="border p-2 text-center">Updated</th>
                <th className="border p-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {posts.map((post: any) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="border p-2">{post.title_en}</td>
                  <td className="border p-2 text-sm">{post.slug}</td>
                  <td className="border p-2 text-center">
                    {post.published ? (
                      <span className="text-green-600 font-semibold">Published</span>
                    ) : (
                      <span className="text-orange-600 font-semibold">Draft</span>
                    )}
                  </td>
                  <td className="border p-2 text-center text-sm">
                    {new Date(post.updated_at).toLocaleString()}
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

      {!loading && posts.length === 0 && (
        <p className="text-gray-500">No blog posts yet. Create your first one above.</p>
      )}
    </div>
  );
}
